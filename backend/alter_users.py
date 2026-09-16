import os
import sys

# Add current directory to path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from sqlalchemy import text

def alter_users_table():
    db = SessionLocal()
    try:
        # Check if column exists first to be safe
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255) UNIQUE;"))
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;"))
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP WITH TIME ZONE;"))
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();"))
        
        # Create index on email_verification_token
        db.execute(text("CREATE INDEX IF NOT EXISTS ix_users_email_verification_token ON users(email_verification_token);"))
        
        # Mark all existing users (our 3 freshly created ones) as verified so they don't get locked out
        db.execute(text("UPDATE users SET verified = true WHERE verified = false;"))
        
        db.commit()
        print("Successfully updated users schema and verified existing users.")
    except Exception as e:
        db.rollback()
        print(f"Error altering users table: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    alter_users_table()
