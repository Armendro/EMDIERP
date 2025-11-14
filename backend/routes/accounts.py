from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from bson import ObjectId

from models.account import AccountCreate, AccountUpdate, AccountResponse
from models.journal_entry import JournalEntryCreate, JournalEntryResponse
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/accounts", tags=["Accounting"])

# Get database
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

@router.get("", response_model=List[AccountResponse])
async def get_accounts(current_user: dict = Depends(require_roles(["admin", "manager"]))):
    """
    Get all accounts
    """
    accounts = await db.accounts.find().to_list(1000)
    return [
        {
            "id": str(account["_id"]),
            "code": account["code"],
            "name": account["name"],
            "type": account["type"],
            "balance": account["balance"],
            "created_at": account["created_at"],
            "updated_at": account["updated_at"]
        }
        for account in accounts
    ]

@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(account_id: str, current_user: dict = Depends(require_roles(["admin", "manager"]))):
    """
    Get account by ID
    """
    account = await db.accounts.find_one({"_id": ObjectId(account_id)})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    return {
        "id": str(account["_id"]),
        "code": account["code"],
        "name": account["name"],
        "type": account["type"],
        "balance": account["balance"],
        "created_at": account["created_at"],
        "updated_at": account["updated_at"]
    }

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_account(
    account_data: AccountCreate,
    current_user: dict = Depends(require_roles(["admin"]))
):
    """
    Create new account (Admin only)
    """
    # Check if code exists
    existing = await db.accounts.find_one({"code": account_data.code})
    if existing:
        raise HTTPException(status_code=400, detail="Account code already exists")
    
    account_dict = account_data.dict()
    account_dict["created_at"] = datetime.utcnow()
    account_dict["updated_at"] = datetime.utcnow()
    
    result = await db.accounts.insert_one(account_dict)
    
    return {
        "message": "Account created successfully",
        "account_id": str(result.inserted_id)
    }

@router.put("/{account_id}")
async def update_account(
    account_id: str,
    account_data: AccountUpdate,
    current_user: dict = Depends(require_roles(["admin"]))
):
    """
    Update account (Admin only)
    """
    update_dict = {k: v for k, v in account_data.dict(exclude_unset=True).items()}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.accounts.update_one(
        {"_id": ObjectId(account_id)},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Account not found")
    
    return {"message": "Account updated successfully"}

# Journal Entries
@router.get("/journal-entries/all", response_model=List[JournalEntryResponse])
async def get_journal_entries(current_user: dict = Depends(require_roles(["admin", "manager"]))):
    """
    Get all journal entries
    """
    entries = await db.journal_entries.find().sort("date", -1).to_list(1000)
    return [
        {
            "id": str(entry["_id"]),
            "date": entry["date"],
            "reference": entry["reference"],
            "description": entry["description"],
            "account_id": entry["account_id"],
            "account_name": entry["account_name"],
            "debit": entry["debit"],
            "credit": entry["credit"],
            "status": entry["status"],
            "created_by": entry["created_by"],
            "created_at": entry["created_at"]
        }
        for entry in entries
    ]

@router.post("/journal-entries", status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    entry_data: JournalEntryCreate,
    current_user: dict = Depends(require_roles(["admin", "manager"]))
):
    """
    Create journal entry (Admin and Manager only)
    """
    entry_dict = entry_data.dict()
    if not entry_dict.get("date"):
        entry_dict["date"] = datetime.utcnow()
    entry_dict["created_by"] = str(current_user["_id"])
    entry_dict["created_at"] = datetime.utcnow()
    
    result = await db.journal_entries.insert_one(entry_dict)
    
    return {
        "message": "Journal entry created successfully",
        "entry_id": str(result.inserted_id)
    }