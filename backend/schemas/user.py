from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from .auth import UserOut

# basic user info for listing
class UserList(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    date_joined: Optional[datetime] = None
    opened_time: Optional[datetime] = None
    closed_time: Optional[datetime] = None
    last_active: Optional[datetime] = None

    class Config:
        populate_by_name = True
        from_attributes = True

# detailed user info with attendance placeholder
class UserDetails(UserOut):
    attendance_percentage: float = 0.0

    class Config:
        from_attributes = True
        
# help to map user detail when no attendance records exist yet
def map_user_details(user, percentage: float = 0.0):
    user_dict = UserOut.from_orm(user).dict()
    user_dict["attendance_percentage"] = percentage
    return user_dict

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile_number: Optional[str] = Field(None, alias="mobileNumber")
    
    class Config:
        populate_by_name = True
