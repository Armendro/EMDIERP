from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from bson import ObjectId

from models.stock_movement import StockMovementCreate, StockMovementResponse
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/stock-movements", tags=["Inventory"])

# Get database
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

@router.get("", response_model=List[StockMovementResponse])
async def get_stock_movements(current_user: dict = Depends(get_current_user)):
    """
    Get all stock movements
    """
    movements = await db.stock_movements.find().sort("date", -1).to_list(1000)
    return [
        {
            "id": str(movement["_id"]),
            "product_id": movement["product_id"],
            "product_name": movement["product_name"],
            "type": movement["type"],
            "quantity": movement["quantity"],
            "date": movement["date"],
            "reference": movement["reference"],
            "location": movement["location"],
            "created_by": movement["created_by"],
            "created_at": movement["created_at"]
        }
        for movement in movements
    ]

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_stock_movement(
    movement_data: StockMovementCreate,
    current_user: dict = Depends(require_roles(["admin", "manager"]))
):
    """
    Create stock movement (Admin and Manager only)
    """
    # Verify product exists
    product = await db.products.find_one({"_id": ObjectId(movement_data.product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update product stock
    stock_change = movement_data.quantity if movement_data.type == "in" else -movement_data.quantity
    new_stock = product["stock"] + stock_change
    
    if new_stock < 0:
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock for this operation"
        )
    
    await db.products.update_one(
        {"_id": ObjectId(movement_data.product_id)},
        {
            "$set": {"stock": new_stock, "updated_at": datetime.utcnow()}
        }
    )
    
    # Create movement record
    movement_dict = movement_data.dict()
    movement_dict["date"] = datetime.utcnow()
    movement_dict["created_by"] = str(current_user["_id"])
    movement_dict["created_at"] = datetime.utcnow()
    
    result = await db.stock_movements.insert_one(movement_dict)
    
    return {
        "message": "Stock movement recorded successfully",
        "movement_id": str(result.inserted_id)
    }