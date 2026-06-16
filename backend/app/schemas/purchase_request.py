from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.enums import RequestStatus

class PurchaseRequestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    amount: float
    required_date: datetime

class PurchaseRequestUpdate(BaseModel):
    status: RequestStatus

class PurchaseRequestResponse(BaseModel):
    id: int
    employee_id: int
    title: str
    description: Optional[str]
    amount: float
    required_date: datetime
    status: RequestStatus
    document_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

   
