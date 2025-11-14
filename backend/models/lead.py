from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class LeadStage(str, Enum):
    new = "new"
    qualified = "qualified"
    proposition = "proposition"
    negotiation = "negotiation"
    won = "won"
    lost = "lost"

class LeadPriority(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"

class LeadBase(BaseModel):
    name: str  # Company name
    contact: str  # Contact person
    email: EmailStr
    phone: str
    stage: LeadStage = LeadStage.new
    priority: LeadPriority = LeadPriority.medium
    expected_revenue: float
    probability: int = Field(ge=0, le=100, default=20)
    notes: Optional[str] = None

class LeadCreate(LeadBase):
    assigned_to: Optional[str] = None

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    stage: Optional[LeadStage] = None
    priority: Optional[LeadPriority] = None
    expected_revenue: Optional[float] = None
    probability: Optional[int] = Field(None, ge=0, le=100)
    assigned_to: Optional[str] = None
    notes: Optional[str] = None

class LeadInDB(LeadBase):
    id: str = Field(alias="_id")
    assigned_to: str
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class LeadResponse(LeadBase):
    id: str
    assigned_to: str
    created_at: datetime
    updated_at: datetime