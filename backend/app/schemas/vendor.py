from pydantic import BaseModel, EmailStr
from typing  import Optional
from datetime import datetime

class VendorCreate(BaseModel):
    vendor_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None

class VendorResponse(BaseModel):
    id: int
    vendor_name: str
    email: str
    phone: Optional[str]
    address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
        