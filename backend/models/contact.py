from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class ContactBase(BaseModel):
    is_customer: bool = False
    is_supplier: bool = False
    type: str  # 'pessoa_singular' | 'pessoa_coletiva'
    name: str
    trade_name: Optional[str] = None
    nif: str
    email: EmailStr
    phone: Optional[str] = None
    mobile: Optional[str] = None
    website: Optional[str] = None
    
    # Billing Address
    billing_address_line1: str
    billing_postal_code: str
    billing_city: str
    billing_country: str = "Portugal"
    
    # Shipping Address
    shipping_same_as_billing: bool = True
    shipping_address_line1: Optional[str] = None
    shipping_postal_code: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_country: Optional[str] = None
    
    # Customer specific fields
    customer_type: Optional[str] = None
    payment_terms: Optional[str] = None
    credit_limit: Optional[float] = Field(default=None, ge=0)
    
    # Supplier specific fields
    supplier_type: Optional[str] = None
    iban: Optional[str] = None
    bank_name: Optional[str] = None
    swift_bic: Optional[str] = None
    
    status: str = "active"  # 'active' | 'inactive'
    notes: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    is_customer: Optional[bool] = None
    is_supplier: Optional[bool] = None
    type: Optional[str] = None
    name: Optional[str] = None
    trade_name: Optional[str] = None
    nif: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    website: Optional[str] = None
    billing_address_line1: Optional[str] = None
    billing_postal_code: Optional[str] = None
    billing_city: Optional[str] = None
    billing_country: Optional[str] = None
    shipping_same_as_billing: Optional[bool] = None
    shipping_address_line1: Optional[str] = None
    shipping_postal_code: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_country: Optional[str] = None
    customer_type: Optional[str] = None
    payment_terms: Optional[str] = None
    credit_limit: Optional[float] = Field(default=None, ge=0)
    supplier_type: Optional[str] = None
    iban: Optional[str] = None
    bank_name: Optional[str] = None
    swift_bic: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class ContactInDB(ContactBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class ContactResponse(ContactBase):
    id: str
    created_at: datetime
    updated_at: datetime
