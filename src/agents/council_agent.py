"""Council readiness agent for checking submission completeness."""

from typing import Dict, Any, List
from datetime import datetime
import logging

from .base_agent import BaseComplianceAgent

logger = logging.getLogger(__name__)


class CouncilCheckAgent(BaseComplianceAgent):
    """Agent for checking council submission readiness and completeness."""
    
    def __init__(self):
        super().__init__(
            name="council_agent",
            description="Aggregates all agent outputs and checks for missing council submission items"
        )
        self.jurisdictions = ["Johannesburg", "National"]
        self._load_default_rules()
    
    def _load_default_rules(self):
        """Load default compliance rules."""
        self.compliance_rules = [
            {
                "id": "council_001",
                "name": "Site Plan",
                "category": "documentation",
                "jurisdiction": "Johannesburg",
                "code": "JHB Building Regulations",
                "description": "Site plan must be included in submission"
            },
            {
                "id": "council_002",
                "name": "Sewer Layout",
                "category": "documentation",
                "jurisdiction": "Johannesburg",
                "code": "JHB Building Regulations",
                "description": "Sewer layout must be included in submission"
            },
            {
                "id": "council_003",
                "name": "Title Deed Annotations",
                "category": "documentation",
                "jurisdiction": "National",
                "code": "National Building Regulations",
                "description": "Title deed annotations must be included if applicable"
            },
            {
                "id": "council_004",
                "name": "North Arrow",
                "category": "drafting",
                "jurisdiction": "National",
                "code": "SANS 10400-2011",
                "description": "Drawings must include north arrow"
            },
            {
                "id": "council_005",
                "name": "Zoning Certificate",
                "category": "documentation",
                "jurisdiction": "Johannesburg",
                "code": "JHB Zoning Regulations",
                "description": "Zoning certificate must be included in submission"
            },
            {
                "id": "council_006",
                "name": "Drainage Layout",
                "category": "documentation",
                "jurisdiction": "Johannesburg",
                "code": "JHB Building Regulations",
                "description": "Drainage layout must be included in submission"
            }
        ]
    
    async def analyze(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze council submission readiness."""
        files = project_data.get("files", [])
        drawings = project_data.get("drawings", [])
        compliance_results = project_data.get("compliance_results", {})
        
        results = []
        issues = []
        
        # Check required documents
        doc_results = self._check_required_documents(files)
        results.extend(doc_results["results"])
        issues.extend(doc_results.get("issues", []))
        
        # Check drawings
        drawing_results = self._check_drawings(drawings)
        results.extend(drawing_results["results"])
        issues.extend(drawing_results.get("issues", []))
        
        # Check compliance results
        compliance_results = self._check_compliance_results(compliance_results)
        results.extend(compliance_results["results"])
        issues.extend(compliance_results.get("issues", []))
        
        summary = self.get_compliance_summary(results)
        
        return {
            "status": "completed",
            "is_compliant": summary["failed"] == 0,
            "summary": summary,
            "details": {
                "files_reviewed": len(files),
                "drawings_reviewed": len(drawings),
                "compliance_checks": len(compliance_results),
                "issues_found": len(issues),
                "issues": issues[:10]
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _check_required_documents(self, files: List[Dict]) -> Dict[str, Any]:
        """Check for required council submission documents."""
        results = []
        issues = []
        
        required_docs = {
            "site_plan": "Site Plan",
            "sewer_layout": "Sewer Layout",
            "title_deed": "Title Deed Annotations",
            "zoning_certificate": "Zoning Certificate",
            "drainage_layout": "Drainage Layout"
        }
        
        missing_docs = []
        for doc_type, doc_name in required_docs.items():
            found = False
            for file in files:
                if doc_type in file.get("name", "").lower() or doc_type in file.get("type", "").lower():
                    found = True
                    break
            
            if not found:
                missing_docs.append(doc_name)
        
        if missing_docs:
            results.append({
                "rule": "Required Documents",
                "passed": False,
                "details": f"Missing documents: {', '.join(missing_docs)}"
            })
            issues.append({
                "type": "missing_documents",
                "missing": missing_docs,
                "severity": "critical"
            })
        else:
            results.append({
                "rule": "Required Documents",
                "passed": True,
                "details": "All required documents are present"
            })
        
        return {"results": results, "issues": issues}
    
    def _check_drawings(self, drawings: List[Dict]) -> Dict[str, Any]:
        """Check drawing requirements."""
        results = []
        issues = []
        
        north_arrow_missing = True
        for drawing in drawings:
            if drawing.get("has_north_arrow", False):
                north_arrow_missing = False
                break
        
        if north_arrow_missing:
            results.append({
                "rule": "North Arrow",
                "passed": False,
                "details": "North arrow missing from drawings"
            })
            issues.append({
                "type": "north_arrow",
                "severity": "warning"
            })
        else:
            results.append({
                "rule": "North Arrow",
                "passed": True,
                "details": "North arrow present on drawings"
            })
        
        return {"results": results, "issues": issues}
    
    def _check_compliance_results(self, compliance_results: Dict) -> Dict[str, Any]:
        """Check compliance results from other agents."""
        results = []
        issues = []
        
        # Check if all required compliance checks are present
        required_agents = [
            "wall_agent",
            "dimension_agent",
            "window_door_agent",
            "area_agent",
            "energy_agent"
        ]
        
        missing_agents = []
        for agent in required_agents:
            if agent not in compliance_results:
                missing_agents.append(agent)
        
        if missing_agents:
            results.append({
                "rule": "Compliance Checks",
                "passed": False,
                "details": f"Missing compliance results from: {', '.join(missing_agents)}"
            })
            issues.append({
                "type": "missing_compliance",
                "missing_agents": missing_agents,
                "severity": "warning"
            })
        else:
            results.append({
                "rule": "Compliance Checks",
                "passed": True,
                "details": "All required compliance checks are present"
            })
        
        # Check for critical issues
        critical_issues = []
        for agent_name, agent_result in compliance_results.items():
            if isinstance(agent_result, dict):
                if agent_result.get("status") == "failed":
                    critical_issues.append(agent_name)
                elif agent_result.get("is_compliant") is False:
                    critical_issues.append(agent_name)
        
        if critical_issues:
            issues.append({
                "type": "critical_compliance_issues",
                "agents_with_issues": critical_issues,
                "severity": "critical"
            })
        
        return {"results": results, "issues": issues}
    
    async def validate(self, project_data: Dict[str, Any]) -> bool:
        """Validate project data against council submission requirements."""
        result = await self.analyze(project_data)
        return result.get("is_compliant", False)
