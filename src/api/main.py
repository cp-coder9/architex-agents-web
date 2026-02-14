"""Main FastAPI application for Architectural Autonomous Platform."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from ..db.connection import init_db, get_db
from ..orchestrator.orchestrator import Orchestrator

# Import routers
from .routers.projects import router as projects_router
from .routers.compliance import router as compliance_router
from .routers.users import router as users_router
from .routers.payments import router as payments_router
from .routers.auth import router as auth_router
from .routers.notifications import router as notifications_router
from .routers.freelancers import router as freelancers_router
from .routers.time_tracking import router as time_tracking_router
from .routers.agents import router as agents_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Architectural Autonomous Platform API",
    description="API for Apex Planners architectural workflow platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(compliance_router)
app.include_router(users_router)
app.include_router(payments_router)
app.include_router(notifications_router)
app.include_router(freelancers_router)
app.include_router(time_tracking_router)
app.include_router(agents_router)

# Initialize components
orchestrator = Orchestrator()


@app.on_event("startup")
async def startup_event():
    """Initialize database and load agents on startup."""
    logger.info("Starting up Architectural Autonomous Platform...")
    
    # Initialize database
    init_db()
    logger.info("Database initialized")
    
    # Load and register agents
    from ..agents import (
        WallAgent, DimensionAgent, WindowDoorAgent,
        AreaAgent, EnergyAgent, CouncilCheckAgent,
        ComplianceFormatterAgent
    )
    
    agents = [
        WallAgent(),
        DimensionAgent(),
        WindowDoorAgent(),
        AreaAgent(),
        EnergyAgent(),
        CouncilCheckAgent(),
        ComplianceFormatterAgent()
    ]
    
    for agent in agents:
        await orchestrator.register_agent(agent)
    
    logger.info(f"Registered {len(agents)} agents")
    logger.info("Startup complete")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down Architectural Autonomous Platform...")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": "2026-02-10T01:11:52Z",
        "version": "1.0.0"
    }


@app.get("/agents")
async def list_agents():
    """List all registered agents."""
    return {
        "agents": orchestrator.registry.list_agents(),
        "stats": orchestrator.get_agent_stats()
    }


@app.get("/agents/{agent_name}")
async def get_agent(agent_name: str):
    """Get specific agent details."""
    agent = orchestrator.registry.get_agent(agent_name)
    if agent:
        return agent.get_stats()
    return {"error": f"Agent {agent_name} not found"}


@app.get("/workflows/{project_id}")
async def get_workflow(project_id: str):
    """Get workflow status for a project."""
    # Find session for this project
    for session in orchestrator.get_all_sessions():
        if session.get("project_id") == project_id:
            return session
    return {"error": f"Workflow for project {project_id} not found"}


@app.post("/compliance/check")
async def run_compliance_check(project_data: dict):
    """Run compliance check on project data."""
    try:
        # Generate a project ID if not provided
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


@app.get("/reports")
async def get_reports():
    """Get workflow history reports."""
    return {
        "reports": orchestrator.get_workflow_history(limit=100)
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again later."}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
