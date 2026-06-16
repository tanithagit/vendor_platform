from sqlalchemy import (
    Column, Integer, String, Text,
    Float, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.enums import RequestStatus


class PurchaseRequest(Base):
    __tablename__ = "purchase_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    amount = Column(Float, nullable=False)
    required_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(
        Enum(RequestStatus),
        default=RequestStatus.draft,
        nullable=False
    )
    document_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    employee = relationship("User", back_populates="purchase_requests")
    quotations = relationship("Quotation", back_populates="purchase_request")
    purchase_order = relationship(
        "PurchaseOrder",
        back_populates="purchase_request",
        uselist=False
    )

    def __repr__(self):
        return f"<PurchaseRequest {self.title} - {self.status}>"