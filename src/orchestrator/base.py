"""Base agent class for all AI agents in the platform."""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """Base class for all AI agents."""
    
    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
        self.status = "idle"
        self.last_run = None
        self.run_count = 0
        self.success_count = 0
        self.error_count = 0
    
    @abstractmethod
    async def analyze(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze project data and return results."""
        pass
    
    @abstractmethod
    async def validate(self, project_data: Dict[str, Any]) -> bool:
        """Validate project data against compliance rules."""
        pass
    
    async def run(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run the agent analysis with error handling."""
        self.status = "running"
        self.run_count += 1
        start_time = datetime.utcnow()
        
        try:
            result = await self.analyze(project_data)
            self.status = "completed"
            self.success_count += 1
            self.last_run = {
                "start": start_time.isoformat(),
                "end": datetime.utcnow().isoformat(),
                "success": True,
                "result": result
            }
            return result
        except Exception as e:
            self.status = "failed"
            self.error_count += 1
            self.last_run = {
                "start": start_time.isoformat(),
                "end": datetime.utcnow().isoformat(),
                "success": False,
                "error": str(e)
            }
            logger.error(f"Agent {self.name} failed: {str(e)}")
            return {
                "status": "failed",
                "error": str(e),
                "agent": self.name
            }
    
    async def check_compliance(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Check compliance and return detailed report."""
        is_compliant = await self.validate(project_data)
        return {
            "agent": self.name,
            "is_compliant": is_compliant,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get agent statistics."""
        return {
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "run_count": self.run_count,
            "success_count": self.success_count,
            "error_count": self.error_count,
            "last_run": self.last_run
        }
