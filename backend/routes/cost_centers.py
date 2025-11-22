from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from models.cost_center import CostCenterCreate, CostCenterUpdate, CostCenterResponse
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/cost-centers", tags=["Cost Centers"])

from database import db

@router.get("", response_model=List[CostCenterResponse])
async def get_cost_centers(
    type: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all cost centers with optional type filter
    """
    query = {}
    if type:
        query["type"] = type
    
    cost_centers = await db.cost_centers.find(query).to_list(1000)
    
    return [
        {
            "id": str(cc["_id"]),
            "code": cc["code"],
            "name": cc["name"],
            "type": cc["type"],
            "store_id": cc.get("store_id"),
            "status": cc["status"],
            "created_at": cc["created_at"],
            "updated_at": cc["updated_at"]
        }
        for cc in cost_centers
    ]

@router.get("/{cost_center_id}", response_model=CostCenterResponse)
async def get_cost_center(
    cost_center_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get cost center by ID
    """
    cost_center = await db.cost_centers.find_one({"_id": ObjectId(cost_center_id)})
    if not cost_center:
        raise HTTPException(status_code=404, detail="Cost center not found")
    
    return {
        "id": str(cost_center["_id"]),
        "code": cost_center["code"],
        "name": cost_center["name"],
        "type": cost_center["type"],
        "store_id": cost_center.get("store_id"),
        "status": cost_center["status"],
        "created_at": cost_center["created_at"],
        "updated_at": cost_center["updated_at"]
    }

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_cost_center(
    cost_center_data: CostCenterCreate,
    current_user: dict = Depends(require_roles(["admin", "manager"]))
):
    """
    Create a new cost center
    """
    # Check if code already exists
    existing_cc = await db.cost_centers.find_one({"code": cost_center_data.code})
    if existing_cc:
        raise HTTPException(
            status_code=400,
            detail="Cost center with this code already exists"
        )
    
    cost_center_dict = cost_center_data.dict()
    cost_center_dict["created_at"] = datetime.utcnow()
    cost_center_dict["updated_at"] = datetime.utcnow()
    
    result = await db.cost_centers.insert_one(cost_center_dict)
    
    return {
        "message": "Cost center created successfully",
        "cost_center_id": str(result.inserted_id)
    }

@router.put("/{cost_center_id}")
async def update_cost_center(
    cost_center_id: str,
    cost_center_data: CostCenterUpdate,
    current_user: dict = Depends(require_roles(["admin", "manager"]))
):
    """
    Update cost center
    """
    update_data = {k: v for k, v in cost_center_data.dict(exclude_unset=True).items()}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.cost_centers.update_one(
        {"_id": ObjectId(cost_center_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cost center not found")
    
    return {"message": "Cost center updated successfully"}

@router.delete("/{cost_center_id}")
async def delete_cost_center(
    cost_center_id: str,
    current_user: dict = Depends(require_roles(["admin"]))
):
    """
    Delete cost center (soft delete - marks as inactive)
    """
    result = await db.cost_centers.update_one(
        {"_id": ObjectId(cost_center_id)},
        {"$set": {"status": "inactive", "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cost center not found")
    
    return {"message": "Cost center marked as inactive"}
