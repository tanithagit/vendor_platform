from pydantic import BaseModel
from datetime import datetime

class PurchaseOrderCreate(BaseModel):
    request_id: int
    vendor_id: int
    total_amount: float

class PurchaseOrderResponse(BaseModel):
    id: int
    request_id: int
    vendor_id: int
    order_number: str
    total_amount: float
    created_at: datetime

    class Config: 
        from_attributes = True
        
