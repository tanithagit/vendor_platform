from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import PaymentStatus


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    stripe_payment_id = Column(String(200), nullable=True)
    amount = Column(Float, nullable=False)
    status = Column(
        Enum(PaymentStatus),
        default=PaymentStatus.pending,
        nullable=False
    )
    paid_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    invoice = relationship("Invoice", back_populates="payment")

    def __repr__(self):
        return f"<Payment stripe_id={self.stripe_payment_id} status={self.status}>"