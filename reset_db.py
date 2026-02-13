import sys
import os
from sqlalchemy import text
from src.db.connection import get_db, engine
from src.db.schema import Base, User, UserRole, Project, ProjectStatus, ProjectType, Task, AgentStatus, FreelancerProfile

def reset_db():
    print("Resetting database...")
    
    # Drop all tables
    # Note: Enum types in Postgres might persist. We should drop them too if possible.
    try:
        with engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS audit_logs CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS notifications CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS payments CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS task_assignments CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS time_logs CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS invoices CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS project_files CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS tasks CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS projects CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS freelancer_profiles CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS compliance_rules CASCADE"))
            
            # Drop types
            conn.execute(text("DROP TYPE IF EXISTS userrole CASCADE"))
            conn.execute(text("DROP TYPE IF EXISTS projectstatus CASCADE"))
            conn.execute(text("DROP TYPE IF EXISTS projecttype CASCADE"))
            conn.execute(text("DROP TYPE IF EXISTS agentstatus CASCADE"))
            conn.commit()
        print("Dropped all tables and types.")
    except Exception as e:
        print(f"Error dropping tables: {e}")

    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Created all tables.")

    # Seed data
    db = next(get_db())
    try:
        # Create Users
        admin = User(email="admin@example.com", full_name="Admin User", role=UserRole.ADMIN, is_active=True)
        client = User(email="client@example.com", full_name="Client User", role=UserRole.CLIENT, is_active=True)
        freelancer = User(email="freelancer@example.com", full_name="Freelancer User", role=UserRole.FREELANCER, is_active=True)
        
        db.add_all([admin, client, freelancer])
        db.commit()
        
        # Create Freelancer Profile
        fp = FreelancerProfile(user_id=freelancer.id, skills=["Architecture", "AutoCAD"], hourly_rate=500.0)
        db.add(fp)
        db.commit()

        # Create Project
        project = Project(
            user_id=client.id,
            title="Modern Office Design",
            description="Complete architectural drawings for a modern office space.",
            project_type=ProjectType.NEW_DRAWING,
            status=ProjectStatus.PENDING,
            estimated_cost=25000.0,
            estimated_timeline_days=14
        )
        db.add(project)
        db.commit()

        # Create Task
        task = Task(
            project_id=project.id,
            task_type="initial_review",
            status=AgentStatus.PENDING,
            priority=1,
            purchased_hours=20.0,
            compliance_comments="Needs admin review."
        )
        db.add(task)
        db.commit()

        print("Seeded basic data.")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()

if __name__ == "__main__":
    reset_db()
