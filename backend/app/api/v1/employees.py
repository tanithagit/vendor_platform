from fastapi import (
    APIRouter, Depends, HTTPException,
    status, UploadFile, File
)
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.core.dependencies import get_current_employee
from app.models import User, PurchaseRequest
from app.models.enums import RequestStatus
from app.schemas.purchase_request import (
    PurchaseRequestCreate,
    PurchaseRequestResponse
)
from app.services.cloudinary_service import upload_file

router = APIRouter(
    prefix="/api/v1/employee",
    tags=["Employee"]
)


# ── Create Purchase Request ───────────────────────────────
@router.post(
    "/requests",
    response_model=PurchaseRequestResponse,
    status_code=status.HTTP_201_CREATED
)
def create_purchase_request(
    request_data: PurchaseRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employee)
):
    """
    Employee creates a new purchase request.
    Status starts as 'draft'
    """
    new_request = PurchaseRequest(
        employee_id=current_user.id,
        title=request_data.title,
        description=request_data.description,
        amount=request_data.amount,
        required_date=request_data.required_date,
        status=RequestStatus.draft
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request


# ── Submit Purchase Request ───────────────────────────────
@router.patch(
    "/requests/{request_id}/submit",
    response_model=PurchaseRequestResponse
)
def submit_purchase_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employee)
):
    """
    Employee submits a draft request for manager review.
    Status changes: draft → submitted
    """
    # Find the request
    purchase_request = db.query(PurchaseRequest).filter(
        PurchaseRequest.id == request_id,
        PurchaseRequest.employee_id == current_user.id  # own requests only
    ).first()

    if not purchase_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase request not found"
        )

    # Only draft requests can be submitted
    if purchase_request.status != RequestStatus.draft:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only draft requests can be submitted. Current status: {purchase_request.status}"
        )

    purchase_request.status = RequestStatus.submitted
    db.commit()
    db.refresh(purchase_request)

    return purchase_request


# ── Upload Document ───────────────────────────────────────
@router.post(
    "/requests/{request_id}/upload",
    response_model=PurchaseRequestResponse
)
def upload_document(
    request_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employee)
):
    """
    Employee uploads supporting document for a purchase request.
    File is stored in Cloudinary, URL saved in database.
    """
    # Find the request
    purchase_request = db.query(PurchaseRequest).filter(
        PurchaseRequest.id == request_id,
        PurchaseRequest.employee_id == current_user.id
    ).first()

    if not purchase_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase request not found"
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

    # Read file bytes
    file_bytes = file.file.read()

    # Generate unique filename
    unique_filename = f"request_{request_id}_{uuid.uuid4().hex}"

    # Upload to Cloudinary
    file_url = upload_file(
        file_bytes=file_bytes,
        folder="procurement/requests",
        filename=unique_filename
    )

    # Save URL to database
    purchase_request.document_url = file_url
    db.commit()
    db.refresh(purchase_request)

    return purchase_request


# ── Get All My Requests ───────────────────────────────────
@router.get(
    "/requests",
    response_model=List[PurchaseRequestResponse]
)
def get_my_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employee)
):
    """
    Employee views only their own purchase requests.
    Critical rule: employees cannot see other employees' requests
    """
    requests = db.query(PurchaseRequest).filter(
        PurchaseRequest.employee_id == current_user.id
    ).order_by(PurchaseRequest.created_at.desc()).all()

    return requests


# ── Get Single Request ────────────────────────────────────
@router.get(
    "/requests/{request_id}",
    response_model=PurchaseRequestResponse
)
def get_request_by_id(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employee)
):
    """
    Employee views a single purchase request.
    Can only view their own requests.
    """
    purchase_request = db.query(PurchaseRequest).filter(
        PurchaseRequest.id == request_id,
        PurchaseRequest.employee_id == current_user.id
    ).first()

    if not purchase_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase request not found"
        )

    return purchase_request


# ── Get Request Status ────────────────────────────────────
@router.get(
    "/requests/{request_id}/status",
)
def get_request_status(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employee)
):
    """Track status of a specific request"""
    purchase_request = db.query(PurchaseRequest).filter(
        PurchaseRequest.id == request_id,
        PurchaseRequest.employee_id == current_user.id
    ).first()

    if not purchase_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase request not found"
        )

    return {
        "request_id": purchase_request.id,
        "title": purchase_request.title,
        "status": purchase_request.status,
        "created_at": purchase_request.created_at
    }