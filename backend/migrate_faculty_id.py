from sqlalchemy import text
from database import engine

def migrate():
    with engine.connect() as conn:
        print("Altering 'users' table...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS faculty_id VARCHAR UNIQUE"))
            conn.commit()
            print("Successfully added 'faculty_id' column to 'users' table.")
        except Exception as e:
            print(f"Error altering 'users' table: {e}")
            conn.rollback()

if __name__ == "__main__":
    migrate()
