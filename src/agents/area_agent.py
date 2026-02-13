"""Area compliance agent for room area calculations and zoning validation."""

from typing import Dict, Any, List
from datetime import datetime
import logging

from .base_agent import BaseComplianceAgent

logger = logging.getLogger(__name__)


class AreaAgent(BaseComplianceAgent):
    """Agent for computing room areas and validating against zoning requirements."""
    
    def __init__(self):
        super().__init__(
            name="area_agent",
            description="Computes room areas and validates against municipal and SANS minimum areas and zoning overlays"
        )
        self.jurisdictions = ["Johannesburg", "National"]
        self._load_default_rules()
    
    def _load_default_rules(self):
        """Load default compliance rules."""
        self.compliance_rules = [
            {
                "id": "area_001",
                "name": "Minimum Room Areas",
                "category": "space",
                "jurisdiction": "National",
                "code": "SANS 10400-2011",
                "description": "Rooms must meet minimum area requirements",
                "minimum_areas": {
                    "bedroom": 8.0,
                    "living_room": 12.0,
                    "kitchen": 4.0,
                    "bathroom": 2.5,
                    "office": 6.0,
                    "dining_room": 10.0
                }
            },
            {
                "id": "area_002",
                "name": "Floor Area Ratio (FAR)",
                "category": "zoning",
                "jurisdiction": "Johannesburg",
                "code": "JHB Zoning Regulations",
                "description": "Building floor area must comply with FAR limits",
                "max_far": 0.5
            },
            {
                "id": "area_003",
                "name": "Gross Floor Area",
                "category": "calculation",
                "jurisdiction": "National",
                "code": "SANS 10400-2011",
                "description": "Gross floor area must be calculated correctly"
            },
            {
                "id": "area_004",
                "name": "Usable Area",
                "category": "calculation",
                "jurisdiction": "National",
                "code": "SANS 10400-2011",
                "description": "Usable area must exclude non-habitable spaces"
            }
        ]
    
    async def analyze(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze room areas and zoning compliance."""
        rooms = project_data.get("rooms", [])
        building = project_data.get("building", {})
        zoning = project_data.get("zoning", {})
        
        results = []
        issues = []
        
        # Calculate room areas
        area_results = self._calculate_room_areas(rooms)
        results.extend(area_results["results"])
        issues.extend(area_results.get("issues", []))
        
        # Check minimum areas
        min_area_results = self._check_minimum_areas(rooms)
        results.extend(min_area_results["results"])
        issues.extend(min_area_results.get("issues", []))
        
        # Check FAR
        far_results = self._check_far(building, zoning)
        results.extend(far_results["results"])
        issues.extend(far_results.get("issues", []))
        
        summary = self.get_compliance_summary(results)
        
        return {
            "status": "completed",
            "is_compliant": summary["failed"] == 0,
            "summary": summary,
            "details": {
                "rooms_analyzed": len(rooms),
                "total_area_sqm": sum(r.get("area_sqm", 0) for r in rooms),
                "issues_found": len(issues),
                "issues": issues[:10]
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _calculate_room_areas(self, rooms: List[Dict]) -> Dict[str, Any]:
        """Calculate and verify room areas."""
        results = []
        issues = []
        
        total_calculated = 0
        for room in rooms:
            # Calculate area from dimensions if not provided
            if "area_sqm" not in room:
                length = room.get("length_m", 0)
                width = room.get("width_m", 0)
                room["area_sqm"] = length * width
            
            area = room.get("area_sqm", 0)
            total_calculated += area
            
            # Verify area calculation
            if area <= 0:
                results.append({
                    "rule": f"Room Area Calculation",
                    "passed": False,
                    "details": f"Room {room.get('id', 'unknown')} has invalid area: {area}m²"
                })
                issues.append({
                    "type": "area_calculation",
                    "room_id": room.get("id", "unknown"),
                    "area": area,
                    "severity": "critical"
                })
            else:
                results.append({
                    "rule": f"Room Area Calculation",
                    "passed": True,
                    "details": f"Room {room.get('id', 'unknown')}: {area}m²"
                })
        
        return {"results": results, "issues": issues}
    
    def _check_minimum_areas(self, rooms: List[Dict]) -> Dict[str, Any]:
        """Check rooms against minimum area requirements."""
        results = []
        issues = []
        
        minimum_areas = {
            "bedroom": 8.0,
            "living_room": 12.0,
            "kitchen": 4.0,
            "bathroom": 2.5,
            "office": 6.0,
            "dining_room": 10.0
        }
        
        min_area_violations = []
        for room in rooms:
            room_type = room.get("type", "unknown")
            area = room.get("area_sqm", 0)
            
            min_area = minimum_areas.get(room_type, 0)
            if min_area > 0 and area < min_area:
                min_area_violations.append({
                    "type": "minimum_area",
                    "room_id": room.get("id", "unknown"),
                    "room_type": room_type,
                    "actual": area,
                    "minimum": min_area,
                    "severity": "warning"
                })
        
        if min_area_violations:
            results.append({
                "rule": "Minimum Room Areas",
                "passed": False,
                "details": f"{len(min_area_violations)} rooms below minimum area requirements"
            })
            issues.append({
                "type": "minimum_area",
                "violations": min_area_violations[:10],
                "severity": "warning"
            })
        else:
            results.append({
                "rule": "Minimum Room Areas",
                "passed": True,
                "details": "All rooms meet minimum area requirements"
            })
        
        return {"results": results, "issues": issues}
    
    def _check_far(self, building: Dict, zoning: Dict) -> Dict[str, Any]:
        """Check Floor Area Ratio compliance."""
        results = []
        issues = []
        
        gross_floor_area = building.get("gross_floor_area_sqm", 0)
        lot_area = zoning.get("lot_area_sqm", 0)
        max_far = zoning.get("max_far", 0.5)
        
        if lot_area > 0:
            actual_far = gross_floor_area / lot_area
            
            if actual_far > max_far:
                results.append({
                    "rule": "Floor Area Ratio (FAR)",
                    "passed": False,
                    "details": f"FAR {actual_far:.2f} exceeds maximum {max_far}"
                })
                issues.append({
                    "type": "far",
                    "actual": actual_far,
                    "maximum": max_far,
                    "severity": "critical"
                })
            else:
                results.append({
                    "rule": "Floor Area Ratio (FAR)",
                    "passed": True,
                    "details": f"FAR {actual_far:.2f} is within limit {max_far}"
                })
        else:
            results.append({
                "rule": "Floor Area Ratio (FAR)",
                "passed": True,
                "details": "No lot area specified, FAR calculation skipped"
            })
        
        return {"results": results, "issues": issues}
    
    async def validate(self, project_data: Dict[str, Any]) -> bool:
        """Validate project data against area compliance rules."""
        result = await self.analyze(project_data)
        return result.get("is_compliant", False)
