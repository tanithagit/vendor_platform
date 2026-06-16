from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QuotationCreate(BaseModel):
    request_id: int
    quoted_amount: float

class QuotationResponse(BaseModel):
    id: int
    request_id: int
    vendor_id: int
    document_url: Optional[str]
    quoted_amount: float
    submitted_at: datetime

    class Config:
        from_attributes = True
        