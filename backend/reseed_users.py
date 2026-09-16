import os
import sys

# Add current directory to path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from sqlalchemy import text
from utils.auth import get_password_hash

def reseed():
    db = SessionLocal()
    try:
        # Clear all existing users
        db.execute(text("DELETE FROM users"))
        db.commit()
        print(f"Deleted all old users.")
        
        # Create new users using raw SQL to avoid ENUM cast issues
        admin_hash = get_password_hash("admin123")
        faculty_hash = get_password_hash("faculty123")
        student_hash = get_password_hash("student123")
        
        insert_query = text("""
            INSERT INTO users (full_name, email, mobile, password_hash, role, status, verified)
            VALUES 
            ('System Admin', 'admin@qratten.com', '1111111111', :admin_hash, 'admin'::user_role, 'active', true),
            ('John Faculty', 'faculty@qratten.com', '2222222222', :faculty_hash, 'teacher'::user_role, 'active', true),
            ('Jane Student', 'student@qratten.com', '3333333333', :student_hash, 'student'::user_role, 'active', true)
        """)
        
        db.execute(insert_query, {
            "admin_hash": admin_hash,
            "faculty_hash": faculty_hash,
            "student_hash": student_hash
        })
        
        db.commit()
        
        print("Successfully created 3 new users:")
        print("1. Admin: admin@qratten.com / admin123")
        print("2. Faculty: faculty@qratten.com / faculty123")
        print("3. Student: student@qratten.com / student123")
        
    except Exception as e:
        db.rollback()
        print(f"Error during reseeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reseed()
