from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("purchase_requests.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    order_number = Column(String(50), unique=True, nullable=False)
    total_amount = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    purchase_request = relationship(
        "PurchaseRequest", 
        back_populates="purchase_order"
    )
    vendor = relationship("Vendor", back_populates="purchase_orders")
    invoice = relationship(
        "Invoice", 
        back_populates="purchase_order", 
        uselist=False
    )

    def __repr__(self):
        return f"<PurchaseOrder {self.order_number}>"