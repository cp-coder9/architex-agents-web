"""API Routers for Architectural Autonomous Platform."""

from .projects import router as projects_router
from .compliance import router as compliance_router
from .users import router as users_router
from .payments import router as payments_router
from .auth import router as auth_router
from .notifications import router as notifications_router
from .freelancers import router as freelancers_router

__all__ = [
    "projects_router",
    "compliance_router",
    "users_router",
    "payments_router",
    "auth_router",
    "notifications_router",
    "freelancers_router",
]
