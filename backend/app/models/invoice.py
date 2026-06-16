from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.enums import PaymentStatus


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(
        Integer, 
        ForeignKey("purchase_orders.id"), 
        nullable=False
    )
    invoice_file_url = Column(String(500), nullable=True)
    amount = Column(Float, nullable=False)
    payment_status = Column(
        Enum(PaymentStatus),
        default=PaymentStatus.pending,
        nullable=False
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="invoice")
    payment = relationship("Payment", back_populates="invoice", uselist=False)

    def __repr__(self):
        return f"<Invoice amount={self.amount} status={self.payment_status}>"