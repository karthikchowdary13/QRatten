from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

# user model for students, teachers, and admins
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column("full_name", String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    mobile_number = Column("mobile", String, nullable=True)
    password = Column("password_hash", String, nullable=False)
    role = Column(String, default="STUDENT") # STUDENT, TEACHER, INSTITUTION_ADMIN, SUPER_ADMIN
    status = Column(String, default="pending") # pending, active, rejected, suspended
    verified = Column(Boolean, default=False)
    avatar_url = Column("avatar_url", String, nullable=True)
    
    # User Activity Tracking
    date_joined = Column(DateTime(timezone=True), server_default=func.now())
    opened_time = Column(DateTime(timezone=True), nullable=True)
    closed_time = Column(DateTime(timezone=True), nullable=True)
    last_active = Column(DateTime(timezone=True), nullable=True)
    
    # Email Verification & Password Tracking
    email_verification_token = Column(String, unique=True, index=True, nullable=True)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    verification_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    password_updated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Registration Approval Tracking
    approval_token = Column(String, unique=True, index=True, nullable=True)
    approval_token_expires_at = Column(DateTime(timezone=True), nullable=True)
