"""Database connection and session management."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from .schema import Base
import os

# Database URL from environment or default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/architectural_platform")

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False
)

# Create session factory
SessionFactory = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create scoped session for thread safety
Session = scoped_session(SessionFactory)


def get_db():
    """Dependency for FastAPI endpoints to get database session."""
    db = Session()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database by creating all tables."""
    Base.metadata.create_all(bind=engine)


def drop_db():
    """Drop all database tables."""
    Base.metadata.drop_all(bind=engine)


def reset_db():
    """Reset database by dropping and recreating all tables."""
    drop_db()
    init_db()
