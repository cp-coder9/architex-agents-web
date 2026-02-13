"""Energy and insulation compliance agent for SANS 10400-XA compliance."""

from typing import Dict, Any, List
from datetime import datetime
import logging

from .base_agent import BaseComplianceAgent

logger = logging.getLogger(__name__)


class EnergyAgent(BaseComplianceAgent):
    """Agent for checking energy and insulation compliance with SANS 10400-XA."""
    
    def __init__(self):
        super().__init__(
            name="energy_agent",
            description="Evaluates glazing ratios, wall/roof insulation, and orientation for SANS 10400-XA compliance"
        )
        self.jurisdictions = ["Johannesburg", "National"]
        self._load_default_rules()
    
    def _load_default_rules(self):
        """Load default compliance rules."""
        self.compliance_rules = [
            {
                "id": "energy_001",
                "name": "Glazing Ratio",
                "category": "energy",
                "jurisdiction": "National",
                "code": "SANS 10400-XA-2011",
                "description": "Glazing area must not exceed maximum ratio of wall area",
                "max_glazing_ratio": 0.2
            },
            {
                "id": "energy_002",
                "name": "Wall Insulation",
                "category": "insulation",
                "jurisdiction": "National",
                "code": "SANS 10400-XA-2011",
                "description": "Walls must meet minimum R-value requirements",
                "min_r_value": 1.5
            },
            {
                "id": "energy_003",
                "name": "Roof Insulation",
                "category": "insulation",
                "jurisdiction": "National",
                "code": "SANS 10400-XA-2011",
                "description": "Roofs must meet minimum R-value requirements",
                "min_r_value": 3.5
            },
            {
                "id": "energy_004",
                "name": "Orientation",
                "category": "design",
                "jurisdiction": "National",
                "code": "SANS 10400-XA-2011",
                "description": "Building orientation should optimize solar gain"
            }
        ]
    
    async def analyze(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze energy and insulation specifications."""
        building = project_data.get("building", {})
        walls = project_data.get("walls", [])
        roofs = project_data.get("roofs", [])
        windows = project_data.get("windows", [])
        orientation = building.get("orientation", {})
        
        results = []
        issues = []
        
        # Check glazing ratio
        glazing_results = self._check_glazing_ratio(windows, walls)
        results.extend(glazing_results["results"])
        issues.extend(glazing_results.get("issues", []))
        
        # Check wall insulation
        wall_results = self._check_wall_insulation(walls)
        results.extend(wall_results["results"])
        issues.extend(wall_results.get("issues", []))
        
        # Check roof insulation
        roof_results = self._check_roof_insulation(roofs)
        results.extend(roof_results["results"])
        issues.extend(roof_results.get("issues", []))
        
        # Check orientation
        orientation_results = self._check_orientation(orientation)
        results.extend(orientation_results["results"])
        issues.extend(orientation_results.get("issues", []))
        
        summary = self.get_compliance_summary(results)
        
        return {
            "status": "completed",
            "is_compliant": summary["failed"] == 0,
            "summary": summary,
            "details": {
                "walls_analyzed": len(walls),
                "roofs_analyzed": len(roofs),
                "windows_analyzed": len(windows),
                "issues_found": len(issues),
                "issues": issues[:10]
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _check_glazing_ratio(self, windows: List[Dict], walls: List[Dict]) -> Dict[str, Any]:
        """Check glazing ratio compliance."""
        results = []
        issues = []
        
        max_ratio = 0.2
        
        total_wall_area = sum(w.get("area_sqm", 0) for w in walls)
        total_glazing_area = sum(w.get("area_sqm", 0) for w in windows)
        
        if total_wall_area > 0:
            glazing_ratio = total_glazing_area / total_wall_area
            
            if glazing_ratio > max_ratio:
                results.append({
                    "rule": "Glazing Ratio",
                    "passed": False,
                    "details": f"Glazing ratio {glazing_ratio:.2f} exceeds maximum {max_ratio}"
                })
                issues.append({
                    "type": "glazing_ratio",
                    "actual": glazing_ratio,
                    "maximum": max_ratio,
                    "severity": "warning"
                })
            else:
                results.append({
                    "rule": "Glazing Ratio",
                    "passed": True,
                    "details": f"Glazing ratio {glazing_ratio:.2f} is within limit {max_ratio}"
                })
        else:
            results.append({
                "rule": "Glazing Ratio",
                "passed": True,
                "details": "No wall area specified, glazing ratio calculation skipped"
            })
        
        return {"results": results, "issues": issues}
    
    def _check_wall_insulation(self, walls: List[Dict]) -> Dict[str, Any]:
        """Check wall insulation compliance."""
        results = []
        issues = []
        
        min_r_value = 1.5
        
        insulation_issues = []
        for wall in walls:
            r_value = wall.get("r_value", 0)
            if r_value < min_r_value:
                insulation_issues.append({
                    "type": "wall_insulation",
                    "wall_id": wall.get("id", "unknown"),
                    "actual_r_value": r_value,
                    "minimum_r_value": min_r_value,
                    "severity": "warning"
                })
        
        if insulation_issues:
            results.append({
                "rule": "Wall Insulation",
                "passed": False,
                "details": f"{len(insulation_issues)} walls below minimum R-value {min_r_value}"
            })
            issues.append({
                "type": "wall_insulation",
                "issues": insulation_issues[:10],
                "severity": "warning"
            })
        else:
            results.append({
                "rule": "Wall Insulation",
                "passed": True,
                "details": f"All walls meet minimum R-value {min_r_value}"
            })
        
        return {"results": results, "issues": issues}
    
    def _check_roof_insulation(self, roofs: List[Dict]) -> Dict[str, Any]:
        """Check roof insulation compliance."""
        results = []
        issues = []
        
        min_r_value = 3.5
        
        insulation_issues = []
        for roof in roofs:
            r_value = roof.get("r_value", 0)
            if r_value < min_r_value:
                insulation_issues.append({
                    "type": "roof_insulation",
                    "roof_id": roof.get("id", "unknown"),
                    "actual_r_value": r_value,
                    "minimum_r_value": min_r_value,
                    "severity": "warning"
                })
        
        if insulation_issues:
            results.append({
                "rule": "Roof Insulation",
                "passed": False,
                "details": f"{len(insulation_issues)} roofs below minimum R-value {min_r_value}"
            })
            issues.append({
                "type": "roof_insulation",
                "issues": insulation_issues[:10],
                "severity": "warning"
            })
        else:
            results.append({
                "rule": "Roof Insulation",
                "passed": True,
                "details": f"All roofs meet minimum R-value {min_r_value}"
            })
        
        return {"results": results, "issues": issues}
    
    def _check_orientation(self, orientation: Dict) -> Dict[str, Any]:
        """Check building orientation for energy efficiency."""
        results = []
        issues = []
        
        # Check if orientation information is provided
        if not orientation:
            results.append({
                "rule": "Orientation",
                "passed": True,
                "details": "Orientation not specified, assumed compliant"
            })
            return {"results": results, "issues": issues}
        
        # Check main orientation
        main_orientation = orientation.get("main_facing", "north")
        
        # Optimal orientation for South Africa is north (for passive solar heating)
        if main_orientation.lower() in ["north", "northeast", "northwest"]:
            results.append({
                "rule": "Orientation",
                "passed": True,
                "details": f"Building faces {main_orientation}, optimal for solar gain"
            })
        else:
            results.append({
                "rule": "Orientation",
                "passed": True,
                "details": f"Building faces {main_orientation}, consider optimization for solar gain",
                "warning": "Non-optimal orientation for passive solar heating"
            })
        
        return {"results": results, "issues": issues}
    
    async def validate(self, project_data: Dict[str, Any]) -> bool:
        """Validate project data against energy compliance rules."""
        result = await self.analyze(project_data)
        return result.get("is_compliant", False)
