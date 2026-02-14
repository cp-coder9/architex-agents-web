"""Projects router for Architectural Autonomous Platform."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import logging
from pydantic import BaseModel

from ...db.connection import get_db
from ...db.schema import Project, ProjectStatus, ProjectType, User, Task, FreelancerProfile, Notification
from ...orchestrator.orchestrator import Orchestrator

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("/", response_model=List[dict])
async def list_projects(
    status: ProjectStatus = None,
    db: Session = Depends(get_db)
):
    """List projects with optional status filter."""
    query = db.query(Project)
    if status:
        query = query.filter(Project.status == status)
    
    projects = query.order_by(Project.created_at.desc()).all()
    results = []
    for p in projects:
        d = p.__dict__.copy()
        if '_sa_instance_state' in d:
            del d['_sa_instance_state']
        
        # Manually include relationships for frontend
        d['tasks'] = []
        if p.tasks:
            for t in p.tasks:
                td = t.__dict__.copy()
                if '_sa_instance_state' in td:
                    del td['_sa_instance_state']
                d['tasks'].append(td)
        
        d['user'] = None
        if p.user:
            ud = p.user.__dict__.copy()
            if '_sa_instance_state' in ud:
                del ud['_sa_instance_state']
            d['user'] = ud
            
        results.append(d)
    return results


@router.get("/{project_id}", response_model=dict)
async def get_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    """Get project by ID."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    d = project.__dict__.copy()
    if '_sa_instance_state' in d:
        del d['_sa_instance_state']
    
    # Include relationships
    d['tasks'] = []
    if project.tasks:
        for t in project.tasks:
            td = t.__dict__.copy()
            if '_sa_instance_state' in td:
                del td['_sa_instance_state']
            d['tasks'].append(td)
            
    d['user'] = None
    if project.user:
        ud = project.user.__dict__.copy()
        if '_sa_instance_state' in ud:
            del ud['_sa_instance_state']
        d['user'] = ud

    return d


@router.post("/", response_model=dict)
async def create_project(
    project_data: dict,
    db: Session = Depends(get_db)
):
    """Create a new project."""
    try:
        # Defaults
        est_days = project_data.get("estimated_timeline_days", 7)
        title = project_data.get("title", "Untitled Project")
        
        project = Project(
            user_id=project_data.get("user_id", 1),
            project_type=project_data.get("project_type", ProjectType.COMPLIANCE_CHECK),
            title=title,
            description=project_data.get("description", ""),
            estimated_cost=project_data.get("estimated_cost", 0),
            estimated_timeline_days=est_days
        )
        
        db.add(project)
        db.commit()
        db.refresh(project)

        # Create initial task for the project so it appears in the marketplace
        from ...db.schema import AgentStatus 
        
        initial_task = Task(
            project_id=project.id,
            task_type="initial_review",
            status=AgentStatus.PENDING,
            priority=1,
            purchased_hours=est_days * 2, # Rough estimate for review
        )
        # Fix: Remove description from Task init
        
        db.add(initial_task)
        db.commit()
        
        # Notify available freelancers
        try:
            available_freelancers = db.query(FreelancerProfile).filter(FreelancerProfile.is_available == True).all()
            for freelancer in available_freelancers:
                notif = Notification(
                    user_id=freelancer.user_id,
                    title="New Project Available",
                    message=f"New project '{project.title}' is available. Check the marketplace to apply.",
                    type="task_alert",
                    is_read=False
                )
                db.add(notif)
            db.commit()
        except Exception as e:
             logger.error(f"Failed to notify freelancers: {e}")
        
        logger.info(f"Created project {project.id}: {project.title}")
        
        return project.__dict__
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating project: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


class ProjectStatusUpdate(BaseModel):
    status: ProjectStatus
    admin_notes: Optional[str] = None

@router.put("/{project_id}/status", response_model=dict)
async def update_project_status(
    project_id: int,
    status_update: ProjectStatusUpdate,
    db: Session = Depends(get_db)
):
    """Update project status and admin notes."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project.status = status_update.status
    if status_update.admin_notes:
        project.admin_notes = status_update.admin_notes
        
    if status_update.status == ProjectStatus.COMPLETED:
        project.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(project)
    return project.__dict__


@router.post("/{project_id}/files")
async def upload_project_file(
    project_id: int,
    file_data: dict,
    db: Session = Depends(get_db)
):
    """Upload a file to a project."""
    # This would be implemented with actual file upload handling
    return {
        "project_id": project_id,
        "file_data": file_data,
        "status": "uploaded"
    }


@router.post("/{project_id}/compliance")
async def request_compliance_check(
    project_id: int,
    db: Session = Depends(get_db)
):
    """Request a compliance check for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # In a real implementation, this would trigger the compliance workflow
    return {
        "project_id": project_id,
        "status": "compliance_check_requested",
        "message": "Compliance check workflow initiated"
    }
