import sys
import os
from sqlalchemy import text
from src.db.connection import get_db

def fix_schema():
    db = next(get_db())
    try:
        print("Checking and fixing database schema...")
        
        # Add compliance_comments to tasks if missing
        try:
            db.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS compliance_comments TEXT"))
            print("Checked compliance_comments in tasks table.")
        except Exception as e:
            print(f"Error adding compliance_comments: {e}")

        # Add purchased_hours to tasks if missing
        try:
            db.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS purchased_hours DOUBLE PRECISION DEFAULT 0"))
            print("Checked purchased_hours in tasks table.")
        except Exception as e:
            print(f"Error adding purchased_hours: {e}")

        # Add hours_used to tasks if missing
        try:
            db.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS hours_used DOUBLE PRECISION DEFAULT 0"))
            print("Checked hours_used in tasks table.")
        except Exception as e:
            print(f"Error adding hours_used: {e}")

        db.commit()
        print("Schema fix completed successfully.")
        
    except Exception as e:
        print(f"General error: {e}")
        db.rollback()

if __name__ == "__main__":
    fix_schema()
