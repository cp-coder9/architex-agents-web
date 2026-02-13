"""Compliance formatter agent for generating human-readable reports."""

from typing import Dict, Any, List
from datetime import datetime
import logging

from .base_agent import BaseComplianceAgent

logger = logging.getLogger(__name__)


class ComplianceFormatterAgent(BaseComplianceAgent):
    """Agent for compiling compliance findings into human-readable reports."""
    
    def __init__(self):
        super().__init__(
            name="compliance_formatter_agent",
            description="Compiles findings into human-readable report with PASS/FAIL/WARNINGS summary"
        )
        self.jurisdictions = ["Johannesburg", "National"]
        self._load_default_rules()
    
    def _load_default_rules(self):
        """Load default formatting rules."""
        self.compliance_rules = [
            {
                "id": "format_001",
                "name": "Report Structure",
                "category": "formatting",
                "jurisdiction": "National",
                "code": "Internal Standards",
                "description": "Compliance reports must follow standard structure"
            },
            {
                "id": "format_002",
                "name": "Summary Section",
                "category": "formatting",
                "jurisdiction": "National",
                "code": "Internal Standards",
                "description": "Reports must include PASS/FAIL/WARNINGS summary"
            },
            {
                "id": "format_003",
                "name": "Recommendations",
                "category": "formatting",
                "jurisdiction": "National",
                "code": "Internal Standards",
                "description": "Reports must include suggested corrections"
            }
        ]
    
    async def analyze(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Format compliance findings into a human-readable report."""
        compliance_results = project_data.get("compliance_results", {})
        project_info = project_data.get("project_info", {})
        
        # Generate formatted report
        report = self._generate_report(compliance_results, project_info)
        
        return {
            "status": "completed",
            "is_compliant": True,  # This agent doesn't validate, just formats
            "report": report,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _generate_report(self, compliance_results: Dict, project_info: Dict) -> Dict[str, Any]:
        """Generate formatted compliance report."""
        # Calculate overall status
        overall_status = self._calculate_overall_status(compliance_results)
        
        # Generate summary
        summary = self._generate_summary(compliance_results, overall_status)
        
        # Generate detailed findings
        detailed_findings = self._generate_detailed_findings(compliance_results)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(compliance_results)
        
        return {
            "report_metadata": {
                "generated_at": datetime.utcnow().isoformat(),
                "report_type": "Compliance Report",
                "version": "1.0"
            },
            "project_info": project_info,
            "summary": summary,
            "detailed_findings": detailed_findings,
            "recommendations": recommendations,
            "overall_status": overall_status
        }
    
    def _calculate_overall_status(self, compliance_results: Dict) -> str:
        """Calculate overall compliance status."""
        if not compliance_results:
            return "unknown"
        
        has_failures = False
        has_warnings = False
        
        for agent_name, result in compliance_results.items():
            if isinstance(result, dict):
                if result.get("status") == "failed":
                    has_failures = True
                elif result.get("is_compliant") is False:
                    has_failures = True
                elif result.get("is_compliant") is None:
                    has_warnings = True
        
        if has_failures:
            return "FAIL"
        elif has_warnings:
            return "WARNINGS"
        else:
            return "PASS"
    
    def _generate_summary(self, compliance_results: Dict, overall_status: str) -> Dict[str, Any]:
        """Generate summary section of the report."""
        total_agents = len(compliance_results)
        passed_agents = 0
        failed_agents = 0
        warning_agents = 0
        
        for agent_name, result in compliance_results.items():
            if isinstance(result, dict):
                if result.get("status") == "completed":
                    if result.get("is_compliant") is True:
                        passed_agents += 1
                    elif result.get("is_compliant") is False:
                        failed_agents += 1
                    else:
                        warning_agents += 1
                else:
                    failed_agents += 1
        
        return {
            "overall_status": overall_status,
            "total_agents": total_agents,
            "passed": passed_agents,
            "failed": failed_agents,
            "warnings": warning_agents,
            "pass_rate": f"{passed_agents}/{total_agents}" if total_agents > 0 else "N/A"
        }
    
    def _generate_detailed_findings(self, compliance_results: Dict) -> List[Dict[str, Any]]:
        """Generate detailed findings section."""
        findings = []
        
        for agent_name, result in compliance_results.items():
            if isinstance(result, dict):
                finding = {
                    "agent": agent_name,
                    "status": result.get("status", "unknown"),
                    "compliance": result.get("is_compliant", None),
                    "details": result.get("details", {}),
                    "summary": result.get("summary", {})
                }
                findings.append(finding)
        
        return findings
    
    def _generate_recommendations(self, compliance_results: Dict) -> List[Dict[str, Any]]:
        """Generate recommendations based on findings."""
        recommendations = []
        
        for agent_name, result in compliance_results.items():
            if isinstance(result, dict):
                if result.get("status") == "failed":
                    recommendations.append({
                        "agent": agent_name,
                        "type": "critical",
                        "message": f"Agent {agent_name} failed to complete analysis. Please review input data."
                    })
                elif result.get("is_compliant") is False:
                    recommendations.append({
                        "agent": agent_name,
                        "type": "critical",
                        "message": f"Compliance failure detected by {agent_name}. Review required."
                    })
                elif result.get("is_compliant") is None:
                    recommendations.append({
                        "agent": agent_name,
                        "type": "warning",
                        "message": f"{agent_name} detected potential issues. Review recommended."
                    })
        
        return recommendations
    
    async def validate(self, project_data: Dict[str, Any]) -> bool:
        """Validate project data against formatting requirements."""
        result = await self.analyze(project_data)
        return result.get("is_compliant", False)
