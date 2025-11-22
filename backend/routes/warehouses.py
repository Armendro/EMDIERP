from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId

from models.warehouse import WarehouseCreate, WarehouseUpdate, WarehouseResponse
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/warehouses", tags=["Warehouses"])

from database import db

@router.get("", response_model=List[WarehouseResponse])
async def get_warehouses(current_user: dict = Depends(get_current_user)):
    """
    Get all warehouses
    """
    warehouses = await db.warehouses.find().to_list(1000)
    return [
        {
            "id": str(wh["_id"]),
            "code": wh["code"],
            "name": wh["name"],
            "store_id": wh.get("store_id"),
            "status": wh["status"],
            "created_at": wh["created_at"],
            "updated_at": wh["updated_at"]
        }
        for wh in warehouses
    ]

@router.get("/{warehouse_id}", response_model=WarehouseResponse)
async def get_warehouse(warehouse_id: str, current_user: dict = Depends(get_current_user)):
    """
    Get warehouse by ID
    """
    warehouse = await db.warehouses.find_one({"_id": ObjectId(warehouse_id)})
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    return {
        "id": str(warehouse["_id"]),
        "code": warehouse["code"],
        "name": warehouse["name"],
        "store_id": warehouse.get("store_id"),
        "status": warehouse["status"],
        "created_at": warehouse["created_at"],
        "updated_at": warehouse["updated_at"]
    }

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_warehouse(
    warehouse_data: WarehouseCreate,
    current_user: dict = Depends(require_roles(["admin", "manager"]))
):
    """
    Create a new warehouse
    """
    # Check if code already exists
    existing_wh = await db.warehouses.find_one({"code": warehouse_data.code})
    if existing_wh:
        raise HTTPException(
            status_code=400,
            detail="Warehouse with this code already exists"
        )
    
    warehouse_dict = warehouse_data.dict()
    warehouse_dict["created_at"] = datetime.utcnow()
    warehouse_dict["updated_at"] = datetime.utcnow()
    
    result = await db.warehouses.insert_one(warehouse_dict)
    
    return {
        "message": "Warehouse created successfully",
        "warehouse_id": str(result.inserted_id)
    }

@router.put("/{warehouse_id}")
async def update_warehouse(
    warehouse_id: str,
    warehouse_data: WarehouseUpdate,
    current_user: dict = Depends(require_roles(["admin", "manager"]))
):
    """
    Update warehouse
    """
    update_data = {k: v for k, v in warehouse_data.dict(exclude_unset=True).items()}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.warehouses.update_one(
        {"_id": ObjectId(warehouse_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    return {"message": "Warehouse updated successfully"}

@router.delete("/{warehouse_id}")
async def delete_warehouse(
    warehouse_id: str,
    current_user: dict = Depends(require_roles(["admin"]))
):
    """
    Delete warehouse (soft delete - marks as inactive)
    """
    result = await db.warehouses.update_one(
        {"_id": ObjectId(warehouse_id)},
        {"$set": {"status": "inactive", "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    return {"message": "Warehouse marked as inactive"}
