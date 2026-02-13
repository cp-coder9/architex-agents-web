"""Dimension compliance agent for checking dimension specifications."""

from typing import Dict, Any, List
from datetime import datetime
import logging

from .base_agent import BaseComplianceAgent

logger = logging.getLogger(__name__)


class DimensionAgent(BaseComplianceAgent):
    """Agent for checking dimension compliance with SANS 10400 and municipal regulations."""
    
    def __init__(self):
        super().__init__(
            name="dimension_agent",
            description="Checks dimensions for scale consistency, minimum room sizes, and placement"
        )
        self.jurisdictions = ["Johannesburg", "National"]
        self._load_default_rules()
    
    def _load_default_rules(self):
        """Load default compliance rules for dimensions."""
        self.compliance_rules = [
            {
                "id": "dim_001",
                "name": "Scale Consistency",
                "category": "drafting",
                "jurisdiction": "National",
                "code": "SANS 10400-2011",
                "description": "All dimensions must use consistent scale"
            },
            {
                "id": "dim_002",
                "name": "Minimum Room Size",
                "category": "space",
                "jurisdiction": "National",
                "code": "SANS 10400-2011",
                "description": "Rooms must meet minimum size requirements",
                "minimum_sizes": {
                    "bedroom": 8.0,  # square meters
                    "living_room": 12.0,
                    "kitchen": 4.0,
                    "bathroom": 2.5,
                    "office": 6.0
                }
            },
            {
                "id": "dim_003",
                "name": "Dimension Placement",
                "category": "drafting",
                "jurisdiction": "National",
                "code": "SANS 10400-2011",
                "description": "Dimensions must be placed legibly and correctly"
            },
            {
                "id": "dim_004",
                "name": "Dimension Accuracy",
                "category": "accuracy",
                "jurisdiction": "National",
                "code": "SANS 10400-2011",
                "description": "Dimensions must be accurate within tolerance",
                "tolerance_mm": 5
            }
        ]
    
    async def analyze(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze dimension specifications in project data."""
        dimensions = project_data.get("dimensions", [])
        rooms = project_data.get("rooms", [])
        
        results = []
        issues = []
        
        # Check scale consistency
        scale_results = self._check_scale(dimensions)
        results.extend(scale_results["results"])
        issues.extend(scale_results.get("issues", []))
        
        # Check room sizes
        room_results = self._check_room_sizes(rooms)
        results.extend(room_results["results"])
        issues.extend(room_results.get("issues", []))
        
        # Check dimension placement
        placement_results = self._check_placement(dimensions)
        results.extend(placement_results["results"])
        issues.extend(placement_results.get("issues", []))
        
        summary = self.get_compliance_summary(results)
        
        return {
            "status": "completed",
            "is_compliant": summary["failed"] == 0,
            "summary": summary,
            "details": {
                "dimensions_analyzed": len(dimensions),
                "rooms_checked": len(rooms),
                "issues_found": len(issues),
                "issues": issues[:10]
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _check_scale(self, dimensions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Check scale consistency across dimensions."""
        results = []
        issues = []
        
        if not dimensions:
            results.append({
                "rule": "Scale Consistency",
                "passed": True,
                "details": "No dimensions to check"
            })
            return {"results": results, "issues": issues}
        
        scales = set()
        for dim in dimensions:
            scale = dim.get("scale", "unknown")
            scales.add(scale)
        
        if len(scales) > 1:
            results.append({
                "rule": "Scale Consistency",
                "passed": False,
                "details": f"Inconsistent scales found: {', '.join(scales)}"
            })
            issues.append({
                "type": "scale",
                "scales_found": list(scales),
                "severity": "critical"
            })
        else:
            results.append({
                "rule": "Scale Consistency",
                "passed": True,
                "details": f"All dimensions use consistent scale: {list(scales)[0]}"
            })
        
        return {"results": results, "issues": issues}
    
    def _check_room_sizes(self, rooms: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Check room sizes against minimum requirements."""
        results = []
        issues = []
        
        minimum_sizes = {
            "bedroom": 8.0,
            "living_room": 12.0,
            "kitchen": 4.0,
            "bathroom": 2.5,
            "office": 6.0
        }
        
        for room in rooms:
            room_type = room.get("type", "unknown")
            area = room.get("area_sqm", 0)
            
            min_size = minimum_sizes.get(room_type, 0)
            
            if min_size > 0 and area < min_size:
                results.append({
                    "rule": f"Minimum {room_type.replace('_', ' ').title()} Size",
                    "passed": False,
                    "details": f"Room area {area}m² is below minimum {min_size}m²"
                })
                issues.append({
                    "type": "room_size",
                    "room_id": room.get("id", "unknown"),
                    "room_type": room_type,
                    "actual": area,
                    "minimum": min_size,
                    "severity": "warning"
                })
            else:
                results.append({
                    "rule": f"Minimum {room_type.replace('_', ' ').title()} Size",
                    "passed": True,
                    "details": f"Room area {area}m² meets minimum requirement"
                })
        
        return {"results": results, "issues": issues}
    
    def _check_placement(self, dimensions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Check dimension placement for legibility."""
        results = []
        issues = []
        
        legible_count = 0
        for dim in dimensions:
            if dim.get("legible", True):
                legible_count += 1
        
        if legible_count < len(dimensions):
            results.append({
                "rule": "Dimension Placement",
                "passed": False,
                "details": f"{len(dimensions) - legible_count} dimensions are not legible"
            })
            issues.append({
                "type": "placement",
                "total_dimensions": len(dimensions),
                "legible_dimensions": legible_count,
                "severity": "warning"
            })
        else:
            results.append({
                "rule": "Dimension Placement",
                "passed": True,
                "details": "All dimensions are legible and properly placed"
            })
        
        return {"results": results, "issues": issues}
    
    async def validate(self, project_data: Dict[str, Any]) -> bool:
        """Validate project data against dimension compliance rules."""
        result = await self.analyze(project_data)
        return result.get("is_compliant", False)
