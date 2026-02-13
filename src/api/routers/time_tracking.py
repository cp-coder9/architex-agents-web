"""Time tracking & invoicing router.

Handles:
  - Start / stop / pause work sessions (TimeLog)
  - Countdown remaining hours per task & project
  - Auto-generation of invoices from accumulated time
  - Admin oversight of all time logs
"""

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import uuid

from ...db.connection import get_db
from ...db.schema import TimeLog, Task, Project, Invoice

router = APIRouter(prefix="/api/time", tags=["time-tracking"])


# ── Timer Controls ──────────────────────────────────────

@router.post("/start")
async def start_timer(
    task_id: int,
    freelancer_id: int,
    db: Session = Depends(get_db)
):
    """Start a work session timer for a task."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check for already-running timer on this task
    running = db.query(TimeLog).filter(
        TimeLog.task_id == task_id,
        TimeLog.freelancer_id == freelancer_id,
        TimeLog.stopped_at == None
    ).first()
    if running:
        raise HTTPException(status_code=409, detail="Timer already running for this task")

    # Check if there are hours remaining
    remaining = (task.purchased_hours or 0) - (task.hours_used or 0)
    if remaining <= 0:
        raise HTTPException(status_code=400, detail="No purchased hours remaining for this task")

    log = TimeLog(
        task_id=task_id,
        freelancer_id=freelancer_id,
        project_id=task.project_id,
        started_at=datetime.utcnow(),
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return {
        "time_log_id": log.id,
        "started_at": log.started_at.isoformat(),
        "remaining_hours": remaining,
        "message": "Timer started"
    }


@router.post("/stop")
async def stop_timer(
    time_log_id: int,
    notes: str = None,
    db: Session = Depends(get_db)
):
    """Stop a running timer and compute duration."""
    log = db.query(TimeLog).filter(TimeLog.id == time_log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Time log not found")
    if log.stopped_at is not None:
        raise HTTPException(status_code=400, detail="Timer already stopped")

    now = datetime.utcnow()
    log.stopped_at = now
    log.duration_seconds = int((now - log.started_at).total_seconds())
    if notes:
        log.notes = notes

    # Update task hours_used
    task = db.query(Task).filter(Task.id == log.task_id).first()
    if task:
        hours_worked = log.duration_seconds / 3600
        task.hours_used = (task.hours_used or 0) + hours_worked

        # Also update project-level hours
        project = db.query(Project).filter(Project.id == task.project_id).first()
        if project:
            project.hours_used = (project.hours_used or 0) + hours_worked

    db.commit()
    db.refresh(log)

    return {
        "time_log_id": log.id,
        "duration_seconds": log.duration_seconds,
        "duration_display": _format_duration(log.duration_seconds),
        "hours_worked": round(log.duration_seconds / 3600, 2),
        "task_hours_remaining": round((task.purchased_hours or 0) - (task.hours_used or 0), 2) if task else 0,
        "message": "Timer stopped"
    }


@router.get("/active")
async def get_active_timer(
    freelancer_id: int,
    db: Session = Depends(get_db)
):
    """Get the currently running timer for a freelancer (if any)."""
    log = db.query(TimeLog).filter(
        TimeLog.freelancer_id == freelancer_id,
        TimeLog.stopped_at == None
    ).first()

    if not log:
        return {"active": False}

    elapsed = int((datetime.utcnow() - log.started_at).total_seconds())
    task = db.query(Task).filter(Task.id == log.task_id).first()
    remaining_seconds = 0
    if task:
        remaining_hours = (task.purchased_hours or 0) - (task.hours_used or 0)
        remaining_seconds = max(0, int(remaining_hours * 3600) - elapsed)

    return {
        "active": True,
        "time_log_id": log.id,
        "task_id": log.task_id,
        "started_at": log.started_at.isoformat(),
        "elapsed_seconds": elapsed,
        "remaining_seconds": remaining_seconds,
        "elapsed_display": _format_duration(elapsed),
        "remaining_display": _format_duration(remaining_seconds),
    }


@router.get("/task/{task_id}/summary")
async def task_time_summary(
    task_id: int,
    db: Session = Depends(get_db)
):
    """Get time summary for a specific task."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    logs = db.query(TimeLog).filter(TimeLog.task_id == task_id).order_by(TimeLog.created_at.desc()).all()
    total_seconds = sum(l.duration_seconds or 0 for l in logs if l.stopped_at)

    return {
        "task_id": task_id,
        "purchased_hours": task.purchased_hours or 0,
        "hours_used": round(total_seconds / 3600, 2),
        "hours_remaining": round((task.purchased_hours or 0) - total_seconds / 3600, 2),
        "session_count": len(logs),
        "sessions": [
            {
                "id": l.id,
                "started_at": l.started_at.isoformat() if l.started_at else None,
                "stopped_at": l.stopped_at.isoformat() if l.stopped_at else None,
                "duration_seconds": l.duration_seconds,
                "duration_display": _format_duration(l.duration_seconds or 0),
                "notes": l.notes,
                "is_billable": l.is_billable,
                "is_running": l.stopped_at is None,
            }
            for l in logs
        ],
    }


# ── Admin Oversight ─────────────────────────────────────

@router.get("/admin/overview")
async def admin_time_overview(
    db: Session = Depends(get_db)
):
    """Admin view – all time logs across freelancers and projects."""
    logs = db.query(TimeLog).order_by(TimeLog.created_at.desc()).limit(100).all()
    active_count = db.query(TimeLog).filter(TimeLog.stopped_at == None).count()

    total_billed_seconds = db.query(func.sum(TimeLog.duration_seconds)).filter(
        TimeLog.is_billable == True,
        TimeLog.stopped_at != None
    ).scalar() or 0

    return {
        "total_sessions": len(logs),
        "active_sessions": active_count,
        "total_billed_hours": round(total_billed_seconds / 3600, 2),
        "recent_logs": [
            {
                "id": l.id,
                "task_id": l.task_id,
                "freelancer_id": l.freelancer_id,
                "project_id": l.project_id,
                "started_at": l.started_at.isoformat() if l.started_at else None,
                "stopped_at": l.stopped_at.isoformat() if l.stopped_at else None,
                "duration_display": _format_duration(l.duration_seconds or 0),
                "is_running": l.stopped_at is None,
                "is_billable": l.is_billable,
                "notes": l.notes,
            }
            for l in logs
        ],
    }


@router.get("/freelancer/{freelancer_id}/logs")
async def freelancer_time_logs(
    freelancer_id: int,
    db: Session = Depends(get_db)
):
    """Get all time logs for a specific freelancer."""
    logs = db.query(TimeLog).filter(
        TimeLog.freelancer_id == freelancer_id
    ).order_by(TimeLog.created_at.desc()).all()

    total_seconds = sum(l.duration_seconds or 0 for l in logs if l.stopped_at)

    return {
        "freelancer_id": freelancer_id,
        "total_hours": round(total_seconds / 3600, 2),
        "session_count": len(logs),
        "logs": [
            {
                "id": l.id,
                "task_id": l.task_id,
                "project_id": l.project_id,
                "started_at": l.started_at.isoformat() if l.started_at else None,
                "stopped_at": l.stopped_at.isoformat() if l.stopped_at else None,
                "duration_seconds": l.duration_seconds,
                "duration_display": _format_duration(l.duration_seconds or 0),
                "notes": l.notes,
                "is_billable": l.is_billable,
            }
            for l in logs
        ],
    }


# ── Auto-Invoicing ──────────────────────────────────────

@router.post("/invoices/generate")
async def generate_invoice(
    project_id: int,
    db: Session = Depends(get_db)
):
    """Auto-generate an invoice from accumulated time logs for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get all billable, stopped logs that haven't been invoiced yet
    logs = db.query(TimeLog).filter(
        TimeLog.project_id == project_id,
        TimeLog.is_billable == True,
        TimeLog.stopped_at != None,
    ).all()

    if not logs:
        raise HTTPException(status_code=400, detail="No billable time logs found")

    total_seconds = sum(l.duration_seconds or 0 for l in logs)
    total_hours = round(total_seconds / 3600, 2)
    hourly_rate = project.hourly_rate or 450
    total_amount = round(total_hours * hourly_rate, 2)

    # Build line items
    line_items = []
    for l in logs:
        hrs = round((l.duration_seconds or 0) / 3600, 2)
        line_items.append({
            "description": f"Work session – {l.started_at.strftime('%d %b %Y %H:%M') if l.started_at else 'Unknown'}",
            "hours": hrs,
            "rate": hourly_rate,
            "amount": round(hrs * hourly_rate, 2),
            "time_log_id": l.id,
        })

    invoice_number = f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    invoice = Invoice(
        project_id=project_id,
        client_user_id=project.user_id,
        invoice_number=invoice_number,
        hours_billed=total_hours,
        hourly_rate=hourly_rate,
        total_amount=total_amount,
        status="draft",
        issued_at=datetime.utcnow(),
        due_at=datetime.utcnow() + timedelta(days=14),
        line_items=line_items,
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    return {
        "invoice_id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "hours_billed": invoice.hours_billed,
        "total_amount": invoice.total_amount,
        "status": invoice.status,
        "due_at": invoice.due_at.isoformat() if invoice.due_at else None,
        "line_items": invoice.line_items,
        "message": f"Invoice {invoice.invoice_number} generated for R{invoice.total_amount:,.2f}"
    }


@router.get("/invoices/{project_id}")
async def list_invoices(
    project_id: int,
    db: Session = Depends(get_db)
):
    """List all invoices for a project."""
    invoices = db.query(Invoice).filter(
        Invoice.project_id == project_id
    ).order_by(Invoice.created_at.desc()).all()

    return {
        "project_id": project_id,
        "invoices": [
            {
                "id": inv.id,
                "invoice_number": inv.invoice_number,
                "hours_billed": inv.hours_billed,
                "hourly_rate": inv.hourly_rate,
                "total_amount": inv.total_amount,
                "status": inv.status,
                "issued_at": inv.issued_at.isoformat() if inv.issued_at else None,
                "due_at": inv.due_at.isoformat() if inv.due_at else None,
                "paid_at": inv.paid_at.isoformat() if inv.paid_at else None,
            }
            for inv in invoices
        ],
    }


# ── Helpers ─────────────────────────────────────────────

def _format_duration(seconds: int) -> str:
    """Format seconds into HH:MM:SS display string."""
    if seconds <= 0:
        return "00:00:00"
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    return f"{h:02d}:{m:02d}:{s:02d}"
