from fastapi import APIRouter, HTTPException, status, Depends
from typing import List

from datetime import datetime
from bson import ObjectId

from models.order import OrderCreate, OrderUpdate, OrderResponse, OrderStatus
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/orders", tags=["Sales"])

# Get database
from database import db

async def generate_order_number():
    """Generate next order number"""
    last_order = await db.orders.find_one(sort=[("created_at", -1)])
    if last_order and "order_number" in last_order:
        num = int(last_order["order_number"].split("-")[1]) + 1
    else:
        num = 1
    return f"SO-{num:03d}"

async def create_stock_movement(product_id: str, product_name: str, quantity: int, reference: str, user_id: str):
    """Create stock movement record"""
    movement = {
        "product_id": product_id,
        "product_name": product_name,
        "type": "out",
        "quantity": quantity,
        "date": datetime.utcnow(),
        "reference": reference,
        "location": "Main Warehouse",
        "created_by": user_id,
        "created_at": datetime.utcnow()
    }
    await db.stock_movements.insert_one(movement)

async def create_journal_entries(order_id: str, order_number: str, total: float, customer_name: str, user_id: str):
    """Create journal entries for the order"""
    entries = [
        {
            "date": datetime.utcnow(),
            "reference": order_number,
            "description": f"Invoice for {customer_name}",
            "account_id": "ar_account",
            "account_name": "Accounts Receivable",
            "debit": total,
            "credit": 0,
            "status": "posted",
            "created_by": user_id,
            "created_at": datetime.utcnow()
        },
        {
            "date": datetime.utcnow(),
            "reference": order_number,
            "description": f"Revenue from {customer_name}",
            "account_id": "revenue_account",
            "account_name": "Revenue",
            "debit": 0,
            "credit": total,
            "status": "posted",
            "created_by": user_id,
            "created_at": datetime.utcnow()
        }
    ]
    await db.journal_entries.insert_many(entries)

@router.get("", response_model=List[OrderResponse])
async def get_orders(current_user: dict = Depends(get_current_user)):
    """
    Get all orders
    """
    orders = await db.orders.find().to_list(1000)
    return [
        {
            "id": str(order["_id"]),
            "order_number": order["order_number"],
            "customer_id": order["customer_id"],
            "customer_name": order["customer_name"],
            "date": order["date"],
            "status": order["status"],
            "items": order["items"],
            "total": order["total"],
            "approved_by": order.get("approved_by"),
            "created_by": order["created_by"],
            "created_at": order["created_at"],
            "updated_at": order["updated_at"]
        }
        for order in orders
    ]

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """
    Get order by ID
    """
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "id": str(order["_id"]),
        "order_number": order["order_number"],
        "customer_id": order["customer_id"],
        "customer_name": order["customer_name"],
        "date": order["date"],
        "status": order["status"],
        "items": order["items"],
        "total": order["total"],
        "approved_by": order.get("approved_by"),
        "created_by": order["created_by"],
        "created_at": order["created_at"],
        "updated_at": order["updated_at"]
    }

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new order
    """
    # Calculate total
    total = sum(item.quantity * item.price for item in order_data.items)
    
    order_dict = order_data.dict()
    order_dict["order_number"] = await generate_order_number()
    order_dict["date"] = datetime.utcnow()
    order_dict["total"] = total
    order_dict["created_by"] = str(current_user["_id"])
    order_dict["created_at"] = datetime.utcnow()
    order_dict["updated_at"] = datetime.utcnow()
    
    result = await db.orders.insert_one(order_dict)
    
    return {
        "message": "Order created successfully",
        "order_id": str(result.inserted_id),
        "order_number": order_dict["order_number"]
    }

@router.put("/{order_id}")
async def update_order(
    order_id: str,
    order_data: OrderUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update order
    """
    update_data = {k: v for k, v in order_data.dict(exclude_unset=True).items()}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Recalculate total if items changed
    if "items" in update_data:
        update_data["total"] = sum(item["quantity"] * item["price"] for item in update_data["items"])
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order updated successfully"}

@router.put("/{order_id}/approve")
async def approve_order(
    order_id: str,
    current_user: dict = Depends(require_roles(["admin", "manager"]))
):
    """
    Approve order (Admin and Manager only)
    This triggers:
    1. Status change to 'approved'
    2. Stock deduction
    3. Journal entries creation
    """
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["status"] != "pending_approval":
        raise HTTPException(
            status_code=400,
            detail="Only orders with 'pending_approval' status can be approved"
        )
    
    # Update stock for each item
    for item in order["items"]:
        product = await db.products.find_one({"_id": ObjectId(item["product_id"])})
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {item['product_name']} not found")
        
        if product["stock"] < item["quantity"]:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {item['product_name']}. Available: {product['stock']}, Required: {item['quantity']}"
            )
        
        # Deduct stock
        await db.products.update_one(
            {"_id": ObjectId(item["product_id"])},
            {
                "$inc": {"stock": -item["quantity"]},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        # Create stock movement
        await create_stock_movement(
            item["product_id"],
            item["product_name"],
            item["quantity"],
            order["order_number"],
            str(current_user["_id"])
        )
    
    # Create journal entries
    await create_journal_entries(
        str(order["_id"]),
        order["order_number"],
        order["total"],
        order["customer_name"],
        str(current_user["_id"])
    )
    
    # Update order status
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {
            "$set": {
                "status": "approved",
                "approved_by": str(current_user["_id"]),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Order approved successfully"}

@router.put("/{order_id}/reject")
async def reject_order(
    order_id: str,
    current_user: dict = Depends(require_roles(["admin", "manager"]))
):
    """
    Reject order (Admin and Manager only)
    """
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["status"] != "pending_approval":
        raise HTTPException(
            status_code=400,
            detail="Only orders with 'pending_approval' status can be rejected"
        )
    
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {
            "$set": {
                "status": "cancelled",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Order rejected successfully"}

@router.delete("/{order_id}")
async def delete_order(
    order_id: str,
    current_user: dict = Depends(require_roles(["admin"]))
):
    """
    Delete order (Admin only)
    """
    result = await db.orders.delete_one({"_id": ObjectId(order_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order deleted successfully"}
