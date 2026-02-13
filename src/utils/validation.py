"""Validation utility functions for Architectural Platform."""

from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)


def validate_project_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate project data structure."""
    errors = []
    
    # Check required fields
    if not data.get("project_id"):
        errors.append("project_id is required")
    
    if not data.get("project_type"):
        errors.append("project_type is required")
    
    # Validate project type
    valid_types = ["compliance_check", "new_drawing", "additions", "regulatory_query"]
    if data.get("project_type") and data["project_type"] not in valid_types:
        errors.append(f"Invalid project_type. Must be one of: {', '.join(valid_types)}")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "data": data
    }


def validate_compliance_result(result: Dict[str, Any]) -> Dict[str, Any]:
    """Validate compliance result structure."""
    errors = []
    
    # Check required fields
    if "status" not in result:
        errors.append("status field is required")
    
    if "is_compliant" not in result:
        errors.append("is_compliant field is required")
    
    # Validate status values
    valid_statuses = ["completed", "failed", "pending", "running"]
    if result.get("status") and result["status"] not in valid_statuses:
        errors.append(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "result": result
    }


def validate_agent_result(agent_name: str, result: Dict[str, Any]) -> Dict[str, Any]:
    """Validate agent-specific result."""
    errors = []
    
    # Check agent name
    if not agent_name:
        errors.append("Agent name is required")
    
    # Check result structure
    if not isinstance(result, dict):
        errors.append("Result must be a dictionary")
    else:
        # Validate agent-specific fields
        if "status" not in result:
            errors.append("status field is required")
        
        if "is_compliant" not in result:
            errors.append("is_compliant field is required")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "agent_name": agent_name,
        "result": result
    }


def validate_file_upload(file_info: Dict[str, Any]) -> Dict[str, Any]:
    """Validate file upload information."""
    errors = []
    
    if not file_info.get("filename"):
        errors.append("filename is required")
    
    if not file_info.get("file_type"):
        errors.append("file_type is required")
    
    if not file_info.get("file_size"):
        errors.append("file_size is required")
    elif file_info.get("file_size", 0) > 10 * 1024 * 1024:  # 10MB limit
        errors.append("File size exceeds 10MB limit")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "file_info": file_info
    }
