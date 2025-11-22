from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CostCenterBase(BaseModel):
    code: str
    name: str
    type: str  # 'revenue' | 'expense'
    store_id: Optional[str] = None
    status: str = "active"  # 'active' | 'inactive'

class CostCenterCreate(CostCenterBase):
    pass

class CostCenterUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    type: Optional[str] = None
    store_id: Optional[str] = None
    status: Optional[str] = None

class CostCenterInDB(CostCenterBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class CostCenterResponse(CostCenterBase):
    id: str
    created_at: datetime
    updated_at: datetime
