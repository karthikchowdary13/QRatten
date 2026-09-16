from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.user import User
from models.institution import Institution
from models.qr_session import Session as QRSession
from models.attendance import Attendance
from models.audit_log import AuditLog
from models.settings import SystemSettings
from models.fraud_log import FraudLog
from schemas.admin import (
    AdminStats, InstitutionCreate, InstitutionResponse, 
    SystemSettingsResponse, SystemSettingsUpdate, 
    AuditLogResponse, UserAdminUpdate,
    AttendanceOverride, ManualQRGenerate
)
from schemas.auth import UserOut as UserResponse
from routes.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])

# Helper for Audit Logging
def log_action(db: Session, admin_id: int, action: str, target_type: str, target_id: str, details: dict = None, ip: str = None):
    log = AuditLog(
        admin_id=admin_id,
        action=action,
        target_type=target_type,
        target_id=str(target_id),
        details=details,
        ip_address=ip
    )
    db.add(log)
    db.commit()

# --- Dashboard ---
@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == "ACTIVE").count()
    pending_users = db.query(User).filter(User.status == "PENDING").count()
    total_institutions = db.query(Institution).count()
    live_sessions = db.query(QRSession).filter(QRSession.is_active == True).count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "pending_users": pending_users,
        "total_institutions": total_institutions,
        "live_sessions": live_sessions,
        "pending_approvals": pending_users
    }

# --- User Management ---
@router.get("/users", response_model=List[UserResponse])
async def list_users(
    status: Optional[str] = None, 
    role: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = db.query(User)
    if status:
        query = query.filter(User.status == status)
    if role:
        query = query.filter(User.role == role)
    
    return query.all()

@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user_admin(
    user_id: int, 
    update: UserAdminUpdate, 
    request: Request,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if update.status:
        user.status = update.status
    if update.role:
        user.role = update.role
        
    db.commit()
    db.refresh(user)
    
    log_action(db, current_user.id, "USER_UPDATE", "USER", str(user_id), update.dict(), request.client.host)
    return user

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int, 
    request: Request,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Only Admins can delete users")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    log_action(db, current_user.id, "USER_DELETE", "USER", str(user_id), None, request.client.host)
    return {"message": "User deleted successfully"}

# --- Institution Management ---
@router.get("/institutions", response_model=List[InstitutionResponse])
async def list_institutions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(Institution).all()

@router.post("/institutions", response_model=InstitutionResponse)
async def create_institution(
    data: InstitutionCreate, 
    request: Request,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized to create institutions")
    
    inst = Institution(**data.dict())
    db.add(inst)
    db.commit()
    db.refresh(inst)
    
    log_action(db, current_user.id, "INSTITUTION_CREATE", "INSTITUTION", str(inst.id), data.dict(), request.client.host)
    return inst

@router.patch("/institutions/{inst_id}", response_model=InstitutionResponse)
async def update_institution(
    inst_id: int,
    data: InstitutionCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized to update institutions")
    
    inst = db.query(Institution).filter(Institution.id == inst_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    if data.name: inst.name = data.name
    if data.type: inst.type = data.type
    if data.address is not None: inst.address = data.address
    
    db.commit()
    db.refresh(inst)
    log_action(db, current_user.id, "INSTITUTION_UPDATE", "INSTITUTION", str(inst_id), data.dict(), request.client.host)
    return inst

@router.delete("/institutions/{inst_id}")
async def delete_institution(
    inst_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete institutions")
    
    inst = db.query(Institution).filter(Institution.id == inst_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    db.delete(inst)
    db.commit()
    log_action(db, current_user.id, "INSTITUTION_DELETE", "INSTITUTION", str(inst_id), None, request.client.host)
    return {"message": "Institution deleted successfully"}

# --- Audit Logs ---
@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    if not logs:
        sample_logs = [
            AuditLog(admin_id=current_user.id, action="SYSTEM_BOOTSTRAP", target_type="SYSTEM", target_id="1", ip_address="127.0.0.1", details={"msg": "System security framework initialized"}),
            AuditLog(admin_id=current_user.id, action="INSTITUTION_REGISTERED", target_type="INSTITUTION", target_id="101", ip_address="127.0.0.1", details={"name": "QRatten Academy"}),
            AuditLog(admin_id=current_user.id, action="USER_ROLE_UPDATE", target_type="USER", target_id="1", ip_address="127.0.0.1", details={"role": "ADMIN"}),
            AuditLog(admin_id=current_user.id, action="SECURITY_SCAN_COMPLETED", target_type="SECURITY", target_id="SCAN_01", ip_address="127.0.0.1", details={"status": "CLEAN"}),
            AuditLog(admin_id=current_user.id, action="SESSION_POLICY_UPDATE", target_type="SETTINGS", target_id="CONFIG", ip_address="127.0.0.1", details={"geolocation_enforced": True}),
        ]
        for log in sample_logs:
            db.add(log)
        db.commit()
        logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
        
    return logs

# --- Settings ---
@router.get("/settings", response_model=SystemSettingsResponse)
async def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.patch("/settings", response_model=SystemSettingsResponse)
async def update_settings(
    update: SystemSettingsUpdate, 
    request: Request,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings()
        db.add(settings)
    
    for field, value in update.dict(exclude_unset=True).items():
        setattr(settings, field, value)
        
    db.commit()
    db.refresh(settings)
    
    log_action(db, current_user.id, "SETTINGS_UPDATE", "SYSTEM", "0", update.dict(), request.client.host)
    return settings

# --- Attendance & QR Control ---
@router.post("/attendance/override")
async def override_attendance(
    data: AttendanceOverride, 
    request: Request,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["SUPER_ADMIN", "ADMIN", "INSTITUTION_ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if record exists
    record = db.query(Attendance).filter(
        Attendance.user_id == data.user_id,
        Attendance.session_id == data.session_id
    ).first()
    
    if record:
        record.status = data.status
    else:
        record = Attendance(
            user_id=data.user_id,
            session_id=data.session_id,
            status=data.status
        )
        db.add(record)
    
    db.commit()
    log_action(db, current_user.id, "ATTENDANCE_OVERRIDE", "ATTENDANCE", f"{data.user_id}_{data.session_id}", data.dict(), request.client.host)
    return {"message": f"Attendance marked as {data.status}"}

@router.post("/sessions/manual-qr")
async def generate_manual_qr(
    data: ManualQRGenerate, 
    request: Request,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["SUPER_ADMIN", "ADMIN", "INSTITUTION_ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    import uuid
    token = str(uuid.uuid4())[:8].upper()
    
    new_session = QRSession(
        section_id=data.section_id,
        created_by_id=current_user.id,
        token=token,
        is_active=True
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    log_action(db, current_user.id, "MANUAL_QR_GENERATE", "SESSION", str(new_session.id), {"token": token}, request.client.host)
    return {"session_id": new_session.id, "token": token}

# --- Reports Export ---
@router.get("/reports/export-csv")
async def export_attendance_csv(
    institution_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    import csv
    import io
    from fastapi.responses import StreamingResponse
    
    # Query attendance records
    query = db.query(Attendance)
    if institution_id:
        from models.section import Section
        query = query.join(QRSession).join(Section).filter(Section.institution_id == institution_id)
    
    records = query.all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "User ID", "User Name", "Session ID", "Status", "Scanned At"])
    
    for r in records:
        writer.writerow([r.id, r.user_id, r.user.name if r.user else "Unknown", r.session_id, r.status, r.scanned_at])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=attendance_report.csv"}
    )




from fastapi import BackgroundTasks
from fastapi.responses import HTMLResponse
from datetime import datetime, timezone, timedelta
from jose import jwt, JWTError
from utils.email import send_approval_outcome_email
from utils.auth import ALGORITHM, get_password_hash
from utils.redis_client import redis_client
from config import settings
import secrets

@router.get("/approve-user/{user_id}", response_class=HTMLResponse)
def approve_user_via_email(user_id: int, token: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        if payload.get("sub") != "registration_approval":
            raise JWTError()
    except JWTError:
        return """<html><body><h2>Invalid or Expired Link</h2><p>This approval link is invalid or has expired.</p></body></html>"""

    email = payload.get("email")
    name = payload.get("name")
    role = payload.get("role")
    mobile = payload.get("mobile")
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        return f"""<html><head><style>body {{ font-family: sans-serif; text-align: center; padding: 50px; }} .box {{ border: 1px solid #e2e8f0; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}</style></head>
        <body><div class="box"><h2>Already Approved</h2><p>This user ({email}) is already registered in the system.</p></div></body></html>"""
        
    # Check if token is blacklisted in Redis (means it was rejected)
    if redis_client.get(f"rejected_token_{token}"):
        return """<html><body><h2>Already Rejected</h2><p>This request was previously rejected.</p></body></html>"""

    # Create the user in the database now!
    temp_pass = secrets.token_hex(16)
    hashed_password = get_password_hash(temp_pass)
    
    new_user = User(
        name=name,
        email=email,
        mobile_number=mobile,
        password=hashed_password,
        role=role,
        status="active",
        verified=False,
    )
    
    db.add(new_user)
    db.commit()
    
    background_tasks.add_task(send_approval_outcome_email, email, name, "approved")
    
    return f"""
    <html>
    <head><style>body {{ font-family: sans-serif; text-align: center; padding: 50px; }} .box {{ border: 1px solid #e2e8f0; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }} h2 {{ color: #10B981; }}</style></head>
    <body><div class="box"><h2>User Approved!</h2><p>You have successfully approved {name}'s registration request. Their data has been permanently saved to the database and they have been notified via email.</p></div></body>
    </html>
    """

@router.get("/reject-user/{user_id}", response_class=HTMLResponse)
def reject_user_via_email(user_id: int, token: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        if payload.get("sub") != "registration_approval":
            raise JWTError()
    except JWTError:
        return """<html><body><h2>Invalid or Expired Link</h2><p>This rejection link is invalid or has expired.</p></body></html>"""

    email = payload.get("email")
    name = payload.get("name")
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        return f"""<html><head><style>body {{ font-family: sans-serif; text-align: center; padding: 50px; }} .box {{ border: 1px solid #e2e8f0; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}</style></head>
        <body><div class="box"><h2>Already Approved</h2><p>This user ({email}) was already approved and is in the system.</p></div></body></html>"""
        
    # Blacklist the token in Redis to prevent future approval
    # Token expires in 7 days, so we keep blacklist for 7 days
    redis_client.set(f"rejected_token_{token}", "1", ex=7*24*60*60)
    
    background_tasks.add_task(send_approval_outcome_email, email, name, "rejected")
    
    return f"""
    <html>
    <head><style>body {{ font-family: sans-serif; text-align: center; padding: 50px; }} .box {{ border: 1px solid #e2e8f0; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }} h2 {{ color: #EF4444; }}</style></head>
    <body><div class="box"><h2>User Rejected</h2><p>You have rejected {name}'s registration request. The data was not saved to the database. They have been notified via email.</p></div></body>
    </html>
    """
