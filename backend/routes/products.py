from fastapi import APIRouter, HTTPException, status, Depends
from typing import List

from datetime import datetime
from bson import ObjectId

from models.product import ProductCreate, ProductUpdate, ProductResponse
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/products", tags=["Inventory"])

# Get database
from database import db

@router.get("", response_model=List[ProductResponse])
async def get_products(current_user: dict = Depends(get_current_user)):
    """
    Get all products
    """
    products = await db.products.find().to_list(1000)
    return [
        {
            "id": str(product["_id"]),
            "name": product["name"],
            "sku": product["sku"],
            "category": product["category"],
            "family": product.get("family"),
            "sub_family": product.get("sub_family"),
            "description": product.get("description"),
            "price": product.get("price"),
            "cost": product.get("cost"),
            "stock": product.get("stock"),
            "reorder_level": product.get("reorder_level"),
            "supplier": product.get("supplier"),
            "default_supplier_id": product.get("default_supplier_id"),
            "status": product.get("status", "active"),
            "variants": product.get("variants", []),
            "created_at": product["created_at"],
            "updated_at": product["updated_at"]
        }
        for product in products
    ]

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str, current_user: dict = Depends(get_current_user)):
    """
    Get product by ID
    """
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "id": str(product["_id"]),
        "name": product["name"],
        "sku": product["sku"],
        "category": product["category"],
        "family": product.get("family"),
        "sub_family": product.get("sub_family"),
        "description": product.get("description"),
        "price": product.get("price"),
        "cost": product.get("cost"),
        "stock": product.get("stock"),
        "reorder_level": product.get("reorder_level"),
        "supplier": product.get("supplier"),
        "status": product.get("status", "active"),
        "variants": product.get("variants", []),
        "created_at": product["created_at"],
        "updated_at": product["updated_at"]
    }

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(require_roles(["admin", "manager"]))
):
    """
    Create a new product
    """
    # Check if SKU already exists
    existing_product = await db.products.find_one({"sku": product_data.sku})
    if existing_product:
        raise HTTPException(
            status_code=400,
            detail="Product with this SKU already exists"
        )
    
    product_dict = product_data.dict()
    
    # Gerar IDs para variantes se não tiverem
    if product_dict.get("variants"):
        for i, variant in enumerate(product_dict["variants"]):
            if not variant.get("variant_id"):
                variant["variant_id"] = f"VAR-{i+1:03d}-{datetime.utcnow().timestamp()}"
    
    product_dict["created_at"] = datetime.utcnow()
    product_dict["updated_at"] = datetime.utcnow()
    
    result = await db.products.insert_one(product_dict)
    
    return {
        "message": "Product created successfully",
        "product_id": str(result.inserted_id)
    }

@router.put("/{product_id}")
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_user: dict = Depends(require_roles(["admin", "manager"]))
):
    """
    Update product
    """
    update_data = {k: v for k, v in product_data.dict(exclude_unset=True).items()}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product updated successfully"}

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user: dict = Depends(require_roles(["admin"]))
):
    """
    Delete product (Admin only)
    """
    result = await db.products.delete_one({"_id": ObjectId(product_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}
