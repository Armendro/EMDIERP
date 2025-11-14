from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class InvoiceStatus(str, Enum):
    draft = "draft"
    sent = "sent"
    paid = "paid"
    overdue = "overdue"

class InvoiceBase(BaseModel):
    order_id: str
    customer_id: str
    customer_name: str
    total: float = Field(ge=0)
    paid: float = Field(ge=0, default=0)
    status: InvoiceStatus = InvoiceStatus.draft

class InvoiceCreate(InvoiceBase):
    due_date: datetime

class InvoiceUpdate(BaseModel):
    status: Optional[InvoiceStatus] = None
    paid: Optional[float] = Field(None, ge=0)

class InvoiceInDB(InvoiceBase):
    id: str = Field(alias="_id")
    invoice_number: str
    date: datetime
    due_date: datetime
    balance: float
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class InvoiceResponse(InvoiceBase):
    id: str
    invoice_number: str
    date: datetime
    due_date: datetime
    balance: float
    created_at: datetime
    updated_at: datetime