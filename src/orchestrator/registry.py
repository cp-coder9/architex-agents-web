"""Agent registry for managing AI agents."""

from typing import Dict, List, Optional
from .base import BaseAgent
import logging

logger = logging.getLogger(__name__)


class AgentRegistry:
    """Registry for managing AI agents."""
    
    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}
        self._agent_classes: Dict[str, type] = {}
    
    def register_class(self, agent_class: type) -> bool:
        """Register an agent class by name."""
        if not hasattr(agent_class, 'name'):
            agent_class.name = agent_class.__name__.lower().replace('agent', '')
        
        agent_name = agent_class.name
        self._agent_classes[agent_name] = agent_class
        logger.info(f"Registered agent class: {agent_name}")
        return True
    
    async def register(self, agent: BaseAgent) -> bool:
        """Register an agent instance."""
        if agent.name in self._agents:
            logger.warning(f"Agent {agent.name} already registered, replacing")
        
        self._agents[agent.name] = agent
        self.register_class(type(agent))
        logger.info(f"Registered agent instance: {agent.name}")
        return True
    
    def get_agent(self, name: str) -> Optional[BaseAgent]:
        """Get agent by name."""
        return self._agents.get(name)
    
    def get_all_agents(self) -> List[BaseAgent]:
        """Get all registered agents."""
        return list(self._agents.values())
    
    def create_agent(self, name: str, **kwargs) -> Optional[BaseAgent]:
        """Create an agent instance by name."""
        agent_class = self._agent_classes.get(name)
        if agent_class:
            return agent_class(**kwargs)
        return None
    
    def list_agents(self) -> List[str]:
        """List all registered agent names."""
        return list(self._agents.keys())
    
    def unregister(self, name: str) -> bool:
        """Unregister an agent by name."""
        if name in self._agents:
            del self._agents[name]
            logger.info(f"Unregistered agent: {name}")
            return True
        return False
    
    def clear(self):
        """Clear all registered agents."""
        self._agents.clear()
        self._agent_classes.clear()
        logger.info("Cleared all agents from registry")
