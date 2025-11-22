from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class StoreBase(BaseModel):
    code: str
    name: str
    address_line1: str
    postal_code: str
    city: str
    country: str = "Portugal"
    status: str = "active"  # 'active' | 'inactive'

class StoreCreate(StoreBase):
    pass

class StoreUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    address_line1: Optional[str] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    status: Optional[str] = None

class StoreInDB(StoreBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class StoreResponse(StoreBase):
    id: str
    created_at: datetime
    updated_at: datetime
