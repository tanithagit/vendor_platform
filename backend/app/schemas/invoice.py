from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.enums import PaymentStatus


class InvoiceCreate(BaseModel):
    purchase_order_id: int
    amount: float

class InvoiceResponse(BaseModel):
    id: int
    purchase_order_id: int
    invoice_file_url: Optional[str]
    amount: float
    payment_status: PaymentStatus
    created_at: datetime

    class Config:
        from_attributes = True

        