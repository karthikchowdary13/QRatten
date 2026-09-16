from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

# schema for user registration
class UserCreate(BaseModel):
    name: str = Field(alias="name")
    email: str = Field(alias="email") # use str for reliability
    password: Optional[str] = Field(None, alias="password")
    role: Optional[str] = Field("student", alias="role")
    mobileNumber: Optional[str] = Field(None, alias="mobileNumber")

    class Config:
        populate_by_name = True

# schema for user response (hide password)
class UserOut(BaseModel):
    id: int
    name: str = Field(alias="name")
    email: str = Field(alias="email")
    mobile_number: Optional[str] = Field(None, alias="mobileNumber")
    role: str = Field(alias="role")
    status: str = Field("pending", alias="status")
    verified: bool = False
    date_joined: Optional[datetime] = None
    opened_time: Optional[datetime] = None
    closed_time: Optional[datetime] = None
    last_active: Optional[datetime] = None

    class Config:
        from_attributes = True
        populate_by_name = True

# schema for login request
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# schema for jwt token
class Token(BaseModel):
    accessToken: str
    refreshToken: str
    token_type: str = "bearer"
    user: UserOut

# data stored in token
class TokenData(BaseModel):
    email: Optional[str] = None

# schema for password verification
class VerifyPasswordRequest(BaseModel):
    password: str

# schema for token refresh
class TokenRefreshRequest(BaseModel):
    refreshToken: str

class ChangePasswordRequest(BaseModel):
    currentPassword: str = Field(alias="currentPassword")
    newPassword: str = Field(alias="newPassword")
    
    class Config:
        populate_by_name = True

# schema for email verification
class VerifyEmailRequest(BaseModel):
    token: str
    email: EmailStr

# schema for resending verification email
class ResendVerificationRequest(BaseModel):
    email: EmailStr
