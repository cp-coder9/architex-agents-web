"""Wall compliance agent for checking wall specifications."""

from typing import Dict, Any, List
from datetime import datetime
import logging

from .base_agent import BaseComplianceAgent

logger = logging.getLogger(__name__)


class WallAgent(BaseComplianceAgent):
    """Agent for checking wall compliance with SANS 10400 and municipal regulations."""
    
    def __init__(self):
        super().__init__(
            name="wall_agent",
            description="Checks walls for compliance with SANS 10400, thickness, material, and reinforcement requirements"
        )
        self.jurisdictions = ["Johannesburg", "National"]
        self._load_default_rules()
    
    def _load_default_rules(self):
        """Load default compliance rules for walls."""
        self.compliance_rules = [
            {
                "id": "wall_001",
                "name": "Minimum Wall Thickness",
                "category": "structural",
                "jurisdiction": "National",
                "code": "SANS 10400-2011",
                "description": "Walls must meet minimum thickness requirements based on height and material",
                "min_thickness_mm": 100,
                "max_height_mm": 3000
            },
            {
                "id": "wall_002",
                "name": "Material Specification",
                "category": "material",
                "jurisdiction": "National",
                "code": "SANS 10400-2011",
                "description": "Wall materials must meet specified standards",
                "allowed_materials": ["concrete", "brick", "block", "steel", "timber", "composite"]
            },
            {
                "id": "wall_003",
                "name": "Reinforcement Requirements",
                "category": "structural",
                "jurisdiction": "National",
                "code": "SANS 10400-2011",
                "description": "Reinforced concrete walls must meet reinforcement standards",
                "min_reinforcement_ratio": 0.006,
                "max_spacing_mm": 400
            },
            {
                "id": "wall_004",
                "name": "Wall Continuity",
                "category": "structural",
                "jurisdiction": "Johannesburg",
                "code": "JHB Building Regulations",
                "description": "Walls must be continuous without unexpected gaps",
                "allowable_gap_mm": 50
            },
            {
                "id": "wall_005",
                "name": "Fire Resistance Rating",
                "category": "safety",
                "jurisdiction": "National",
                "code": "SANS 10400-XB-2011",
                "description": "Walls must meet fire resistance requirements based on building type",
                "frr_minutes": 60
            }
        ]
    
    async def analyze(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze wall specifications in project data."""
        walls = project_data.get("walls", [])
        building_type = project_data.get("building_type", "residential")
        
        results = []
        issues = []
        
        for wall in walls:
            wall_results = self._check_wall(wall, building_type)
            results.extend(wall_results["results"])
            issues.extend(wall_results.get("issues", []))
        
        summary = self.get_compliance_summary(results)
        
        return {
            "status": "completed",
            "is_compliant": summary["failed"] == 0,
            "summary": summary,
            "details": {
                "walls_analyzed": len(walls),
                "issues_found": len(issues),
                "issues": issues[:10]  # Limit to first 10 issues
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _check_wall(self, wall: Dict[str, Any], building_type: str) -> Dict[str, Any]:
        """Check a single wall against compliance rules."""
        results = []
        issues = []
        
        # Check thickness
        thickness = wall.get("thickness_mm", 0)
        if thickness < 100:
            results.append({
                "rule": "Minimum Wall Thickness",
                "passed": False,
                "details": f"Wall thickness {thickness}mm is below minimum 100mm"
            })
            issues.append({
                "type": "thickness",
                "wall_id": wall.get("id", "unknown"),
                "actual": thickness,
                "minimum": 100,
                "severity": "critical"
            })
        else:
            results.append({
                "rule": "Minimum Wall Thickness",
                "passed": True,
                "details": f"Wall thickness {thickness}mm meets minimum requirement"
            })
        
        # Check material
        material = wall.get("material", "unknown")
        allowed_materials = ["concrete", "brick", "block", "steel", "timber", "composite"]
        if material not in allowed_materials:
            results.append({
                "rule": "Material Specification",
                "passed": False,
                "details": f"Material '{material}' is not in allowed list"
            })
            issues.append({
                "type": "material",
                "wall_id": wall.get("id", "unknown"),
                "actual": material,
                "allowed": allowed_materials,
                "severity": "warning"
            })
        else:
            results.append({
                "rule": "Material Specification",
                "passed": True,
                "details": f"Material '{material}' is approved"
            })
        
        # Check reinforcement
        if material == "concrete" and wall.get("is_reinforced", False):
            reinforcement_ratio = wall.get("reinforcement_ratio", 0)
            if reinforcement_ratio < 0.006:
                results.append({
                    "rule": "Reinforcement Requirements",
                    "passed": False,
                    "details": f"Reinforcement ratio {reinforcement_ratio} is below minimum 0.006"
                })
                issues.append({
                    "type": "reinforcement",
                    "wall_id": wall.get("id", "unknown"),
                    "actual": reinforcement_ratio,
                    "minimum": 0.006,
                    "severity": "critical"
                })
            else:
                results.append({
                    "rule": "Reinforcement Requirements",
                    "passed": True,
                    "details": f"Reinforcement ratio {reinforcement_ratio} meets requirements"
                })
        
        # Check continuity
        gap = wall.get("gap_mm", 0)
        if gap > 50:
            results.append({
                "rule": "Wall Continuity",
                "passed": False,
                "details": f"Wall gap {gap}mm exceeds maximum 50mm"
            })
            issues.append({
                "type": "continuity",
                "wall_id": wall.get("id", "unknown"),
                "actual": gap,
                "maximum": 50,
                "severity": "warning"
            })
        else:
            results.append({
                "rule": "Wall Continuity",
                "passed": True,
                "details": f"Wall gap {gap}mm is acceptable"
            })
        
        return {
            "results": results,
            "issues": issues
        }
    
    async def validate(self, project_data: Dict[str, Any]) -> bool:
        """Validate project data against wall compliance rules."""
        result = await self.analyze(project_data)
        return result.get("is_compliant", False)
