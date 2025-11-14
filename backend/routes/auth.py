from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

from auth.password import hash_password, verify_password
from auth.jwt import create_access_token
from auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Get database
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    token: str
    user: dict

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "employee"

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """
    Authenticate user and return JWT token
    """
    # Find user by email
    user = await db.users.find_one({"email": credentials.email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create JWT token
    token_data = {
        "user_id": str(user["_id"]),
        "email": user["email"],
        "role": user["role"]
    }
    token = create_access_token(token_data)
    
    # Return response
    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "avatar": user.get("avatar", "")
        }
    }

@router.post("/register")
async def register(user_data: RegisterRequest):
    """
    Register a new user
    """
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create user
    user_dict = {
        "name": user_data.name,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "role": user_data.role,
        "avatar": "".join([word[0].upper() for word in user_data.name.split()[:2]]),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    
    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id)
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user
    """
    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"],
        "avatar": current_user.get("avatar", "")
    }