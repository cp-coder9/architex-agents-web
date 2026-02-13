"""Compliance router for Architectural Autonomous Platform."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import logging

from ...db.connection import get_db
from ...orchestrator.orchestrator import Orchestrator

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/compliance", tags=["compliance"])


@router.post("/check")
async def run_compliance_check(
    project_data: Dict[str, Any],
    orchestrator: Orchestrator = Depends(lambda: Orchestrator())
):
    """Run compliance check on project data."""
    try:
        project_id = project_data.get("project_id", "temp_project")
        
        # Run the full workflow
        result = await orchestrator.execute_workflow(project_id, project_data)
        
        return {
            "project_id": project_id,
            "status": "completed",
            "result": result
        }
    except Exception as e:
        logger.error(f"Compliance check failed: {str(e)}")
        return {
            "project_id": project_data.get("project_id", "unknown"),
            "status": "failed",
            "error": str(e)
        }


@router.get("/agents")
async def list_compliance_agents(
    orchestrator: Orchestrator = Depends(lambda: Orchestrator())
):
    """List all compliance agents."""
    return {
        "agents": orchestrator.registry.list_agents(),
        "stats": orchestrator.get_agent_stats()
    }


@router.get("/agents/{agent_name}")
async def get_agent_details(
    agent_name: str,
    orchestrator: Orchestrator = Depends(lambda: Orchestrator())
):
    """Get specific agent details."""
    agent = orchestrator.registry.get_agent(agent_name)
    if agent:
        return agent.get_stats()
    return {"error": f"Agent {agent_name} not found"}


@router.post("/agents/{agent_name}/check")
async def run_agent_check(
    agent_name: str,
    project_data: Dict[str, Any],
    orchestrator: Orchestrator = Depends(lambda: Orchestrator())
):
    """Run a specific compliance agent."""
    agent = orchestrator.registry.get_agent(agent_name)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent {agent_name} not found")
    
    try:
        result = await agent.run(project_data)
        return {
            "agent": agent_name,
            "status": "completed",
            "result": result
        }
    except Exception as e:
        logger.error(f"Agent {agent_name} failed: {str(e)}")
        return {
            "agent": agent_name,
            "status": "failed",
            "error": str(e)
        }


@router.get("/reports")
async def get_compliance_reports(
    orchestrator: Orchestrator = Depends(lambda: Orchestrator())
):
    """Get compliance reports history."""
    return {
        "reports": orchestrator.get_workflow_history(limit=100)
    }


@router.get("/reports/{project_id}")
async def get_project_report(
    project_id: str,
    orchestrator: Orchestrator = Depends(lambda: Orchestrator())
):
    """Get compliance report for a specific project."""
    for session in orchestrator.get_all_sessions():
        if session.get("project_id") == project_id:
            return session
    return {"error": f"Report for project {project_id} not found"}
