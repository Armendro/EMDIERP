from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

from models.user import UserCreate, UserUpdate, UserResponse
from auth.password import hash_password
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/users", tags=["Users"])

# Get database
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

@router.get("", response_model=List[UserResponse])
async def get_users(current_user: dict = Depends(require_roles(["admin", "manager"]))):
    """
    Get all users (Admin and Manager only)
    """
    users = await db.users.find().to_list(1000)
    return [
        {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "avatar": user.get("avatar", ""),
            "phone": user.get("phone"),
            "department": user.get("department"),
            "created_at": user["created_at"],
            "updated_at": user["updated_at"]
        }
        for user in users
    ]

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """
    Get user by ID
    """
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "avatar": user.get("avatar", ""),
        "phone": user.get("phone"),
        "department": user.get("department"),
        "created_at": user["created_at"],
        "updated_at": user["updated_at"]
    }

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: dict = Depends(require_roles(["admin"]))
):
    """
    Create a new user (Admin only)
    """
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    user_dict = user_data.dict()
    user_dict["password"] = hash_password(user_dict["password"])
    user_dict["avatar"] = "".join([word[0].upper() for word in user_data.name.split()[:2]])
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()
    
    result = await db.users.insert_one(user_dict)
    
    return {
        "message": "User created successfully",
        "user_id": str(result.inserted_id)
    }

@router.put("/{user_id}")
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: dict = Depends(require_roles(["admin"]))
):
    """
    Update user (Admin only)
    """
    update_data = {k: v for k, v in user_data.dict(exclude_unset=True).items()}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.users.update_one(
        {"_id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User updated successfully"}

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_roles(["admin"]))
):
    """
    Delete user (Admin only)
    """
    result = await db.users.delete_one({"_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}