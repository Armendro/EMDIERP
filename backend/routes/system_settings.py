from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime

from models.system_settings import SystemSettingsUpdate, SystemSettingsResponse
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/settings", tags=["System Settings"])

from database import db

@router.get("", response_model=SystemSettingsResponse)
async def get_settings(current_user: dict = Depends(get_current_user)):
    """
    Get system settings (creates default if not exists)
    """
    settings = await db.system_settings.find_one({})
    
    if not settings:
        # Create default settings
        default_settings = {
            "company_name": "Empresa",
            "company_email": "geral@empresa.pt",
            "company_phone": "",
            "company_website": "",
            "company_address": "",
            "base_currency": "EUR",
            "timezone": "Europe/Lisbon",
            "updated_at": datetime.utcnow()
        }
        result = await db.system_settings.insert_one(default_settings)
        settings = await db.system_settings.find_one({"_id": result.inserted_id})
    
    return {
        "id": str(settings["_id"]),
        "company_name": settings["company_name"],
        "company_email": settings["company_email"],
        "company_phone": settings.get("company_phone", ""),
        "company_website": settings.get("company_website", ""),
        "company_address": settings.get("company_address", ""),
        "base_currency": settings["base_currency"],
        "timezone": settings["timezone"],
        "updated_at": settings["updated_at"]
    }

@router.put("")
async def update_settings(
    settings_data: SystemSettingsUpdate,
    current_user: dict = Depends(require_roles(["admin"]))
):
    """
    Update system settings
    """
    update_data = {k: v for k, v in settings_data.dict(exclude_unset=True).items()}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()
    
    # Get existing settings or create new
    settings = await db.system_settings.find_one({})
    
    if settings:
        await db.system_settings.update_one(
            {"_id": settings["_id"]},
            {"$set": update_data}
        )
    else:
        # Create new with provided data
        new_settings = {
            "company_name": "Empresa",
            "company_email": "geral@empresa.pt",
            "company_phone": "",
            "company_website": "",
            "company_address": "",
            "base_currency": "EUR",
            "timezone": "Europe/Lisbon",
            **update_data
        }
        await db.system_settings.insert_one(new_settings)
    
    return {"message": "Settings updated successfully"}
