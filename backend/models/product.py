from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    sku: str
    category: str
    description: Optional[str] = None
    price: float = Field(ge=0)
    cost: float = Field(ge=0)
    stock: int = Field(ge=0, default=0)
    reorder_level: int = Field(ge=0, default=10)
    supplier: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    cost: Optional[float] = Field(None, ge=0)
    stock: Optional[int] = Field(None, ge=0)
    reorder_level: Optional[int] = Field(None, ge=0)
    supplier: Optional[str] = None

class ProductInDB(ProductBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime