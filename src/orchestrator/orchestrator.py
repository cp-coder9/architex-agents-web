"""Main orchestrator for AI agents."""

import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

from .base import BaseAgent
from .registry import AgentRegistry

logger = logging.getLogger(__name__)


class Orchestrator:
    """Orchestrates AI agents for architectural compliance checking."""
    
    def __init__(self):
        self.registry = AgentRegistry()
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        self.workflow_history: List[Dict[str, Any]] = []
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load orchestrator configuration."""
        return {
            "max_concurrent_agents": 5,
            "timeout_seconds": 300,
            "retry_count": 3,
            "escalation_threshold": 0.8,
            "default_agents": [
                "wall_agent",
                "dimension_agent",
                "window_door_agent",
                "area_agent",
                "energy_agent",
                "council_agent",
                "compliance_formatter_agent"
            ]
        }
    
    async def register_agent(self, agent: BaseAgent) -> bool:
        """Register a new agent with the orchestrator."""
        return await self.registry.register(agent)
    
    async def execute_workflow(self, project_id: str, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the full compliance workflow for a project."""
        logger.info(f"Starting workflow for project {project_id}")
        
        # Initialize session
        session_id = f"{project_id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        self.active_sessions[session_id] = {
            "project_id": project_id,
            "started_at": datetime.utcnow().isoformat(),
            "status": "running",
            "results": {}
        }
        
        # Get workflow agents
        workflow_agents = self.config["default_agents"]
        results = {}
        
        # Execute agents in parallel where possible
        tasks = []
        for agent_name in workflow_agents:
            agent = self.registry.get_agent(agent_name)
            if agent:
                tasks.append(self._execute_agent_with_retry(agent, project_data, session_id))
        
        # Run agents with concurrency limit
        semaphore = asyncio.Semaphore(self.config["max_concurrent_agents"])
        async def bounded_execute(task):
            async with semaphore:
                return await task
        
        executed_tasks = [bounded_execute(task) for task in tasks]
        agent_results = await asyncio.gather(*executed_tasks, return_exceptions=True)
        
        # Process results
        for i, result in enumerate(agent_results):
            agent_name = workflow_agents[i]
            if isinstance(result, Exception):
                results[agent_name] = {
                    "status": "failed",
                    "error": str(result)
                }
            else:
                results[agent_name] = result
        
        # Compile final report
        final_report = self._compile_report(results)
        
        # Update session
        self.active_sessions[session_id]["status"] = "completed"
        self.active_sessions[session_id]["completed_at"] = datetime.utcnow().isoformat()
        self.active_sessions[session_id]["results"] = results
        self.active_sessions[session_id]["final_report"] = final_report
        
        # Add to history
        self.workflow_history.append(self.active_sessions[session_id])
        
        return final_report
    
    async def _execute_agent_with_retry(self, agent: BaseAgent, project_data: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Execute an agent with retry logic."""
        for attempt in range(self.config["retry_count"]):
            try:
                result = await agent.run(project_data)
                if result.get("status") != "failed":
                    return result
            except Exception as e:
                logger.warning(f"Agent {agent.name} attempt {attempt + 1} failed: {str(e)}")
                if attempt == self.config["retry_count"] - 1:
                    raise
                await asyncio.sleep(1 * (attempt + 1))  # Exponential backoff
        
        return {"status": "failed", "error": "Max retries exceeded"}
    
    def _compile_report(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Compile all agent results into a final report."""
        report = {
            "generated_at": datetime.utcnow().isoformat(),
            "agents": {},
            "summary": {
                "total_agents": len(results),
                "passed": 0,
                "failed": 0,
                "warnings": 0
            },
            "overall_status": "pass"
        }
        
        for agent_name, result in results.items():
            agent_report = {
                "status": result.get("status", "unknown"),
                "compliance": result.get("is_compliant", None),
                "details": result.get("details", {}),
                "errors": result.get("errors", [])
            }
            report["agents"][agent_name] = agent_report
            
            # Update summary
            if agent_report["status"] == "completed":
                if agent_report["compliance"] is True:
                    report["summary"]["passed"] += 1
                elif agent_report["compliance"] is False:
                    report["summary"]["failed"] += 1
                    report["overall_status"] = "fail"
                else:
                    report["summary"]["warnings"] += 1
                    if report["overall_status"] == "pass":
                        report["overall_status"] = "warning"
            else:
                report["summary"]["failed"] += 1
                report["overall_status"] = "fail"
        
        return report
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session by ID."""
        return self.active_sessions.get(session_id)
    
    def get_all_sessions(self) -> List[Dict[str, Any]]:
        """Get all active sessions."""
        return list(self.active_sessions.values())
    
    def get_workflow_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get workflow history."""
        return self.workflow_history[-limit:]
    
    def get_agent_stats(self) -> Dict[str, Dict[str, Any]]:
        """Get statistics for all registered agents."""
        stats = {}
        for agent_name in self.config["default_agents"]:
            agent = self.registry.get_agent(agent_name)
            if agent:
                stats[agent_name] = agent.get_stats()
        return stats
