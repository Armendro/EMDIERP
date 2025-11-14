from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import Optional

class JournalStatus(str, Enum):
    draft = "draft"
    posted = "posted"

class JournalEntryBase(BaseModel):
    reference: str
    description: str
    account_id: str
    account_name: str
    debit: float = Field(ge=0, default=0)
    credit: float = Field(ge=0, default=0)
    status: JournalStatus = JournalStatus.draft

class JournalEntryCreate(JournalEntryBase):
    date: Optional[datetime] = None

class JournalEntryInDB(JournalEntryBase):
    id: str = Field(alias="_id")
    date: datetime
    created_by: str
    created_at: datetime

    class Config:
        populate_by_name = True

class JournalEntryResponse(JournalEntryBase):
    id: str
    date: datetime
    created_by: str
    created_at: datetime