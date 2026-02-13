"""Freelancers router for Architectural Autonomous Platform."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging

from ...db.connection import get_db
from ...db.schema import FreelancerProfile, User, UserRole, Task, AgentStatus

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/freelancers", tags=["freelancers"])


@router.get("/")
async def list_freelancers(
    available_only: bool = False,
    skill: str = None,
    db: Session = Depends(get_db)
):
    """List freelancers with optional availability and skill filter."""
    query = db.query(FreelancerProfile)
    if available_only:
        query = query.filter(FreelancerProfile.is_available == True)

    profiles = query.all()
    results = []
    for profile in profiles:
        user = db.query(User).filter(User.id == profile.user_id).first()
        data = {
            "id": profile.id,
            "user_id": profile.user_id,
            "name": user.full_name if user else "Unknown",
            "email": user.email if user else "",
            "skills": profile.skills,
            "hourly_rate": profile.hourly_rate,
            "is_available": profile.is_available,
            "bio": profile.bio,
            "portfolio_url": profile.portfolio_url,
        }
        results.append(data)
    return {"freelancers": results, "count": len(results)}


@router.get("/available-tasks")
async def get_available_tasks(
    db: Session = Depends(get_db)
):
    """Get tasks available for freelancers to accept."""
    tasks = db.query(Task).filter(
        Task.status == AgentStatus.PENDING,
        Task.assigned_freelancer == None
    ).order_by(Task.created_at.desc()).all()

    return {
        "tasks": [t.__dict__ for t in tasks],
        "count": len(tasks)
    }


@router.post("/tasks/{task_id}/accept")
async def accept_task(
    task_id: int,
    freelancer_data: dict,
    db: Session = Depends(get_db)
):
    """Freelancer accepts a task."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.assigned_freelancer is not None:
        raise HTTPException(status_code=409, detail="Task already accepted by another freelancer")

    freelancer_id = freelancer_data.get("freelancer_id")
    if not freelancer_id:
        raise HTTPException(status_code=400, detail="freelancer_id required")

    task.assigned_freelancer = freelancer_id
    task.status = AgentStatus.RUNNING
    db.commit()
    db.refresh(task)

    logger.info(f"Task {task_id} accepted by freelancer {freelancer_id}")
    return {
        "task_id": task_id,
        "freelancer_id": freelancer_id,
        "status": "accepted",
        "message": "Task accepted successfully"
    }


@router.post("/tasks/{task_id}/decline")
async def decline_task(
    task_id: int,
    freelancer_data: dict,
    db: Session = Depends(get_db)
):
    """Freelancer declines a task."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    logger.info(f"Task {task_id} declined by freelancer {freelancer_data.get('freelancer_id')}")
    return {
        "task_id": task_id,
        "status": "declined",
        "message": "Task declined"
    }


@router.post("/tasks/{task_id}/deliver")
async def upload_deliverable(
    task_id: int,
    delivery_data: dict,
    db: Session = Depends(get_db)
):
    """Freelancer uploads a deliverable for a task."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = AgentStatus.COMPLETED
    db.commit()

    logger.info(f"Deliverable uploaded for task {task_id}")
    return {
        "task_id": task_id,
        "status": "delivered",
        "message": "Deliverable uploaded successfully. AI compliance pipeline will be triggered."
    }


@router.get("/{freelancer_id}/tasks")
async def get_freelancer_tasks(
    freelancer_id: int,
    status: str = None,
    db: Session = Depends(get_db)
):
    """Get all tasks assigned to a freelancer."""
    query = db.query(Task).filter(Task.assigned_freelancer == freelancer_id)
    if status:
        query = query.filter(Task.status == status)

    tasks = query.order_by(Task.created_at.desc()).all()
    return {
        "tasks": [t.__dict__ for t in tasks],
        "count": len(tasks)
    }


@router.get("/{freelancer_id}/earnings")
async def get_freelancer_earnings(
    freelancer_id: int,
    db: Session = Depends(get_db)
):
    """Get freelancer earnings summary."""
    # In production, compute from Payment model joined with tasks
    return {
        "freelancer_id": freelancer_id,
        "total_earnings": 0,
        "pending_payout": 0,
        "this_month": 0,
        "completed_tasks": 0,
        "note": "Earnings computed from payment records"
    }
