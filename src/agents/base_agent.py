"""Base compliance agent class."""

from typing import Dict, Any, List
from datetime import datetime
import logging

from ..orchestrator.base import BaseAgent

logger = logging.getLogger(__name__)


class BaseComplianceAgent(BaseAgent):
    """Base class for compliance checking agents."""
    
    def __init__(self, name: str, description: str = ""):
        super().__init__(name, description)
        self.compliance_rules: List[Dict[str, Any]] = []
        self.jurisdictions: List[str] = []
    
    def load_compliance_rules(self, rules: List[Dict[str, Any]]):
        """Load compliance rules for this agent."""
        self.compliance_rules = rules
        logger.info(f"Loaded {len(rules)} compliance rules for {self.name}")
    
    def add_jurisdiction(self, jurisdiction: str):
        """Add a jurisdiction to this agent's scope."""
        if jurisdiction not in self.jurisdictions:
            self.jurisdictions.append(jurisdiction)
    
    async def validate(self, project_data: Dict[str, Any]) -> bool:
        """Validate project data against compliance rules."""
        # Default implementation - override in subclasses
        return True
    
    def check_rule(self, project_data: Dict[str, Any], rule: Dict[str, Any]) -> Dict[str, Any]:
        """Check a single rule against project data."""
        # Default implementation - override in subclasses
        return {
            "rule": rule.get("name", "Unknown Rule"),
            "passed": True,
            "details": "Rule validation not implemented"
        }
    
    def get_compliance_summary(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get compliance summary from individual rule checks."""
        passed = sum(1 for r in results if r.get("passed", False))
        failed = len(results) - passed
        
        return {
            "total_checks": len(results),
            "passed": passed,
            "failed": failed,
            "compliance_rate": passed / len(results) if results else 0,
            "details": results
        }
