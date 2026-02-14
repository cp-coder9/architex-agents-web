"""Enhanced base agent with OpenRouter AI integration."""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from abc import ABC, abstractmethod

from ..ai.openrouter_client import OpenRouterClient, openrouter_client

logger = logging.getLogger(__name__)


class EnhancedBaseAgent(ABC):
    """Base class for AI-enhanced compliance checking agents."""
    
    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
        self.status = "idle"
        self.last_run = None
        self.run_count = 0
        self.success_count = 0
        self.error_count = 0
        self.openrouter = openrouter_client
        self.session_id = None
        
        # Detailed logs for admin visibility
        self.execution_log: List[Dict[str, Any]] = []
    
    def _start_session(self, project_id: int = None) -> str:
        """Start a new analysis session."""
        self.session_id = f"{self.name}_{project_id or 'general'}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        self._log("session_start", f"Starting analysis session: {self.session_id}")
        return self.session_id
    
    def _log(self, event: str, details: Any):
        """Log an event in the execution log."""
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "agent": self.name,
            "session_id": self.session_id,
            "event": event,
            "details": details
        }
        self.execution_log.append(entry)
        logger.info(f"[{self.name}] {event}: {details}")
    
    def _log_thinking(self, prompt: str, response: str):
        """Log the AI thinking process."""
        self.openrouter.log_thinking(
            session_id=self.session_id,
            agent_name=self.name,
            prompt=prompt,
            response=response
        )
        self._log("ai_thinking", {
            "prompt_length": len(prompt),
            "response_length": len(response)
        })
    
    def get_execution_log(self, session_id: str = None) -> List[Dict[str, Any]]:
        """Get the execution log for this agent."""
        if session_id:
            return [e for e in self.execution_log if e.get("session_id") == session_id]
        return self.execution_log
    
    def get_all_thoughts(self, session_id: str = None) -> List[Dict[str, Any]]:
        """Get all AI thought logs."""
        return self.openrouter.get_thought_logs(session_id=session_id, agent_name=self.name)
    
    @abstractmethod
    async def analyze(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze project data and return results."""
        pass
    
    @abstractmethod
    async def validate(self, project_data: Dict[str, Any]) -> bool:
        """Validate project data against compliance rules."""
        pass
    
    async def run(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run the agent analysis with AI enhancement."""
        self.status = "running"
        self.run_count += 1
        start_time = datetime.utcnow()
        session_id = self._start_session(project_data.get("id"))
        
        self._log("run_started", f"Starting analysis for project {project_data.get('id', 'unknown')}")
        
        try:
            # Run the main analysis
            result = await self.analyze(project_data)
            
            # Use AI to enhance the analysis with OpenRouter
            enhanced_result = await self._enhance_with_ai(project_data, result)
            
            self.status = "completed"
            self.success_count += 1
            self.last_run = {
                "start": start_time.isoformat(),
                "end": datetime.utcnow().isoformat(),
                "success": True,
                "result": result,
                "session_id": session_id
            }
            
            self._log("run_completed", f"Analysis completed successfully in {(datetime.utcnow() - start_time).total_seconds():.2f}s")
            
            return {
                **result,
                **enhanced_result,
                "session_id": session_id,
                "execution_log": self.get_execution_log(session_id),
                "ai_thoughts": self.get_all_thoughts(session_id)
            }
            
        except Exception as e:
            self.status = "failed"
            self.error_count += 1
            self.last_run = {
                "start": start_time.isoformat(),
                "end": datetime.utcnow().isoformat(),
                "success": False,
                "error": str(e),
                "session_id": session_id
            }
            
            self._log("run_failed", f"Analysis failed: {str(e)}")
            logger.error(f"Agent {self.name} failed: {str(e)}")
            
            return {
                "status": "failed",
                "error": str(e),
                "agent": self.name,
                "session_id": session_id,
                "execution_log": self.get_execution_log(session_id)
            }
    
    async def _enhance_with_ai(self, project_data: Dict[str, Any], result: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance analysis results using OpenRouter AI."""
        
        # Build prompt for AI enhancement
        prompt = self._build_enhancement_prompt(project_data, result)
        
        messages = [
            {
                "role": "system",
                "content": self._get_system_prompt()
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
        
        try:
            ai_response = await self.openrouter.chat_completion(
                messages=messages,
                session_id=self.session_id
            )
            
            # Log the AI thinking
            self._log_thinking(prompt, ai_response.get("content", ""))
            
            # Try to parse AI response as JSON
            try:
                ai_analysis = json.loads(ai_response.get("content", "{}"))
            except json.JSONDecodeError:
                ai_analysis = {
                    "ai_summary": ai_response.get("content", ""),
                    "ai_recommendations": []
                }
            
            return {
                "ai_enhanced": True,
                "ai_model": ai_response.get("model", "unknown"),
                "ai_analysis": ai_analysis,
                "ai_thinking": ai_response.get("thinking", ""),
                "using_fallback": ai_response.get("fallback", False)
            }
            
        except Exception as e:
            self._log("ai_enhancement_failed", str(e))
            return {
                "ai_enhanced": False,
                "ai_error": str(e)
            }
    
    def _build_enhancement_prompt(self, project_data: Dict[str, Any], result: Dict[str, Any]) -> str:
        """Build a prompt for AI enhancement."""
        return f"""Analyze the following architectural compliance results and provide detailed insights:

Project Data:
{json.dumps(project_data, indent=2, default=str)}

Current Analysis Results:
{json.dumps(result, indent=2, default=str)}

Please provide:
1. A detailed summary of findings
2. Any additional compliance issues that may have been missed
3. Recommended actions for addressing any failures
4. Risk assessment for each issue found

Format your response as JSON with the following structure:
{{
    "ai_summary": "Detailed summary of findings",
    "additional_findings": ["Any additional issues found"],
    "risk_assessment": {{"issue": "risk_level"}},
    "recommendations": ["Recommended actions"],
    "compliance_status": "PASS/FAIL/WARNING"
}}
"""
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for this agent."""
        return f"""You are an expert architectural compliance analyst for South African building regulations. 
You specialize in SANS 10400 (National Building Regulations) and Johannesburg Municipal By-laws.
Your role is to analyze compliance results and provide expert recommendations.

When analyzing:
1. Consider SANS 10400-B (Walls), SANS 10400-A (Dimensions), SANS 10400-K (Openings),
   SANS 10400-XA (Energy), and municipal regulations
2. Provide risk assessments based on severity
3. Recommend specific actions to address failures
4. Consider both structural and regulatory compliance

Always respond in JSON format."""
    
    async def check_compliance(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Check compliance and return detailed report."""
        result = await self.run(project_data)
        return {
            "agent": self.name,
            "is_compliant": result.get("is_compliant", False),
            "timestamp": datetime.utcnow().isoformat(),
            "session_id": result.get("session_id"),
            "execution_log": result.get("execution_log", []),
            "ai_analysis": result.get("ai_analysis", {})
        }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get agent statistics."""
        return {
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "run_count": self.run_count,
            "success_count": self.success_count,
            "error_count": self.error_count,
            "last_run": self.last_run,
            "execution_log_count": len(self.execution_log)
        }
    
    def get_detailed_stats(self) -> Dict[str, Any]:
        """Get detailed agent statistics including AI usage."""
        thoughts = self.openrouter.get_thought_logs(agent_name=self.name)
        
        return {
            **self.get_stats(),
            "total_ai_calls": len(thoughts),
            "recent_thoughts": thoughts[-10:] if thoughts else [],
            "execution_log": self.execution_log[-50:] if self.execution_log else []
        }
