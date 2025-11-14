from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    manager = "manager"
    employee = "employee"

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole
    phone: Optional[str] = None
    department: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    role: Optional[UserRole] = None

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    avatar: str
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class UserResponse(UserBase):
    id: str
    avatar: str
    created_at: datetime
    updated_at: datetime