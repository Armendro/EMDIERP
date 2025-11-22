from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
    draft = "draft"
    pending_approval = "pending_approval"
    approved = "approved"
    invoiced = "invoiced"
    completed = "completed"
    cancelled = "cancelled"

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    variant_id: Optional[str] = None  # ID da variante escolhida
    variant_name: Optional[str] = None  # Nome da variante
    price_tier_name: Optional[str] = None  # Nome da faixa de preço (ex: "normal", "site", "promo")
    quantity: int = Field(gt=0)
    price: float = Field(ge=0)  # Preço unitário aplicado
    commission_percent: Optional[float] = None  # Percentual de comissão
    commission_value: Optional[float] = None  # Valor da comissão calculado (quantity * price * commission_percent / 100)

class OrderBase(BaseModel):
    customer_id: str
    customer_name: str
    items: List[OrderItem]
    status: OrderStatus = OrderStatus.draft

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    items: Optional[List[OrderItem]] = None
    status: Optional[OrderStatus] = None

class OrderInDB(OrderBase):
    id: str = Field(alias="_id")
    order_number: str
    date: datetime
    total: float
    total_commission: Optional[float] = 0  # Comissão total do pedido
    approved_by: Optional[str] = None
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class OrderResponse(OrderBase):
    id: str
    order_number: str
    date: datetime
    total: float
    total_commission: Optional[float] = 0
    approved_by: Optional[str] = None
    created_by: str
    created_at: datetime
    updated_at: datetime