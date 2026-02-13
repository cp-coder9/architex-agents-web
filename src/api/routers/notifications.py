"""Notifications router for Architectural Autonomous Platform."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging
from datetime import datetime

from ...db.connection import get_db
from ...db.schema import Notification

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/")
async def list_notifications(
    user_id: int = None,
    unread_only: bool = False,
    db: Session = Depends(get_db)
):
    """List notifications, optionally filtered by user and read status."""
    query = db.query(Notification)
    if user_id:
        query = query.filter(Notification.user_id == user_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)

    notifications = query.order_by(Notification.created_at.desc()).limit(50).all()
    return {
        "notifications": [n.__dict__ for n in notifications],
        "count": len(notifications)
    }


@router.post("/")
async def create_notification(
    notification_data: dict,
    db: Session = Depends(get_db)
):
    """Create a new notification."""
    try:
        notification = Notification(
            user_id=notification_data.get("user_id"),
            title=notification_data.get("title", ""),
            message=notification_data.get("message", ""),
            type=notification_data.get("type", "info"),
            is_read=False,
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)

        logger.info(f"Notification created for user {notification.user_id}")
        return notification.__dict__
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating notification: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db)
):
    """Mark a notification as read."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()
    return {"status": "marked_as_read", "id": notification_id}


@router.put("/read-all")
async def mark_all_as_read(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Mark all notifications as read for a user."""
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "all_marked_as_read", "user_id": user_id}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):
    """Delete a notification."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notification)
    db.commit()
    return {"status": "deleted", "id": notification_id}


@router.post("/send-email")
async def send_email_notification(
    email_data: dict
):
    """Send an email notification (stub — integrate with email provider)."""
    logger.info(f"Email notification requested to: {email_data.get('to')}")
    return {
        "status": "queued",
        "to": email_data.get("to"),
        "subject": email_data.get("subject"),
        "message": "Email sent (simulated)"
    }


@router.post("/send-sms")
async def send_sms_notification(
    sms_data: dict
):
    """Send an SMS notification (stub — integrate with SMS provider)."""
    logger.info(f"SMS notification requested to: {sms_data.get('phone')}")
    return {
        "status": "queued",
        "phone": sms_data.get("phone"),
        "message": "SMS sent (simulated)"
    }
