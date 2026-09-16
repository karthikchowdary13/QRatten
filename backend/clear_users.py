from database import SessionLocal
from models.user import User

def clear_users():
    db = SessionLocal()
    try:
        count = db.query(User).delete()
        db.commit()
        print(f"Successfully deleted {count} old users from the database.")
        print("Your database is now fully clean and ready for new registrations!")
    except Exception as e:
        db.rollback()
        print(f"Error deleting users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clear_users()
