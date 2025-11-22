from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class WarehouseBase(BaseModel):
    code: str
    name: str
    store_id: Optional[str] = None
    status: str = "active"  # 'active' | 'inactive'

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    store_id: Optional[str] = None
    status: Optional[str] = None

class WarehouseInDB(WarehouseBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class WarehouseResponse(WarehouseBase):
    id: str
    created_at: datetime
    updated_at: datetime
