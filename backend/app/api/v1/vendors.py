from fastapi import (
    APIRouter, Depends, HTTPException,
    status, UploadFile, File
)
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.core.dependencies import get_current_vendor
from app.models import User, Vendor, Quotation, PurchaseOrder, Invoice, PurchaseRequest
from app.models.enums import RequestStatus, PaymentStatus
from app.schemas.quotation import QuotationCreate, QuotationResponse
from app.schemas.purchase_order import PurchaseOrderResponse
from app.schemas.invoice import InvoiceCreate, InvoiceResponse
from app.services.cloudinary_service import upload_file
from app.services.email_service import send_invoice_uploaded_email

router = APIRouter(
    prefix="/api/v1/vendor",
    tags=["Vendor"]
)


# ── Helper: Get Vendor Profile ────────────────────────────
def get_vendor_profile(user_id: int, db: Session) -> Vendor:
    """Get vendor profile from vendor user id"""
    vendor = db.query(Vendor).filter(
        Vendor.email == db.query(User).filter(
            User.id == user_id
        ).first().email
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found. Please contact admin to set up your vendor profile."
        )
    return vendor


# ── Submit Quotation ──────────────────────────────────────
@router.post(
    "/quotations",
    response_model=QuotationResponse,
    status_code=status.HTTP_201_CREATED
)
def submit_quotation(
    quotation_data: QuotationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_vendor)
):
    """
    Vendor submits a price quotation for a purchase request.
    Only approved requests can receive quotations.
    """
    # Get vendor profile
    vendor = get_vendor_profile(current_user.id, db)

    # Check if purchase request exists
    purchase_request = db.query(PurchaseRequest).filter(
        PurchaseRequest.id == quotation_data.request_id
    ).first()

    if not purchase_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase request not found"
        )

    # Only approved requests can receive quotations
    if purchase_request.status != RequestStatus.approved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Quotations can only be submitted for approved requests. Current status: {purchase_request.status}"
        )

    # Check if vendor already submitted quotation for this request
    existing_quotation = db.query(Quotation).filter(
        Quotation.request_id == quotation_data.request_id,
        Quotation.vendor_id == vendor.id
    ).first()

    if existing_quotation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a quotation for this request"
        )

    # Create quotation
    new_quotation = Quotation(
        request_id=quotation_data.request_id,
        vendor_id=vendor.id,
        quoted_amount=quotation_data.quoted_amount
    )

    db.add(new_quotation)
    db.commit()
    db.refresh(new_quotation)

    return new_quotation


# ── Upload Quotation Document ─────────────────────────────
@router.post(
    "/quotations/{quotation_id}/upload",
    response_model=QuotationResponse
)
def upload_quotation_document(
    quotation_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_vendor)
):
    """
    Vendor uploads quotation document to Cloudinary.
    """
    # Get vendor profile
    vendor = get_vendor_profile(current_user.id, db)

    # Find the quotation
    quotation = db.query(Quotation).filter(
        Quotation.id == quotation_id,
        Quotation.vendor_id == vendor.id
    ).first()

    if not quotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quotation not found"
        )

    # Validate file type
    allowed_types = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg"
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and image files are allowed"
        )

    # Read and upload file
    file_bytes = file.file.read()
    unique_filename = f"quotation_{quotation_id}_{uuid.uuid4().hex}"

    file_url = upload_file(
        file_bytes=file_bytes,
        folder="procurement/quotations",
        filename=unique_filename
    )

    # Save URL to database
    quotation.document_url = file_url
    db.commit()
    db.refresh(quotation)

    return quotation


# ── Get My Quotations ─────────────────────────────────────
@router.get(
    "/quotations",
    response_model=List[QuotationResponse]
)
def get_my_quotations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_vendor)
):
    """Vendor views all their submitted quotations"""
    vendor = get_vendor_profile(current_user.id, db)

    quotations = db.query(Quotation).filter(
        Quotation.vendor_id == vendor.id
    ).order_by(Quotation.submitted_at.desc()).all()

    return quotations


# ── Get Assigned Purchase Orders ──────────────────────────
@router.get(
    "/purchase-orders",
    response_model=List[PurchaseOrderResponse]
)
def get_my_purchase_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_vendor)
):
    """
    Vendor views all purchase orders assigned to them.
    Purchase orders are created by admin after approving a quotation.
    """
    vendor = get_vendor_profile(current_user.id, db)

    purchase_orders = db.query(PurchaseOrder).filter(
        PurchaseOrder.vendor_id == vendor.id
    ).order_by(PurchaseOrder.created_at.desc()).all()

    return purchase_orders


# ── Get Single Purchase Order ─────────────────────────────
@router.get(
    "/purchase-orders/{order_id}",
    response_model=PurchaseOrderResponse
)
def get_purchase_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_vendor)
):
    """Vendor views a specific purchase order"""
    vendor = get_vendor_profile(current_user.id, db)

    purchase_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == order_id,
        PurchaseOrder.vendor_id == vendor.id
    ).first()

    if not purchase_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase order not found"
        )

    return purchase_order


# ── Upload Invoice ────────────────────────────────────────
@router.post(
    "/invoices",
    response_model=InvoiceResponse,
    status_code=status.HTTP_201_CREATED
)
def upload_invoice(
    invoice_data: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_vendor)
):
    """
    Vendor creates an invoice for a purchase order.
    Critical Rule: Invoice amount must match purchase order amount.
    """
    vendor = get_vendor_profile(current_user.id, db)

    # Check if purchase order exists and belongs to this vendor
    purchase_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == invoice_data.purchase_order_id,
        PurchaseOrder.vendor_id == vendor.id
    ).first()

    if not purchase_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase order not found"
        )

    # Check if invoice already exists for this order
    existing_invoice = db.query(Invoice).filter(
        Invoice.purchase_order_id == invoice_data.purchase_order_id
    ).first()

    if existing_invoice:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invoice already exists for this purchase order"
        )

    # ⚠️ Critical Rule: Invoice amount must match PO amount
    if invoice_data.amount != purchase_order.total_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invoice amount ({invoice_data.amount}) must match purchase order amount ({purchase_order.total_amount})"
        )

    # Create invoice
    new_invoice = Invoice(
        purchase_order_id=invoice_data.purchase_order_id,
        amount=invoice_data.amount,
        payment_status=PaymentStatus.pending
    )

    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)

    # Notify admin about invoice
    admin_users = db.query(User).filter(
        User.role == "admin"
    ).all()
    for admin in admin_users:
        send_invoice_uploaded_email(
            admin_email=admin.email,
            vendor_name=vendor.vendor_name,
            order_number=purchase_order.order_number,
            invoice_id=new_invoice.id,
            amount=new_invoice.amount
        )

    return new_invoice

# ── Upload Invoice Document ───────────────────────────────
@router.post(
    "/invoices/{invoice_id}/upload",
    response_model=InvoiceResponse
)
def upload_invoice_document(
    invoice_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_vendor)
):
    """
    Vendor uploads invoice document to Cloudinary.
    """
    vendor = get_vendor_profile(current_user.id, db)

    # Find the invoice through purchase order
    invoice = db.query(Invoice).join(PurchaseOrder).filter(
        Invoice.id == invoice_id,
        PurchaseOrder.vendor_id == vendor.id
    ).first()

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )

    # Validate file type
    allowed_types = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg"
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and image files are allowed"
        )

    # Upload to Cloudinary
    file_bytes = file.file.read()
    unique_filename = f"invoice_{invoice_id}_{uuid.uuid4().hex}"

    file_url = upload_file(
        file_bytes=file_bytes,
        folder="procurement/invoices",
        filename=unique_filename
    )

    # Save URL
    invoice.invoice_file_url = file_url
    db.commit()
    db.refresh(invoice)

    return invoice


# ── Vendor Dashboard ──────────────────────────────────────
@router.get("/dashboard")
def get_vendor_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_vendor)
):
    """Vendor dashboard statistics"""
    vendor = get_vendor_profile(current_user.id, db)

    total_quotations = db.query(Quotation).filter(
        Quotation.vendor_id == vendor.id
    ).count()

    total_orders = db.query(PurchaseOrder).filter(
        PurchaseOrder.vendor_id == vendor.id
    ).count()

    total_invoices = db.query(Invoice).join(PurchaseOrder).filter(
        PurchaseOrder.vendor_id == vendor.id
    ).count()

    paid_invoices = db.query(Invoice).join(PurchaseOrder).filter(
        PurchaseOrder.vendor_id == vendor.id,
        Invoice.payment_status == PaymentStatus.completed
    ).count()

    return {
        "vendor_name": vendor.vendor_name,
        "total_quotations": total_quotations,
        "total_purchase_orders": total_orders,
        "total_invoices": total_invoices,
        "paid_invoices": paid_invoices
    }