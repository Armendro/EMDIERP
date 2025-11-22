from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class SystemSettingsBase(BaseModel):
    company_name: str = "Empresa"
    company_email: EmailStr = "geral@empresa.pt"
    company_phone: str = ""
    company_website: str = ""
    company_address: str = ""
    base_currency: str = "EUR"
    timezone: str = "Europe/Lisbon"

class SystemSettingsUpdate(BaseModel):
    company_name: Optional[str] = None
    company_email: Optional[EmailStr] = None
    company_phone: Optional[str] = None
    company_website: Optional[str] = None
    company_address: Optional[str] = None
    base_currency: Optional[str] = None
    timezone: Optional[str] = None

class SystemSettingsResponse(SystemSettingsBase):
    id: str
    updated_at: datetime
