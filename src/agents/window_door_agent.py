"""Window and door compliance agent."""

from typing import Dict, Any, List
from datetime import datetime
import logging

from .base_agent import BaseComplianceAgent

logger = logging.getLogger(__name__)


class WindowDoorAgent(BaseComplianceAgent):
    """Agent for checking window and door compliance."""
    
    def __init__(self):
        super().__init__(
            name="window_door_agent",
            description="Checks windows and doors for compliance with schedules, sizes, and egress requirements"
        )
        self.jurisdictions = ["Johannesburg", "National"]
        self._load_default_rules()
    
    def _load_default_rules(self):
        """Load default compliance rules."""
        self.compliance_rules = [
            {
                "id": "wd_001",
                "name": "Window/Door Schedules",
                "category": "documentation",
                "jurisdiction": "National",
                "code": "SANS 10400-2011",
                "description": "All windows and doors must have proper schedules"
            },
            {
                "id": "wd_002",
                "name": "Size Compliance",
                "category": "dimensions",
                "jurisdiction": "National",
                "code": "SANS 10400-2011",
                "description": "Window and door sizes must comply with standards",
                "minimum_width_mm": 600,
                "minimum_height_mm": 1800
            },
            {
                "id": "wd_003",
                "name": "Emergency Egress",
                "category": "safety",
                "jurisdiction": "National",
                "code": "SANS 10400-XB-2011",
                "description": "Bedrooms must have emergency egress windows",
                "minimum_opening_area_sqm": 0.33,
                "minimum_opening_width_mm": 450,
                "minimum_opening_height_mm": 450,
                "maximum_sill_height_mm": 1100
            },
            {
                "id": "wd_004",
                "name": "Fire Rating",
                "category": "safety",
                "jurisdiction": "National",
                "code": "SANS 10400-XB-2011",
                "description": "Doors in fire-rated assemblies must have proper fire rating"
            }
        ]
    
    async def analyze(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze window and door specifications."""
        windows = project_data.get("windows", [])
        doors = project_data.get("doors", [])
        rooms = project_data.get("rooms", [])
        
        results = []
        issues = []
        
        # Check schedules
        schedule_results = self._check_schedules(windows, doors)
        results.extend(schedule_results["results"])
        issues.extend(schedule_results.get("issues", []))
        
        # Check sizes
        size_results = self._check_sizes(windows, doors)
        results.extend(size_results["results"])
        issues.extend(size_results.get("issues", []))
        
        # Check emergency egress
        egress_results = self._check_emergency_egress(rooms)
        results.extend(egress_results["results"])
        issues.extend(egress_results.get("issues", []))
        
        summary = self.get_compliance_summary(results)
        
        return {
            "status": "completed",
            "is_compliant": summary["failed"] == 0,
            "summary": summary,
            "details": {
                "windows_analyzed": len(windows),
                "doors_analyzed": len(doors),
                "rooms_checked": len(rooms),
                "issues_found": len(issues),
                "issues": issues[:10]
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _check_schedules(self, windows: List[Dict], doors: List[Dict]) -> Dict[str, Any]:
        """Check window and door schedules."""
        results = []
        issues = []
        
        missing_schedule = []
        for window in windows:
            if not window.get("schedule", False):
                missing_schedule.append(window.get("id", "unknown"))
        
        for door in doors:
            if not door.get("schedule", False):
                missing_schedule.append(door.get("id", "unknown"))
        
        if missing_schedule:
            results.append({
                "rule": "Window/Door Schedules",
                "passed": False,
                "details": f"Missing schedules for: {', '.join(missing_schedule[:5])}"
            })
            issues.append({
                "type": "schedule",
                "missing_items": missing_schedule[:10],
                "severity": "warning"
            })
        else:
            results.append({
                "rule": "Window/Door Schedules",
                "passed": True,
                "details": "All windows and doors have proper schedules"
            })
        
        return {"results": results, "issues": issues}
    
    def _check_sizes(self, windows: List[Dict], doors: List[Dict]) -> Dict[str, Any]:
        """Check window and door sizes."""
        results = []
        issues = []
        
        min_width = 600
        min_height = 1800
        
        size_issues = []
        for window in windows:
            width = window.get("width_mm", 0)
            height = window.get("height_mm", 0)
            
            if width < min_width or height < min_height:
                size_issues.append({
                    "type": "window",
                    "id": window.get("id", "unknown"),
                    "width": width,
                    "height": height,
                    "minimum_width": min_width,
                    "minimum_height": min_height
                })
        
        for door in doors:
            width = door.get("width_mm", 0)
            height = door.get("height_mm", 0)
            
            if width < min_width or height < min_height:
                size_issues.append({
                    "type": "door",
                    "id": door.get("id", "unknown"),
                    "width": width,
                    "height": height,
                    "minimum_width": min_width,
                    "minimum_height": min_height
                })
        
        if size_issues:
            results.append({
                "rule": "Size Compliance",
                "passed": False,
                "details": f"{len(size_issues)} items below minimum size requirements"
            })
            issues.append({
                "type": "size",
                "issues": size_issues[:10],
                "severity": "warning"
            })
        else:
            results.append({
                "rule": "Size Compliance",
                "passed": True,
                "details": "All windows and doors meet size requirements"
            })
        
        return {"results": results, "issues": issues}
    
    def _check_emergency_egress(self, rooms: List[Dict]) -> Dict[str, Any]:
        """Check emergency egress requirements for bedrooms."""
        results = []
        issues = []
        
        egress_issues = []
        for room in rooms:
            if room.get("type") == "bedroom":
                egress = room.get("egress", {})
                
                if not egress.get("exists", False):
                    egress_issues.append({
                        "type": "missing_egress",
                        "room_id": room.get("id", "unknown"),
                        "severity": "critical"
                    })
                else:
                    opening = egress.get("opening", {})
                    if (opening.get("area_sqm", 0) < 0.33 or
                        opening.get("width_mm", 0) < 450 or
                        opening.get("height_mm", 0) < 450 or
                        opening.get("sill_height_mm", 0) > 1100):
                        egress_issues.append({
                            "type": "egress_not_compliant",
                            "room_id": room.get("id", "unknown"),
                            "opening": opening,
                            "severity": "critical"
                        })
        
        if egress_issues:
            results.append({
                "rule": "Emergency Egress",
                "passed": False,
                "details": f"{len(egress_issues)} bedrooms lack compliant emergency egress"
            })
            issues.append({
                "type": "egress",
                "issues": egress_issues[:10],
                "severity": "critical"
            })
        else:
            results.append({
                "rule": "Emergency Egress",
                "passed": True,
                "details": "All bedrooms have compliant emergency egress"
            })
        
        return {"results": results, "issues": issues}
    
    async def validate(self, project_data: Dict[str, Any]) -> bool:
        """Validate project data against window/door compliance rules."""
        result = await self.analyze(project_data)
        return result.get("is_compliant", False)
