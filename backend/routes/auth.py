import secrets
from datetime import timedelta, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from jose import JWTError, jwt

from database import get_db
from models.user import User
from schemas.auth import (
    UserCreate, UserOut, LoginRequest, Token, TokenData, 
    VerifyPasswordRequest, TokenRefreshRequest, ChangePasswordRequest,
    VerifyEmailRequest, ResendVerificationRequest
)
from utils.auth import get_password_hash, verify_password, create_access_token, ALGORITHM
from utils.email import send_verification_email, send_welcome_email
from config import settings

# define oauth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter(prefix="/auth", tags=["authentication"])

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # dependency to get the currently logged in user
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # decode jwt token
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
        
    # Update last_active timestamp
    from sqlalchemy.sql import func
    user.last_active = func.now()
    db.commit()
    
    return user

@router.post("/register", response_model=UserOut)
def register(user_data: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # enforce lowercase for email consistency
    email = user_data.email.lower().strip()
    
    print(f"Registering new user: {email} with role: {user_data.role}")
    
    # check if email exists
    db_user = db.query(User).filter(User.email == email).first()
    if db_user:
        print(f"Registration failed: Email {email} already exists")
        raise HTTPException(status_code=400, detail={"message": "Email already registered"})
    
    # We no longer save to the database here.
    # Instead, we encode all registration data into a secure JWT.
    
    payload = {
        "sub": "registration_approval",
        "name": user_data.name,
        "email": email,
        "mobile": user_data.mobileNumber,
        "role": user_data.role.lower() if user_data.role else "student",
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    
    approval_token = jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)
    
    # Send confirmation email to User
    from utils.email import send_registration_confirmation_email, send_admin_approval_request_email
    background_tasks.add_task(send_registration_confirmation_email, email, user_data.name)
    
    # Get admin email
    admin = db.query(User).filter(User.role.in_(["admin", "SUPER_ADMIN", "INSTITUTION_ADMIN"])).first()
    admin_email = admin.email if admin else settings.EMAIL_USER or "admin@qratten.com"
    
    # Send approval request email to ADMIN asynchronously
    background_tasks.add_task(send_admin_approval_request_email, admin_email, 0, user_data.name, email, user_data.role, approval_token)
    
    # Return a mock user object to satisfy the response_model without saving to DB
    fake_user = User(
        id=0,
        name=user_data.name,
        email=email,
        mobile_number=user_data.mobileNumber,
        role=user_data.role.lower() if user_data.role else "student",
        status="pending",
        verified=False,
    )
    return fake_user

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    # enforce lowercase for email consistency
    email = login_data.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": "Incorrect email or password"}, # Generic error
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"message": "Incorrect email or password"},
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if user.status == "pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Your account is pending admin approval."},
        )
        
    if not user.verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Please verify your email address to log in."},
        )


    # Log login and update user
    from models.login_log import LoginLog
    from sqlalchemy.sql import func
    from datetime import datetime
    
    try:
        db.add(LoginLog(
            user_id=user.id, 
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent")
        ))
        # Update user activity timestamps
        user.opened_time = func.now()
        user.last_active = func.now()
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Warning: Failed to save login log or activity ({str(e)}). Proceeding with login.")
    
    # generate the tokens
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(minutes=30)
    )
    refresh_token = create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(days=7)
    )
    
    return {
        "accessToken": access_token, 
        "refreshToken": refresh_token,
        "token_type": "bearer",
        "user": user # SQLAlchemy model will be parsed by UserOut
    }

@router.post("/verify-password")
def verify_user_password(
    data: VerifyPasswordRequest, 
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )
    return {"valid": True}
    
@router.post("/refresh", response_model=Token)
def refresh(refresh_data: TokenRefreshRequest, db: Session = Depends(get_db)):
    # dependency to get the currently logged in user
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # decode jwt refresh token
        payload = jwt.decode(refresh_data.refreshToken, settings.JWT_SECRET, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
        
    print(f"Token refreshed for: {email}")
    
    # generate new tokens
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(minutes=30)
    )
    refresh_token = create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(days=7)
    )
    
    # ensure role is uppercase for frontend compatibility
    user_data = UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        mobile_number=user.mobile_number,
        role=user.role.upper() if user.role else "STUDENT",
        status=user.status,
        verified=user.verified,
        date_joined=user.date_joined,
        opened_time=user.opened_time,
        closed_time=user.closed_time,
        last_active=user.last_active
    )
    
    return {
        "accessToken": access_token, 
        "refreshToken": refresh_token,
        "token_type": "bearer",
        "user": user_data
    }

@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.currentPassword, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect current password",
        )
    
    current_user.password = get_password_hash(data.newPassword)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.post("/logout")
def logout(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy.sql import func
    current_user.closed_time = func.now()
    current_user.last_active = func.now()
    db.commit()
    return {"message": "Logged out successfully"}

@router.post("/verify-email")
def verify_email(data: VerifyEmailRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    email = data.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(status_code=400, detail={"message": "Invalid verification link."})
        
    if user.verified:
        return {"message": "Email already verified."}
        
    if user.email_verification_token != data.token:
        raise HTTPException(status_code=400, detail={"message": "Invalid or expired verification token."})
        
    if user.verification_token_expires_at and user.verification_token_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail={"message": "Verification link has expired. Please request a new one."})
        
    # Mark user as verified
    user.verified = True
    user.email_verification_token = None
    user.verification_token_expires_at = None
    user.email_verified_at = datetime.now(timezone.utc)
    
    db.commit()
    
    # Send welcome email asynchronously
    background_tasks.add_task(send_welcome_email, email)
    
    return {"message": "Email verified successfully. You can now log in."}

@router.post("/resend-verification")
def resend_verification(data: ResendVerificationRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    email = data.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Generic message for security
        return {"message": "If that email is registered, a new verification link has been sent."}
        
    if user.verified:
        return {"message": "If that email is registered, a new verification link has been sent."}
        
    # Generate new token
    verification_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    
    user.email_verification_token = verification_token
    user.verification_token_expires_at = expires_at
    db.commit()
    
    background_tasks.add_task(send_verification_email, email, verification_token)
    
    return {"message": "If that email is registered, a new verification link has been sent."}
