from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class MovementType(str, Enum):
    in_type = "in"
    out = "out"

class StockMovementBase(BaseModel):
    product_id: str
    product_name: str
    type: MovementType
    quantity: int = Field(gt=0)
    reference: str  # PO-XXX or SO-XXX
    location: str = "Main Warehouse"

class StockMovementCreate(StockMovementBase):
    pass

class StockMovementInDB(StockMovementBase):
    id: str = Field(alias="_id")
    date: datetime
    created_by: str
    created_at: datetime

    class Config:
        populate_by_name = True

class StockMovementResponse(StockMovementBase):
    id: str
    date: datetime
    created_by: str
    created_at: datetime