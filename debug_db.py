import sys
import os
from sqlalchemy import text

# Add current directory to path
sys.path.append(os.getcwd())

from src.db.connection import get_db

def inspect_enum():
    try:
        db = next(get_db())
        # Query pg_enum to see labels for 'agentstatus'
        query = text("SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'agentstatus'")
        result = db.execute(query)
        labels = [row[0] for row in result]
        print(f"AgentStatus Enum Labels in DB: {labels}")
        
        # Check ProjectStatus too
        query = text("SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'projectstatus'")
        result = db.execute(query)
        labels = [row[0] for row in result]
        print(f"ProjectStatus Enum Labels in DB: {labels}")

        # Try a test insertion if projects exist
        query = text("SELECT id FROM projects LIMIT 1")
        res = db.execute(query).fetchone()
        if res:
            pid = res[0]
            print(f"Found project ID {pid}, trying to insert task...")
            try:
                db.execute(text("INSERT INTO tasks (project_id, task_type, status, priority) VALUES (:pid, 'test', 'PENDING', 1)"), {"pid": pid})
                db.commit()
                print("Successfully inserted PENDING task via raw SQL.")
            except Exception as e:
                print(f"Failed to insert PENDING task via raw SQL: {e}")
                db.rollback()
        else:
            print("No projects found to test task insertion.")
            # Let's create a dummy project
            try:
                db.execute(text("INSERT INTO projects (title, status) VALUES ('Test Project', 'PENDING')"))
                db.commit()
                print("Created test project.")
                # retry
                res = db.execute(text("SELECT id FROM projects WHERE title='Test Project'")).fetchone()
                if res:
                    db.execute(text("INSERT INTO tasks (project_id, task_type, status, priority) VALUES (:pid, 'test', 'PENDING', 1)"), {"pid": res[0]})
                    db.commit()
                    print("Successfully inserted PENDING task after creating project.")
            except Exception as e:
                print(f"Failed to create test project or task: {e}")
                db.rollback()

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_enum()
