"""Users router for Architectural Autonomous Platform."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging

from ...db.connection import get_db
from ...db.schema import User, UserRole, FreelancerProfile

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/", response_model=List[dict])
async def list_users(
    role: UserRole = None,
    db: Session = Depends(get_db)
):
    """List users with optional role filter."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    
    users = query.order_by(User.created_at.desc()).all()
    return [u.__dict__ for u in users]


@router.get("/{user_id}", response_model=dict)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.__dict__


@router.post("/", response_model=dict)
async def create_user(
    user_data: dict,
    db: Session = Depends(get_db)
):
    """Create a new user."""
    try:
        user = User(
            email=user_data.get("email"),
            full_name=user_data.get("full_name", ""),
            role=user_data.get("role", UserRole.CLIENT),
            is_active=True
        )
        
        # Hash password (in production, use proper password hashing)
        password = user_data.get("password", "")
        user.hashed_password = f"hashed_{password}"
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        logger.info(f"Created user {user.id}: {user.email}")
        return user.__dict__
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{user_id}", response_model=dict)
async def update_user(
    user_id: int,
    user_data: dict,
    db: Session = Depends(get_db)
):
    """Update user information."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for key, value in user_data.items():
        if hasattr(user, key):
            setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user.__dict__


@router.get("/{user_id}/freelancer-profile")
async def get_freelancer_profile(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get freelancer profile for a user."""
    profile = db.query(FreelancerProfile).filter(
        FreelancerProfile.user_id == user_id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Freelancer profile not found")
    return profile.__dict__


@router.post("/{user_id}/freelancer-profile")
async def create_freelancer_profile(
    user_id: int,
    profile_data: dict,
    db: Session = Depends(get_db)
):
    """Create freelancer profile for a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.role != UserRole.FREELANCER:
        raise HTTPException(status_code=400, detail="User is not a freelancer")
    
    try:
        profile = FreelancerProfile(
            user_id=user_id,
            skills=profile_data.get("skills", []),
            hourly_rate=profile_data.get("hourly_rate", 0),
            is_available=profile_data.get("is_available", True),
            bio=profile_data.get("bio", ""),
            portfolio_url=profile_data.get("portfolio_url", "")
        )
        
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
        logger.info(f"Created freelancer profile for user {user_id}")
        return profile.__dict__
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating freelancer profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
