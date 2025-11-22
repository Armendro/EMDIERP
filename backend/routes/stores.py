from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId

from models.store import StoreCreate, StoreUpdate, StoreResponse
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/stores", tags=["Stores"])

from database import db

@router.get("", response_model=List[StoreResponse])
async def get_stores(current_user: dict = Depends(get_current_user)):
    """
    Get all stores
    """
    stores = await db.stores.find().to_list(1000)
    return [
        {
            "id": str(store["_id"]),
            "code": store["code"],
            "name": store["name"],
            "address_line1": store["address_line1"],
            "postal_code": store["postal_code"],
            "city": store["city"],
            "country": store["country"],
            "revenue_cost_center_id": store.get("revenue_cost_center_id"),
            "status": store["status"],
            "created_at": store["created_at"],
            "updated_at": store["updated_at"]
        }
        for store in stores
    ]

@router.get("/{store_id}", response_model=StoreResponse)
async def get_store(store_id: str, current_user: dict = Depends(get_current_user)):
    """
    Get store by ID
    """
    store = await db.stores.find_one({"_id": ObjectId(store_id)})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    return {
        "id": str(store["_id"]),
        "code": store["code"],
        "name": store["name"],
        "address_line1": store["address_line1"],
        "postal_code": store["postal_code"],
        "city": store["city"],
        "country": store["country"],
        "revenue_cost_center_id": store.get("revenue_cost_center_id"),
        "status": store["status"],
        "created_at": store["created_at"],
        "updated_at": store["updated_at"]
    }

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_store(
    store_data: StoreCreate,
    current_user: dict = Depends(require_roles(["admin", "manager"]))
):
    """
    Create a new store
    """
    # Check if code already exists
    existing_store = await db.stores.find_one({"code": store_data.code})
    if existing_store:
        raise HTTPException(
            status_code=400,
            detail="Store with this code already exists"
        )
    
    store_dict = store_data.dict()
    store_dict["created_at"] = datetime.utcnow()
    store_dict["updated_at"] = datetime.utcnow()
    
    result = await db.stores.insert_one(store_dict)
    
    return {
        "message": "Store created successfully",
        "store_id": str(result.inserted_id)
    }

@router.put("/{store_id}")
async def update_store(
    store_id: str,
    store_data: StoreUpdate,
    current_user: dict = Depends(require_roles(["admin", "manager"]))
):
    """
    Update store
    """
    update_data = {k: v for k, v in store_data.dict(exclude_unset=True).items()}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.stores.update_one(
        {"_id": ObjectId(store_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Store not found")
    
    return {"message": "Store updated successfully"}

@router.delete("/{store_id}")
async def delete_store(
    store_id: str,
    current_user: dict = Depends(require_roles(["admin"]))
):
    """
    Delete store (soft delete - marks as inactive)
    """
    result = await db.stores.update_one(
        {"_id": ObjectId(store_id)},
        {"$set": {"status": "inactive", "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Store not found")
    
    return {"message": "Store marked as inactive"}
