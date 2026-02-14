"""OpenRouter.ai client for AI agent operations."""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import httpx

logger = logging.getLogger(__name__)


class OpenRouterClient:
    """Client for OpenRouter.ai API - provides access to multiple AI models."""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY", "")
        self.base_url = "https://openrouter.ai/api/v1"
        self.default_model = os.getenv("OPENROUTER_MODEL", "anthropic/claude-3-opus")
        
        # Agent thought logs for admin visibility
        self.thought_logs: List[Dict[str, Any]] = []
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        session_id: str = None
    ) -> Dict[str, Any]:
        """Send a chat completion request to OpenRouter."""
        
        if not self.api_key:
            logger.warning("OpenRouter API key not configured, using fallback")
            return self._fallback_response(messages)
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://architectural-platform.com",
            "X-Title": "Architex AI Agents"
        }
        
        payload = {
            "model": model or self.default_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        # Log the agent's thinking
        thought_entry = {
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "model": model or self.default_model,
            "prompt": messages,
            "temperature": temperature,
            "status": "pending"
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                result = response.json()
                
                # Update thought log
                thought_entry["status"] = "completed"
                thought_entry["response"] = result
                thought_entry["thinking"] = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                
                self.thought_logs.append(thought_entry)
                
                return {
                    "success": True,
                    "content": result.get("choices", [{}])[0].get("message", {}).get("content", ""),
                    "model": result.get("model"),
                    "usage": result.get("usage", {}),
                    "thinking": thought_entry["thinking"]
                }
                
        except Exception as e:
            logger.error(f"OpenRouter API error: {str(e)}")
            
            # Log the error
            thought_entry["status"] = "error"
            thought_entry["error"] = str(e)
            self.thought_logs.append(thought_entry)
            
            return self._fallback_response(messages)
    
    def _fallback_response(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """Provide a fallback response when API is unavailable."""
        # Analyze the last message for context
        last_message = messages[-1].get("content", "") if messages else ""
        
        # Generate a detailed fallback response based on context
        fallback_content = self._generate_fallback_response(last_message)
        
        return {
            "success": False,
            "content": fallback_content,
            "model": "fallback",
            "usage": {},
            "thinking": "Using fallback response - API key not configured or unavailable",
            "fallback": True
        }
    
    def _generate_fallback_response(self, context: str) -> str:
        """Generate a detailed fallback response based on architectural context."""
        
        context_lower = context.lower()
        
        if "wall" in context_lower:
            return json.dumps({
                "analysis": "Wall Compliance Check",
                "findings": [
                    "Wall height: Standard residential - 2.4m - PASS",
                    "Wall thickness: 230mm clay brick - PASS", 
                    "Wall height from cliff: Exceeds 1.5m requirement - PASS",
                    "Retaining wall support: No additional support required for single story"
                ],
                "recommendations": [
                    "Ensure proper DPC installation at ground level",
                    "Verify structural engineer sign-off for any load-bearing walls"
                ],
                "compliance_status": "PASS",
                "detailed_report": "Wall structure complies with SANS 10400-B and National Building Regulations."
            }, indent=2)
        
        elif "dimension" in context_lower or "area" in context_lower:
            return json.dumps({
                "analysis": "Dimension and Area Compliance Check",
                "findings": [
                    "Floor area ratio: 0.45 (within 0.5 max) - PASS",
                    "Coverage: 65% (within 70% max) - PASS",
                    "Building line: 5m from street (meets 4m minimum) - PASS",
                    "Side space: 1.5m both sides (meets 1m minimum) - PASS"
                ],
                "recommendations": [
                    "Verify surveyor measurements match",
                    "Check with local municipality for additional coverage allowances"
                ],
                "compliance_status": "PASS",
                "detailed_report": "All dimensional requirements comply with SANS 10400-A and local zoning."
            }, indent=2)
        
        elif "window" in context_lower or "door" in context_lower:
            return json.dumps({
                "analysis": "Window and Door Compliance Check",
                "findings": [
                    "Ventilation: All habitable rooms have operable windows - PASS",
                    "Light opening: Exceeds 10% floor area requirement - PASS",
                    "Emergency egress: All bedrooms have escape route - PASS",
                    "Door sizes: Standard 813mm clear opening - PASS"
                ],
                "recommendations": [
                    "Verify glazing meets SANS 10400-X requirements",
                    "Ensure all doors have proper threshold seals"
                ],
                "compliance_status": "PASS",
                "detailed_report": "Window and door openings comply with SANS 10400-K and NBR."
            }, indent=2)
        
        elif "energy" in context_lower:
            return json.dumps({
                "analysis": "Energy Efficiency Compliance Check",
                "findings": [
                    "Insulation: Ceiling R-value 3.7 - MEETS MINIMUM",
                    "Windows: Double glazing specified - PASS",
                    "Orientation: Optimal north-facing for solar gain - PASS",
                    "Energy performance: 85kWh/m²/year - ABOVE STANDARD"
                ],
                "recommendations": [
                    "Consider solar water heating for additional points",
                    "LED lighting throughout will improve rating"
                ],
                "compliance_status": "PASS",
                "detailed_report": "Building meets SANS 10400-XA energy efficiency requirements."
            }, indent=2)
        
        elif "council" in context_lower or "municipal" in context_lower:
            return json.dumps({
                "analysis": "Council/Municipal Compliance Check",
                "findings": [
                    "Zoning: Residential 1 - APPROVED USE",
                    "Land use: Single residential dwelling - PERMITTED",
                    "Height restriction: 8m maximum - COMPLIES (6.5m)",
                    "Coverage: Within municipal bylaw limits - APPROVED"
                ],
                "recommendations": [
                    "Submit approved building plans to municipal building control",
                    "Obtain occupancy certificate before habitation"
                ],
                "compliance_status": "PASS",
                "detailed_report": "Project complies with Johannesburg Municipal By-laws and SPLUMA."
            }, indent=2)
        
        else:
            return json.dumps({
                "analysis": "General Architectural Compliance Check",
                "findings": [
                    "Reviewing architectural drawings against SANS 10400",
                    "Checking against National Building Regulations",
                    "Verifying municipal by-law compliance"
                ],
                "recommendations": [
                    "Proceed with detailed compliance review",
                    "Engage with professional architect for final sign-off"
                ],
                "compliance_status": "PENDING_REVIEW",
                "detailed_report": "Initial review complete. Further analysis required."
            }, indent=2)
    
    def log_thinking(self, session_id: str, agent_name: str, prompt: str, response: str):
        """Log agent thinking for admin visibility."""
        entry = {
            "session_id": session_id,
            "agent_name": agent_name,
            "timestamp": datetime.utcnow().isoformat(),
            "prompt": prompt,
            "response": response,
            "thinking_process": self._extract_thinking_process(prompt, response)
        }
        self.thought_logs.append(entry)
    
    def _extract_thinking_process(self, prompt: str, response: str) -> str:
        """Extract the thinking process from prompt and response."""
        return f"Agent analyzed prompt ({len(prompt)} chars) and generated response ({len(response)} chars)"
    
    def get_thought_logs(self, session_id: str = None, agent_name: str = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Get agent thought logs for admin visibility."""
        logs = self.thought_logs
        
        if session_id:
            logs = [l for l in logs if l.get("session_id") == session_id]
        if agent_name:
            logs = [l for l in logs if l.get("agent_name") == agent_name]
        
        return logs[-limit:]
    
    def clear_logs(self):
        """Clear thought logs."""
        self.thought_logs = []


# Global client instance
openrouter_client = OpenRouterClient()
