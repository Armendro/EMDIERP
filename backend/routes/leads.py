from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional

from datetime import datetime
from bson import ObjectId

from models.lead import LeadCreate, LeadUpdate, LeadResponse
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/leads", tags=["CRM"])

# Get database
from database import db

@router.get("", response_model=List[LeadResponse])
async def get_leads(current_user: dict = Depends(get_current_user)):
    """
    Get all leads
    """
    leads = await db.leads.find().to_list(1000)
    return [
        {
            "id": str(lead["_id"]),
            "name": lead["name"],
            "contact": lead["contact"],
            "email": lead["email"],
            "phone": lead["phone"],
            "stage": lead["stage"],
            "priority": lead["priority"],
            "expected_revenue": lead["expected_revenue"],
            "probability": lead["probability"],
            "assigned_to": lead["assigned_to"],
            "notes": lead.get("notes"),
            "created_at": lead["created_at"],
            "updated_at": lead["updated_at"]
        }
        for lead in leads
    ]

@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    """
    Get lead by ID
    """
    lead = await db.leads.find_one({"_id": ObjectId(lead_id)})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return {
        "id": str(lead["_id"]),
        "name": lead["name"],
        "contact": lead["contact"],
        "email": lead["email"],
        "phone": lead["phone"],
        "stage": lead["stage"],
        "priority": lead["priority"],
        "expected_revenue": lead["expected_revenue"],
        "probability": lead["probability"],
        "assigned_to": lead["assigned_to"],
        "notes": lead.get("notes"),
        "created_at": lead["created_at"],
        "updated_at": lead["updated_at"]
    }

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_lead(
    lead_data: LeadCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new lead
    """
    lead_dict = lead_data.dict()
    if not lead_dict.get("assigned_to"):
        lead_dict["assigned_to"] = str(current_user["_id"])
    lead_dict["created_at"] = datetime.utcnow()
    lead_dict["updated_at"] = datetime.utcnow()
    
    result = await db.leads.insert_one(lead_dict)
    
    return {
        "message": "Lead created successfully",
        "lead_id": str(result.inserted_id)
    }

@router.put("/{lead_id}")
async def update_lead(
    lead_id: str,
    lead_data: LeadUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update lead
    """
    update_data = {k: v for k, v in lead_data.dict(exclude_unset=True).items()}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.leads.update_one(
        {"_id": ObjectId(lead_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return {"message": "Lead updated successfully"}

@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: str,
    current_user: dict = Depends(require_roles(["admin", "manager"]))
):
    """
    Delete lead (Admin and Manager only)
    """
    result = await db.leads.delete_one({"_id": ObjectId(lead_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return {"message": "Lead deleted successfully"}