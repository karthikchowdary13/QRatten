import os
import sys

# Add the current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base
from models.user import User
from models.institution import Institution
from models.section import Section
from models.attendance import Attendance
from models.qr_session import QRSession
from models.login_log import LoginLog
from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def reset_database():
    print("WARNING: This will delete ALL data in the database!")
    
    db = SessionLocal()
    try:
        # Delete in correct order to respect foreign keys
        print("Deleting Login Logs...")
        db.query(LoginLog).delete()
        
        print("Deleting Attendance...")
        db.query(Attendance).delete()
        
        print("Deleting QR Sessions...")
        db.query(QRSession).delete()
        
        print("Deleting Users...")
        db.query(User).delete()
        
        print("Deleting Sections...")
        db.query(Section).delete()
        
        print("Deleting Institutions...")
        db.query(Institution).delete()
        
        db.commit()
        print("✅ Database successfully wiped clean!")
        
        # Now re-initialize the dummy data
        from main import initialize_data
        print("Re-creating Admin and Seed Data...")
        initialize_data()
        print("✅ Fresh accounts created!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error resetting database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_database()
