from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_manager
from app.models import User, PurchaseRequest
from app.models.enums import RequestStatus
from app.schemas.purchase_request import PurchaseRequestResponse
from app.services.email_service import (
    send_request_approved_email,
    send_request_rejected_email
)

router = APIRouter(
    prefix="/api/v1/manager",
    tags=["Manager"]
)


# ── Get All Submitted Requests ────────────────────────────
@router.get(
    "/requests",
    response_model=List[PurchaseRequestResponse]
)
def get_all_submitted_requests(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    """
    Manager views all purchase requests.
    Can filter by status (submitted, approved, rejected)
    """
    query = db.query(PurchaseRequest)

    # Apply status filter if provided
    if status_filter:
        try:
            status_enum = RequestStatus(status_filter)
            query = query.filter(PurchaseRequest.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Choose from: draft, submitted, approved, rejected, ordered"
            )
    else:
        # By default show submitted requests
        query = query.filter(
            PurchaseRequest.status == RequestStatus.submitted
        )

    requests = query.order_by(PurchaseRequest.created_at.desc()).all()
    return requests


# ── Get Single Request Details ────────────────────────────
@router.get(
    "/requests/{request_id}",
    response_model=PurchaseRequestResponse
)
def get_request_details(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    """Manager views details of a specific request"""
    purchase_request = db.query(PurchaseRequest).filter(
        PurchaseRequest.id == request_id
    ).first()

    if not purchase_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase request not found"
        )

    return purchase_request


# ── Approve Request ───────────────────────────────────────
@router.patch(
    "/requests/{request_id}/approve",
    response_model=PurchaseRequestResponse
)
def approve_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    """
    Manager approves a purchase request.
    Status changes: submitted → approved

    Critical Rules:
    - Only submitted requests can be approved
    - Manager cannot approve their own requests
    """
    purchase_request = db.query(PurchaseRequest).filter(
        PurchaseRequest.id == request_id
    ).first()

    if not purchase_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase request not found"
        )

    # ⚠️ Critical Rule: Manager cannot approve own requests
    if purchase_request.employee_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Managers cannot approve their own purchase requests"
        )

    # Only submitted requests can be approved
    if purchase_request.status != RequestStatus.submitted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only submitted requests can be approved. Current status: {purchase_request.status}"
        )

    # Approve the request
    # Approve the request
    purchase_request.status = RequestStatus.approved
    db.commit()
    db.refresh(purchase_request)

    # Send email to employee
    employee = db.query(User).filter(
        User.id == purchase_request.employee_id
    ).first()
    if employee:
        send_request_approved_email(
            employee_email=employee.email,
            employee_name=employee.name,
            request_title=purchase_request.title,
            request_id=purchase_request.id,
            amount=purchase_request.amount
        )

    return purchase_request

# ── Reject Request ────────────────────────────────────────
@router.patch(
    "/requests/{request_id}/reject",
    response_model=PurchaseRequestResponse
)
def reject_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    """
    Manager rejects a purchase request.
    Status changes: submitted → rejected

    Rules:
    - Only submitted requests can be rejected
    - Manager cannot reject their own requests
    """
    purchase_request = db.query(PurchaseRequest).filter(
        PurchaseRequest.id == request_id
    ).first()

    if not purchase_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase request not found"
        )

    # ⚠️ Critical Rule: Manager cannot reject own requests
    if purchase_request.employee_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Managers cannot reject their own purchase requests"
        )

    # Only submitted requests can be rejected
    if purchase_request.status != RequestStatus.submitted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only submitted requests can be rejected. Current status: {purchase_request.status}"
        )

    # Reject the request
    # Reject the request
    purchase_request.status = RequestStatus.rejected
    db.commit()
    db.refresh(purchase_request)

    # Send email to employee
    employee = db.query(User).filter(
        User.id == purchase_request.employee_id
    ).first()
    if employee:
        send_request_rejected_email(
            employee_email=employee.email,
            employee_name=employee.name,
            request_title=purchase_request.title,
            request_id=purchase_request.id,
            amount=purchase_request.amount
        )

    return purchase_request
# ── View Approval History ─────────────────────────────────
@router.get(
    "/history",
    response_model=List[PurchaseRequestResponse]
)
def get_approval_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    """
    Manager views history of all approved and rejected requests
    """
    requests = db.query(PurchaseRequest).filter(
        PurchaseRequest.status.in_([
            RequestStatus.approved,
            RequestStatus.rejected,
            RequestStatus.ordered
        ])
    ).order_by(PurchaseRequest.created_at.desc()).all()

    return requests


# ── Get Dashboard Stats ───────────────────────────────────
@router.get("/dashboard")
def get_manager_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    """Manager dashboard statistics"""

    total = db.query(PurchaseRequest).count()
    submitted = db.query(PurchaseRequest).filter(
        PurchaseRequest.status == RequestStatus.submitted
    ).count()
    approved = db.query(PurchaseRequest).filter(
        PurchaseRequest.status == RequestStatus.approved
    ).count()
    rejected = db.query(PurchaseRequest).filter(
        PurchaseRequest.status == RequestStatus.rejected
    ).count()

    return {
        "total_requests": total,
        "pending_review": submitted,
        "approved": approved,
        "rejected": rejected
    }