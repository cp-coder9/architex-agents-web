"""Agent monitoring and management API for admin."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import logging

from ...db.connection import get_db
from ...db.schema import User, UserRole
from ...ai.openrouter_client import openrouter_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/agents", tags=["agents"])


def require_admin(db: Session = Depends(get_db), current_user_id: int = None):
    """Verify user is an admin."""
    if current_user_id is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/logs")
async def get_agent_logs(
    session_id: Optional[str] = None,
    agent_name: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user_id: int = None
):
    """Get all agent execution logs - admin only."""
    require_admin(db, current_user_id)
    
    # Get thought logs from OpenRouter client
    logs = openrouter_client.get_thought_logs(
        session_id=session_id,
        agent_name=agent_name,
        limit=limit
    )
    
    return {
        "logs": logs,
        "count": len(logs),
        "filters": {
            "session_id": session_id,
            "agent_name": agent_name,
            "limit": limit
        }
    }


@router.get("/sessions")
async def get_active_sessions(
    db: Session = Depends(get_db),
    current_user_id: int = None
):
    """Get all active agent sessions - admin only."""
    require_admin(db, current_user_id)
    
    # Get sessions from orchestrator (would need to import orchestrator)
    return {
        "sessions": [],
        "count": 0,
        "message": "Session tracking requires orchestrator integration"
    }


@router.get("/stats")
async def get_agent_statistics(
    db: Session = Depends(get_db),
    current_user_id: int = None
):
    """Get detailed statistics for all agents - admin only."""
    require_admin(db, current_user_id)
    
    # Get all thought logs as a sample of activity
    all_logs = openrouter_client.get_thought_logs(limit=1000)
    
    # Aggregate by agent
    agent_stats = {}
    for log in all_logs:
        agent = log.get("agent_name", "unknown")
        if agent not in agent_stats:
            agent_stats[agent] = {
                "total_calls": 0,
                "successful": 0,
                "failed": 0,
                "fallback": 0,
                "last_activity": None
            }
        
        agent_stats[agent]["total_calls"] += 1
        status = log.get("status", "unknown")
        if status == "completed":
            agent_stats[agent]["successful"] += 1
            if log.get("fallback"):
                agent_stats[agent]["fallback"] += 1
        elif status == "error":
            agent_stats[agent]["failed"] += 1
        
        timestamp = log.get("timestamp")
        if timestamp:
            if not agent_stats[agent]["last_activity"] or timestamp > agent_stats[agent]["last_activity"]:
                agent_stats[agent]["last_activity"] = timestamp
    
    return {
        "agents": agent_stats,
        "total_calls": len(all_logs),
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/thoughts/{session_id}")
async def get_session_thoughts(
    session_id: str,
    db: Session = Depends(get_db),
    current_user_id: int = None
):
    """Get all thoughts for a specific session - admin only."""
    require_admin(db, current_user_id)
    
    logs = openrouter_client.get_thought_logs(session_id=session_id)
    
    return {
        "session_id": session_id,
        "thoughts": logs,
        "count": len(logs)
    }


@router.post("/clear-logs")
async def clear_agent_logs(
    db: Session = Depends(get_db),
    current_user_id: int = None
):
    """Clear all agent logs - admin only."""
    require_admin(db, current_user_id)
    
    openrouter_client.clear_logs()
    
    return {
        "message": "All agent logs cleared",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/monitor")
async def agent_monitor(
    db: Session = Depends(get_db),
    current_user_id: int = None
):
    """Real-time agent monitoring dashboard data - admin only."""
    require_admin(db, current_user_id)
    
    # Get recent logs
    recent_logs = openrouter_client.get_thought_logs(limit=50)
    
    # Get active session info
    active_sessions = []
    for log in recent_logs:
        session_id = log.get("session_id")
        if session_id and session_id not in [s.get("session_id") for s in active_sessions]:
            active_sessions.append({
                "session_id": session_id,
                "agent": log.get("agent_name"),
                "last_activity": log.get("timestamp"),
                "status": log.get("status")
            })
    
    return {
        "active_sessions": active_sessions[:10],
        "recent_activity": recent_logs[:20],
        "total_thought_logs": len(openrouter_client.thought_logs),
        "timestamp": datetime.utcnow().isoformat(),
        "system_status": "operational"
    }
