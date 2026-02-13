"""Payments router for Architectural Autonomous Platform."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging

from ...db.connection import get_db
from ...db.schema import Payment, Project, ProjectStatus

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.get("/", response_model=List[dict])
async def list_payments(
    status: str = None,
    db: Session = Depends(get_db)
):
    """List payments with optional status filter."""
    query = db.query(Payment)
    if status:
        query = query.filter(Payment.status == status)
    
    payments = query.order_by(Payment.created_at.desc()).all()
    return [p.__dict__ for p in payments]


@router.get("/{payment_id}", response_model=dict)
async def get_payment(
    payment_id: int,
    db: Session = Depends(get_db)
):
    """Get payment by ID."""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment.__dict__


@router.post("/", response_model=dict)
async def create_payment(
    payment_data: dict,
    db: Session = Depends(get_db)
):
    """Create a new payment."""
    try:
        project_id = payment_data.get("project_id")
        project = db.query(Project).filter(Project.id == project_id).first()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        payment = Payment(
            project_id=project_id,
            amount=payment_data.get("amount", 0),
            currency=payment_data.get("currency", "ZAR"),
            status="pending",
            payment_method=payment_data.get("payment_method", "card")
        )
        
        db.add(payment)
        db.commit()
        db.refresh(payment)
        
        logger.info(f"Created payment {payment.id} for project {project_id}")
        return payment.__dict__
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating payment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{payment_id}/confirm")
async def confirm_payment(
    payment_id: int,
    db: Session = Depends(get_db)
):
    """Confirm a payment."""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment.status = "completed"
    payment.paid_at = "2026-02-10T01:19:02"
    
    # Update project status
    project = db.query(Project).filter(Project.id == payment.project_id).first()
    if project:
        project.status = ProjectStatus.PAYMENT_RECEIVED
    
    db.commit()
    db.refresh(payment)
    return payment.__dict__


@router.post("/{payment_id}/refund")
async def refund_payment(
    payment_id: int,
    db: Session = Depends(get_db)
):
    """Refund a payment."""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment.status = "refunded"
    
    # Update project status
    project = db.query(Project).filter(Project.id == payment.project_id).first()
    if project:
        project.status = ProjectStatus.PAYMENT_PENDING
    
    db.commit()
    db.refresh(payment)
    return payment.__dict__


@router.post("/webhook")
async def payment_webhook(
    webhook_data: dict
):
    """Handle payment webhook notifications."""
    # This would be implemented with actual payment provider webhook handling
    return {
        "status": "received",
        "webhook_data": webhook_data
    }
