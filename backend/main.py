from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
import os
from config import settings

from routes import auth, sections, users, qr, attendance, dashboard, reports
from database import engine, Base, SessionLocal
import models.user 
import models.section
import models.qr_session
import models.attendance
import models.institution
import models.audit_log
import models.settings
import models.fraud_log
import models.login_log

# create database tables if they don't exist
Base.metadata.create_all(bind=engine)

# initialization to ensure 3 sections and 120 students exist
def initialize_data():
    db = SessionLocal()
    try:
        from models.user import User
        from models.section import Section, SectionStudent
        from utils.auth import get_password_hash
        
        # 1. Lowercase existing emails
        users = db.query(User).all()
        for u in users:
            if u.email and u.email != u.email.lower():
                u.email = u.email.lower().strip()
        db.commit()

        # 2. Ensure main teacher exists (critical for persistence across recycles)
        teacher_email = "karthikmb77@gmail.com"
        teacher = db.query(User).filter(User.email == teacher_email).first()
        if not teacher:
            print(f"Seeding main teacher: {teacher_email}")
            teacher = User(
                name="Karthik Chowdary",
                email=teacher_email,
                password=get_password_hash("Srikar@0417"),
                role="teacher",
                status="active",
                verified=True
            )
            db.add(teacher)
            db.commit()

        # 3. Ensure Super Admin exists
        admin_email = "admin@qratten.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            print(f"Seeding super admin: {admin_email}")
            admin = User(
                name="QRatten Admin",
                email=admin_email,
                password=get_password_hash("admin123"),
                role="admin",
                status="active",
                verified=True
            )
            db.add(admin)
            db.commit()

        # 3. Ensure Super Student exists
        student_email = "student@qratten.com"
        student = db.query(User).filter(User.email == student_email).first()
        if not student:
            print(f"Seeding super student: {student_email}")
            student = User(
                name="QRatten Student",
                email=student_email,
                password=get_password_hash("student123"),
                role="student",
                status="active",
                verified=True
            )
            db.add(student)
            db.commit()

        # Ensure Dummy Guest exists
        guest_email = "guest@qratten.com"
        guest = db.query(User).filter(User.email == guest_email).first()
        if not guest:
            print(f"Seeding dummy guest: {guest_email}")
            guest = User(
                name="Guest Visitor",
                email=guest_email,
                password=get_password_hash("guest123"),
                role="teacher", # let them see the teacher dashboard
                status="active",
                verified=True
            )
            db.add(guest)
            db.commit()

        # 4. Ensure Default Settings exist
        from models.settings import SystemSettings
        if not db.query(SystemSettings).first():
            db.add(SystemSettings())
            db.commit()

        # 5. Seed 3 sections x 40 students if roster is empty
        institution_id = "qratten_main"
        if db.query(User).filter(User.role == "student").count() < 100:
            print("Seeding requested 120 students across 3 sections...")
            password = get_password_hash("password123")
            section_names = ["CS-101", "CS-102", "CS-103"]
            
            for s_name in section_names:
                # Get or create section
                section = db.query(Section).filter(Section.name == s_name).first()
                if not section:
                    section = Section(name=s_name, institution_id=institution_id)
                    db.add(section)
                    db.commit()
                    db.refresh(section)
                
                # Create 40 students
                for i in range(1, 41):
                    email = f"student_{s_name.lower()}_{i}@qratten.io"
                    name = f"Student {i} ({s_name})"
                    
                    user = db.query(User).filter(User.email == email).first()
                    if not user:
                        user = User(
                            name=name,
                            email=email,
                            password=password,
                            role="student",
                            verified=True
                        )
                        db.add(user)
                        db.commit()
                        db.refresh(user)
                    
                    # Link to section
                    link = db.query(SectionStudent).filter(
                        SectionStudent.section_id == section.id,
                        SectionStudent.user_id == user.id
                     ).first()
                    if not link:
                        db.add(SectionStudent(section_id=section.id, user_id=user.id))
            db.commit()
            print("Seeding complete.")
    except Exception as e:
        print(f"Initialization error: {e}")
    finally:
        db.close()

initialize_data()

# init our fastapi app
app = FastAPI(
    title="QRatten API",
    description="QR Attendance Platform API",
    version="0.1.0-beta",
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=True
)

# create uploads directory if it doesn't exist
os.makedirs("uploads/avatars", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# cors setup (Top level)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001", 
        "http://127.0.0.1:3001",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://qrattenapp.vercel.app",
        "https://qratten.vercel.app",
        "https://qratten-next.vercel.app",
    ],
    allow_origin_regex=r"https://.*qratten.*\.vercel\.app", # Allow all Vercel preview and production deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# compress responses
app.add_middleware(GZipMiddleware, minimum_size=1000)

from fastapi import Request
from jose import jwt
from utils.auth import ALGORITHM

@app.middleware("http")
async def guest_readonly_middleware(request: Request, call_next):
    if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
        # Allow authentication endpoints
        if not request.url.path.startswith("/auth/"):
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                try:
                    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
                    email = payload.get("sub")
                    if email == "guest@qratten.com":
                        from fastapi.responses import JSONResponse
                        return JSONResponse(
                            status_code=403,
                            content={"message": "Guest users can only view data, not modify it."},
                            headers={
                                "Access-Control-Allow-Origin": request.headers.get("origin") or "*",
                                "Access-Control-Allow-Credentials": "true"
                            }
                        )
                except Exception:
                    pass
    return await call_next(request)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    error_msg = f"Global Exception Hook: {str(exc)}"
    print(error_msg)
    print(traceback.format_exc())
    from fastapi.responses import JSONResponse
    
    # Dynamically allow the requester's origin if it's in our allowed list
    origin = request.headers.get("origin")
    
    return JSONResponse(
        status_code=500,
        content={"message": "An internal server error occurred", "detail": str(exc), "error": "InternalServerError"},
        headers={
            "Access-Control-Allow-Origin": origin if origin else "*",
            "Access-Control-Allow-Credentials": "true"
        }
    )

# register routers
from fastapi.responses import JSONResponse

@app.get("/api/test-email")
def test_email():
    try:
        from utils.email import send_email
        success = send_email(
            "karthikethamukkala4@gmail.com", 
            "Render Diagnostic Test", 
            "<h1>Test from Render</h1><p>If you see this, email is working.</p>",
            "Test from Render"
        )
        if success:
            return {"status": "success", "message": "Email sent successfully!"}
        else:
            return JSONResponse(status_code=500, content={"status": "error", "message": "Email failed. Check Render logs."})
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

app.include_router(auth.router)
app.include_router(sections.router)
app.include_router(users.router)
app.include_router(qr.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)
app.include_router(reports.router)

# Import and include admin router
from routes import admin
app.include_router(admin.router)

@app.get("/health")
def health_check():
    # basic health check to see if api is alive
    return {"status": "ok"}

@app.get("/")
def home():
    # root endpoint with welcome message
    return {"message": "Welcome to QRatten API"}

@app.get("/run-migration")
def run_migration():
    from database import engine
    from sqlalchemy import text
    results = []
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT FALSE;"))
            conn.execute(text("UPDATE users SET verified = TRUE;"))
            results.append("Added 'verified' column.")
        except Exception as e:
            results.append(f"Skipped 'verified': {e}")
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN email_verification_token VARCHAR;"))
            conn.execute(text("CREATE UNIQUE INDEX ix_users_email_verification_token ON users (email_verification_token);"))
            results.append("Added 'email_verification_token' column.")
        except Exception as e:
            results.append(f"Skipped 'email_verification_token': {e}")
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE;"))
            results.append("Added 'email_verified_at' column.")
        except Exception as e:
            results.append(f"Skipped 'email_verified_at': {e}")
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN verification_token_expires_at TIMESTAMP WITH TIME ZONE;"))
            results.append("Added 'verification_token_expires_at' column.")
        except Exception as e:
            results.append(f"Skipped 'verification_token_expires_at': {e}")
            
        try:
            conn.commit()
        except:
            pass
            
    return {"message": "Migration completed!", "details": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
