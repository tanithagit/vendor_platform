from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.enums import PaymentStatus

class PaymentCreate(BaseModel):
    invoice_id: int
    amount: float

class PaymentResponse(BaseModel):
    id: int
    invoice_id: int
    stripe_payment_id: Optional[str]
    amount: float
    status: PaymentStatus
    paid_at: Optional[datetime]

    class Config:
        from_attributes = True

        