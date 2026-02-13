"""Database schema and models for Architectural Autonomous Platform."""

from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Enum, Float
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class UserRole(enum.Enum):
    CLIENT = "client"
    FREELANCER = "freelancer"
    ADMIN = "admin"

class ProjectStatus(enum.Enum):
    PENDING = "pending"
    PAYMENT_PENDING = "payment_pending"
    PAYMENT_RECEIVED = "payment_received"
    IN_PROGRESS = "in_progress"
    AI_REVIEW = "ai_review"
    FREELANCER_REVISION = "freelancer_revision"
    ADMIN_REVIEW = "admin_review"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ProjectType(enum.Enum):
    COMPLIANCE_CHECK = "compliance_check"
    NEW_DRAWING = "new_drawing"
    ADDITIONS = "additions"
    REGULATORY_QUERY = "regulatory_query"

class AgentStatus(enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    ESCALATED = "escalated"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    full_name = Column(String(255))
    role = Column(Enum(UserRole))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    projects = relationship("Project", back_populates="user")
    freelancer_profile = relationship("FreelancerProfile", back_populates="user", uselist=False)

class FreelancerProfile(Base):
    __tablename__ = "freelancer_profiles"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    skills = Column(JSON)  # Array of skill tags
    hourly_rate = Column(Float)
    is_available = Column(Boolean, default=True)
    current_load = Column(Integer, default=0)
    max_load = Column(Integer, default=10)
    bio = Column(Text)
    portfolio_url = Column(String(500))
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="freelancer_profile")
    assignments = relationship("TaskAssignment", back_populates="freelancer")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    project_type = Column(Enum(ProjectType))
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PENDING)
    title = Column(String(255))
    description = Column(Text)
    estimated_cost = Column(Float)
    estimated_timeline_days = Column(Integer)
    purchased_hours = Column(Float, default=0)  # hours the client bought
    hours_used = Column(Float, default=0)  # total hours consumed
    hourly_rate = Column(Float, default=450)  # ZAR per hour
    actual_cost = Column(Float, nullable=True)
    actual_timeline_days = Column(Integer, nullable=True)
    client_notes = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="projects")
    files = relationship("ProjectFile", back_populates="project")
    tasks = relationship("Task", back_populates="project")
    payments = relationship("Payment", back_populates="project")
    notifications = relationship("Notification", back_populates="project")

class ProjectFile(Base):
    __tablename__ = "project_files"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    file_name = Column(String(255))
    file_path = Column(String(1000))
    file_type = Column(String(50))  # pdf, dwg, dxf, jpg, png, etc.
    file_size = Column(Integer)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    version = Column(Integer, default=1)
    is_primary = Column(Boolean, default=False)
    file_metadata = Column(JSON, nullable=True)  # Extracted metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="files")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    task_type = Column(String(100))  # e.g., "wall_analysis", "dimension_check"
    status = Column(Enum(AgentStatus), default=AgentStatus.PENDING)
    priority = Column(Integer, default=1)
    assigned_agent = Column(String(100), nullable=True)  # Agent name or ID
    assigned_freelancer = Column(Integer, ForeignKey("freelancer_profiles.id"), nullable=True)
    result = Column(JSON, nullable=True)  # Agent output
    compliance_comments = Column(Text, nullable=True)  # Agent's review comments for Admin
    error_message = Column(Text, nullable=True)
    purchased_hours = Column(Float, default=0)  # hours allocated to this task
    hours_used = Column(Float, default=0)  # hours consumed
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    project = relationship("Project", back_populates="tasks")
    assignment = relationship("TaskAssignment", back_populates="task", uselist=False)

class TaskAssignment(Base):
    __tablename__ = "task_assignments"
    
    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    freelancer_id = Column(Integer, ForeignKey("freelancer_profiles.id"))
    status = Column(String(50), default="pending")  # pending, accepted, rejected, completed
    assigned_at = Column(DateTime, default=datetime.utcnow)
    accepted_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    
    task = relationship("Task", back_populates="assignment")
    freelancer = relationship("FreelancerProfile", back_populates="assignments")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    amount = Column(Float)
    currency = Column(String(3), default="ZAR")
    status = Column(String(50), default="pending")  # pending, completed, failed, refunded
    payment_method = Column(String(50))  # card, eft, crypto, etc.
    transaction_id = Column(String(255), nullable=True)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="payments")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255))
    message = Column(Text)
    type = Column(String(50))  # info, success, warning, error
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="notifications")

class ComplianceRule(Base):
    __tablename__ = "compliance_rules"
    
    id = Column(Integer, primary_key=True)
    rule_name = Column(String(255))
    rule_category = Column(String(100))  # wall, dimension, window_door, area, energy, etc.
    rule_text = Column(Text)
    rule_code = Column(String(100))  # e.g., "SANS 10400-XA-2011"
    jurisdiction = Column(String(100))  # e.g., "Johannesburg", "National"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(100))  # e.g., "project_created", "payment_made"
    entity_type = Column(String(50))  # e.g., "Project", "User"
    entity_id = Column(Integer)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TimeLog(Base):
    """Tracks individual work sessions against purchased hours."""
    __tablename__ = "time_logs"

    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    freelancer_id = Column(Integer, ForeignKey("freelancer_profiles.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    started_at = Column(DateTime, nullable=False)
    stopped_at = Column(DateTime, nullable=True)  # NULL = currently running
    duration_seconds = Column(Integer, default=0)  # computed on stop
    notes = Column(Text, nullable=True)
    is_billable = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Invoice(Base):
    """Auto-generated invoices from accumulated time logs."""
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    client_user_id = Column(Integer, ForeignKey("users.id"))
    freelancer_id = Column(Integer, ForeignKey("freelancer_profiles.id"), nullable=True)
    invoice_number = Column(String(50), unique=True)
    hours_billed = Column(Float, default=0)
    hourly_rate = Column(Float, default=0)
    total_amount = Column(Float, default=0)
    currency = Column(String(3), default="ZAR")
    status = Column(String(50), default="draft")  # draft, sent, paid, overdue, cancelled
    issued_at = Column(DateTime, nullable=True)
    due_at = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    line_items = Column(JSON, nullable=True)  # [{description, hours, rate, amount}]
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
