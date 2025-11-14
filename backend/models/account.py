from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class AccountType(str, Enum):
    asset = "asset"
    liability = "liability"
    equity = "equity"
    revenue = "revenue"
    expense = "expense"

class AccountBase(BaseModel):
    code: str
    name: str
    type: AccountType
    balance: float = 0.0

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    balance: Optional[float] = None

class AccountInDB(AccountBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class AccountResponse(AccountBase):
    id: str
    created_at: datetime
    updated_at: datetime