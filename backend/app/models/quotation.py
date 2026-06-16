from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("purchase_requests.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    document_url = Column(String(500), nullable=True)
    quoted_amount = Column(Float, nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    purchase_request = relationship(
        "PurchaseRequest", 
        back_populates="quotations"
    )
    vendor = relationship("Vendor", back_populates="quotations")

    def __repr__(self):
        return f"<Quotation vendor={self.vendor_id} amount={self.quoted_amount}>"