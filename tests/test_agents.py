"""Tests for AI agents."""

import pytest
from src.agents.wall_agent import WallAgent
from src.agents.dimension_agent import DimensionAgent
from src.agents.window_door_agent import WindowDoorAgent
from src.agents.area_agent import AreaAgent
from src.agents.energy_agent import EnergyAgent
from src.agents.council_agent import CouncilCheckAgent
from src.agents.compliance_formatter_agent import ComplianceFormatterAgent


@pytest.fixture
def wall_agent():
    return WallAgent()


@pytest.fixture
def dimension_agent():
    return DimensionAgent()


@pytest.fixture
def window_door_agent():
    return WindowDoorAgent()


@pytest.fixture
def area_agent():
    return AreaAgent()


@pytest.fixture
def energy_agent():
    return EnergyAgent()


@pytest.fixture
def council_agent():
    return CouncilCheckAgent()


@pytest.fixture
def compliance_formatter_agent():
    return ComplianceFormatterAgent()


class TestWallAgent:
    """Tests for WallAgent."""
    
    def test_wall_agent_initialization(self, wall_agent):
        assert wall_agent.name == "wall_agent"
        assert len(wall_agent.compliance_rules) > 0
    
    @pytest.mark.asyncio
    async def test_wall_agent_analyze(self, wall_agent):
        project_data = {
            "walls": [
                {
                    "id": "wall_1",
                    "thickness_mm": 200,
                    "material": "concrete",
                    "is_reinforced": True,
                    "reinforcement_ratio": 0.01,
                    "gap_mm": 10
                }
            ]
        }
        
        result = await wall_agent.analyze(project_data)
        assert result["status"] == "completed"
        assert result["is_compliant"] is True


class TestDimensionAgent:
    """Tests for DimensionAgent."""
    
    def test_dimension_agent_initialization(self, dimension_agent):
        assert dimension_agent.name == "dimension_agent"
        assert len(dimension_agent.compliance_rules) > 0
    
    @pytest.mark.asyncio
    async def test_dimension_agent_analyze(self, dimension_agent):
        project_data = {
            "dimensions": [
                {
                    "id": "dim_1",
                    "scale": "1:100",
                    "legible": True
                }
            ],
            "rooms": [
                {
                    "id": "room_1",
                    "type": "bedroom",
                    "area_sqm": 12.0
                }
            ]
        }
        
        result = await dimension_agent.analyze(project_data)
        assert result["status"] == "completed"
        assert result["is_compliant"] is True


class TestWindowDoorAgent:
    """Tests for WindowDoorAgent."""
    
    def test_window_door_agent_initialization(self, window_door_agent):
        assert window_door_agent.name == "window_door_agent"
        assert len(window_door_agent.compliance_rules) > 0
    
    @pytest.mark.asyncio
    async def test_window_door_agent_analyze(self, window_door_agent):
        project_data = {
            "windows": [
                {
                    "id": "window_1",
                    "schedule": True,
                    "width_mm": 1200,
                    "height_mm": 1500,
                    "area_sqm": 1.8
                }
            ],
            "doors": [
                {
                    "id": "door_1",
                    "schedule": True,
                    "width_mm": 900,
                    "height_mm": 2100
                }
            ],
            "rooms": [
                {
                    "id": "room_1",
                    "type": "bedroom",
                    "egress": {
                        "exists": True,
                        "opening": {
                            "area_sqm": 0.5,
                            "width_mm": 500,
                            "height_mm": 500,
                            "sill_height_mm": 900
                        }
                    }
                }
            ]
        }
        
        result = await window_door_agent.analyze(project_data)
        assert result["status"] == "completed"
        assert result["is_compliant"] is True


class TestAreaAgent:
    """Tests for AreaAgent."""
    
    def test_area_agent_initialization(self, area_agent):
        assert area_agent.name == "area_agent"
        assert len(area_agent.compliance_rules) > 0
    
    @pytest.mark.asyncio
    async def test_area_agent_analyze(self, area_agent):
        project_data = {
            "rooms": [
                {
                    "id": "room_1",
                    "type": "bedroom",
                    "area_sqm": 12.0
                },
                {
                    "id": "room_2",
                    "type": "kitchen",
                    "area_sqm": 8.0
                }
            ],
            "building": {
                "gross_floor_area_sqm": 150.0
            },
            "zoning": {
                "lot_area_sqm": 300.0,
                "max_far": 0.5
            }
        }
        
        result = await area_agent.analyze(project_data)
        assert result["status"] == "completed"
        assert result["is_compliant"] is True


class TestEnergyAgent:
    """Tests for EnergyAgent."""
    
    def test_energy_agent_initialization(self, energy_agent):
        assert energy_agent.name == "energy_agent"
        assert len(energy_agent.compliance_rules) > 0
    
    @pytest.mark.asyncio
    async def test_energy_agent_analyze(self, energy_agent):
        project_data = {
            "walls": [
                {
                    "id": "wall_1",
                    "area_sqm": 50.0,
                    "r_value": 2.0
                }
            ],
            "roofs": [
                {
                    "id": "roof_1",
                    "r_value": 4.0
                }
            ],
            "windows": [
                {
                    "id": "window_1",
                    "area_sqm": 10.0
                }
            ],
            "building": {
                "orientation": {
                    "main_facing": "north"
                }
            }
        }
        
        result = await energy_agent.analyze(project_data)
        assert result["status"] == "completed"
        assert result["is_compliant"] is True


class TestCouncilAgent:
    """Tests for CouncilAgent."""
    
    def test_council_agent_initialization(self, council_agent):
        assert council_agent.name == "council_agent"
        assert len(council_agent.compliance_rules) > 0
    
    @pytest.mark.asyncio
    async def test_council_agent_analyze(self, council_agent):
        project_data = {
            "files": [
                {
                    "name": "site_plan.pdf",
                    "type": "pdf"
                },
                {
                    "name": "sewer_layout.pdf",
                    "type": "pdf"
                }
            ],
            "drawings": [
                {
                    "id": "drawing_1",
                    "has_north_arrow": True
                }
            ],
            "compliance_results": {
                "wall_agent": {
                    "status": "completed",
                    "is_compliant": True
                }
            }
        }
        
        result = await council_agent.analyze(project_data)
        assert result["status"] == "completed"
        assert result["is_compliant"] is True


class TestComplianceFormatterAgent:
    """Tests for ComplianceFormatterAgent."""
    
    def test_compliance_formatter_agent_initialization(self, compliance_formatter_agent):
        assert compliance_formatter_agent.name == "compliance_formatter_agent"
        assert len(compliance_formatter_agent.compliance_rules) > 0
    
    @pytest.mark.asyncio
    async def test_compliance_formatter_agent_analyze(self, compliance_formatter_agent):
        project_data = {
            "compliance_results": {
                "wall_agent": {
                    "status": "completed",
                    "is_compliant": True
                },
                "dimension_agent": {
                    "status": "completed",
                    "is_compliant": True
                }
            },
            "project_info": {
                "project_id": "test_123",
                "title": "Test Project"
            }
        }
        
        result = await compliance_formatter_agent.analyze(project_data)
        assert result["status"] == "completed"
        assert "report" in result
        assert result["report"]["overall_status"] == "PASS"
