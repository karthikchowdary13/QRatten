import os
from sqlalchemy import create_engine, text

def migrate_database():
    print("This script will add the necessary email verification columns to your users table.")
    db_url = input("Enter your Database URL (e.g. postgresql://user:pass@host/dbname) or press Enter to use local .env: ")
    
    if not db_url.strip():
        from config import settings
        db_url = settings.DATABASE_URL
        print(f"Using database URL from config...")
        
    engine = create_engine(db_url)
    
    with engine.connect() as conn:
        try:
            print("Adding 'verified' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT FALSE;"))
            conn.execute(text("UPDATE users SET verified = TRUE;")) # Mark existing users as verified
            print("Added 'verified' column.")
        except Exception as e:
            print(f"Column 'verified' might already exist or error occurred: {e}")
            
        try:
            print("Adding 'email_verification_token' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN email_verification_token VARCHAR;"))
            conn.execute(text("CREATE UNIQUE INDEX ix_users_email_verification_token ON users (email_verification_token);"))
            print("Added 'email_verification_token' column.")
        except Exception as e:
            print(f"Column 'email_verification_token' might already exist or error occurred: {e}")
            
        try:
            print("Adding 'email_verified_at' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE;"))
            print("Added 'email_verified_at' column.")
        except Exception as e:
            print(f"Column 'email_verified_at' might already exist or error occurred: {e}")
            
        try:
            print("Adding 'verification_token_expires_at' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN verification_token_expires_at TIMESTAMP WITH TIME ZONE;"))
            print("Added 'verification_token_expires_at' column.")
        except Exception as e:
            print(f"Column 'verification_token_expires_at' might already exist or error occurred: {e}")
            
        try:
            conn.commit()
            print("Migration complete!")
        except Exception as e:
            # Some versions of sqlalchemy don't require manual commit for DDL
            pass

if __name__ == "__main__":
    migrate_database()
