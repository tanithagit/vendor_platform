from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models import (
    User, Vendor, PurchaseRequest,
    Quotation, PurchaseOrder, Invoice, Payment
)
from app.models.enums import RequestStatus, PaymentStatus
from app.schemas.vendor import VendorCreate, VendorResponse
from app.schemas.user import UserResponse
from app.schemas.purchase_order import PurchaseOrderCreate, PurchaseOrderResponse
from app.schemas.invoice import InvoiceResponse
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.stripe_service import create_payment_intent, create_payment_link

router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Admin"]
)


# ── User Management ───────────────────────────────────────
@router.get(
    "/users",
    response_model=List[UserResponse]
)
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Admin views all registered users"""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Admin deletes a user"""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    db.delete(user)
    db.commit()

    return {"message": f"User {user.email} deleted successfully"}


# ── Vendor Management ─────────────────────────────────────
@router.post(
    "/vendors",
    response_model=VendorResponse,
    status_code=status.HTTP_201_CREATED
)
def create_vendor(
    vendor_data: VendorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Admin creates a vendor profile"""

    # Check if vendor email already exists
    existing = db.query(Vendor).filter(
        Vendor.email == vendor_data.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vendor with this email already exists"
        )

    new_vendor = Vendor(
        vendor_name=vendor_data.vendor_name,
        email=vendor_data.email,
        phone=vendor_data.phone,
        address=vendor_data.address
    )

    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)

    return new_vendor


@router.get(
    "/vendors",
    response_model=List[VendorResponse]
)
def get_all_vendors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Admin views all vendors"""
    vendors = db.query(Vendor).order_by(Vendor.created_at.desc()).all()
    return vendors


@router.delete("/vendors/{vendor_id}")
def delete_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Admin deletes a vendor"""
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )

    db.delete(vendor)
    db.commit()

    return {"message": f"Vendor {vendor.vendor_name} deleted successfully"}


# ── Purchase Order Management ─────────────────────────────
@router.post(
    "/purchase-orders",
    response_model=PurchaseOrderResponse,
    status_code=status.HTTP_201_CREATED
)
def create_purchase_order(
    order_data: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Admin generates a purchase order from an approved request.
    Critical Rule: Only approved requests can generate POs.
    """
    # Check purchase request exists
    purchase_request = db.query(PurchaseRequest).filter(
        PurchaseRequest.id == order_data.request_id
    ).first()

    if not purchase_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase request not found"
        )

    # ⚠️ Critical Rule: Only approved requests can generate POs
    if purchase_request.status != RequestStatus.approved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only approved requests can generate purchase orders. Current status: {purchase_request.status}"
        )

    # Check vendor exists
    vendor = db.query(Vendor).filter(
        Vendor.id == order_data.vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )

    # Check if PO already exists for this request
    existing_po = db.query(PurchaseOrder).filter(
        PurchaseOrder.request_id == order_data.request_id
    ).first()

    if existing_po:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Purchase order already exists for this request"
        )

    # Generate unique order number
    order_number = f"PO-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    # Create purchase order
    new_po = PurchaseOrder(
        request_id=order_data.request_id,
        vendor_id=order_data.vendor_id,
        order_number=order_number,
        total_amount=order_data.total_amount
    )

    db.add(new_po)

    # Update request status to ordered
    purchase_request.status = RequestStatus.ordered
    db.commit()
    db.refresh(new_po)

    return new_po


@router.get(
    "/purchase-orders",
    response_model=List[PurchaseOrderResponse]
)
def get_all_purchase_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Admin views all purchase orders"""
    orders = db.query(PurchaseOrder).order_by(
        PurchaseOrder.created_at.desc()
    ).all()
    return orders


# ── Invoice Management ────────────────────────────────────
@router.get(
    "/invoices",
    response_model=List[InvoiceResponse]
)
def get_all_invoices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Admin views all invoices"""
    invoices = db.query(Invoice).order_by(
        Invoice.created_at.desc()
    ).all()
    return invoices


# ── Payment Processing ────────────────────────────────────
@router.post(
    "/payments/initiate",
    response_model=PaymentResponse
)
def initiate_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Admin initiates payment for an invoice using Stripe.
    Critical Rule: Payment must be completed before
    invoice status is marked as paid.
    """
    # Find the invoice
    invoice = db.query(Invoice).filter(
        Invoice.id == payment_data.invoice_id
    ).first()

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )

    # Check if already paid
    if invoice.payment_status == PaymentStatus.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invoice is already paid"
        )

    # Verify amount matches invoice
    if payment_data.amount != invoice.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment amount ({payment_data.amount}) must match invoice amount ({invoice.amount})"
        )

    # Create Stripe payment intent
    try:
        payment_result = create_payment_intent(
            amount=payment_data.amount
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # Create payment record
    new_payment = Payment(
        invoice_id=payment_data.invoice_id,
        stripe_payment_id=payment_result["payment_intent_id"],
        amount=payment_data.amount,
        status=PaymentStatus.pending
    )

    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)

    return new_payment


@router.patch("/payments/{payment_id}/complete")
def complete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Admin marks payment as complete.
    This updates both Payment and Invoice status.
    Critical Rule: Payment must be completed before
    invoice is marked as paid.
    """
    # Find payment
    payment = db.query(Payment).filter(
        Payment.id == payment_id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    if payment.status == PaymentStatus.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment already completed"
        )

    # Complete the payment
    payment.status = PaymentStatus.completed
    payment.paid_at = datetime.utcnow()

    # ⚠️ Critical Rule: Only mark invoice paid AFTER payment completes
    invoice = db.query(Invoice).filter(
        Invoice.id == payment.invoice_id
    ).first()
    invoice.payment_status = PaymentStatus.completed

    db.commit()
    db.refresh(payment)

    return {
        "message": "Payment completed successfully",
        "payment_id": payment.id,
        "invoice_id": invoice.id,
        "amount": payment.amount,
        "paid_at": payment.paid_at
    }


@router.get("/payments", response_model=List[PaymentResponse])
def get_all_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Admin views all payments"""
    payments = db.query(Payment).order_by(
        Payment.id.desc()
    ).all()
    return payments


# ── Reports & Analytics ───────────────────────────────────
@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Admin dashboard with full statistics"""

    # User stats
    total_users = db.query(User).count()
    total_vendors = db.query(Vendor).count()

    # Request stats
    total_requests = db.query(PurchaseRequest).count()
    approved_requests = db.query(PurchaseRequest).filter(
        PurchaseRequest.status == RequestStatus.approved
    ).count()
    rejected_requests = db.query(PurchaseRequest).filter(
        PurchaseRequest.status == RequestStatus.rejected
    ).count()

    # Order stats
    total_orders = db.query(PurchaseOrder).count()
    total_invoices = db.query(Invoice).count()

    # Payment stats
    total_payments = db.query(Payment).count()
    completed_payments = db.query(Payment).filter(
        Payment.status == PaymentStatus.completed
    ).count()

    # Total revenue
    total_revenue = db.query(
        func.sum(Payment.amount)
    ).filter(
        Payment.status == PaymentStatus.completed
    ).scalar() or 0

    return {
        "users": {
            "total": total_users,
            "total_vendors": total_vendors
        },
        "requests": {
            "total": total_requests,
            "approved": approved_requests,
            "rejected": rejected_requests
        },
        "orders": {
            "total_purchase_orders": total_orders,
            "total_invoices": total_invoices
        },
        "payments": {
            "total": total_payments,
            "completed": completed_payments,
            "total_revenue": total_revenue
        }
    }