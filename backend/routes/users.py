from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import shutil

from database import get_db
from models.user import User
from schemas.user import UserList, UserDetails, UserUpdate, map_user_details
from routes.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

from typing import Optional
from models.section import SectionStudent

@router.get("/")
@router.get("", response_model=List[UserList])
def list_users(
    section_id: Optional[int] = Query(None, alias="sectionId"),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # only admin/teacher can see all users
    if current_user.role.lower() not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = db.query(User)
    
    if section_id:
        query = query.join(SectionStudent).filter(SectionStudent.section_id == section_id)
        
    return query.all()

@router.get("/{user_id}", response_model=UserDetails)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # calculate simple attendance percentage (placeholder for now)
    # in the future this will query an attendance table
    percentage = 0.0
    if user.role == "student":
        # logic to calculate percentage goes here
        percentage = 95.0 # hardcoded placeholder
        
    return map_user_details(user, percentage)

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # only admins can delete users
    if current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete users")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.patch("/{user_id}", response_model=UserDetails)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # only admin can update other users
    if current_user.id != user_id and current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_update.name is not None:
        user.name = user_update.name
    if user_update.email is not None:
        user.email = user_update.email
    if hasattr(user_update, "mobile_number") and user_update.mobile_number is not None:
        user.mobile_number = user_update.mobile_number
        
    db.commit()
    db.refresh(user)
    
    # Return user details
    percentage = 0.0
    if user.role == "student":
        percentage = 95.0 # placeholder
        
    return map_user_details(user, percentage)

@router.patch("/{user_id}/avatar")
def upload_avatar(
    user_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update avatar")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"avatar_{user_id}_{uuid.uuid4().hex[:8]}.{ext}"
    os.makedirs("uploads/avatars", exist_ok=True)
    filepath = os.path.join("uploads/avatars", filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    avatar_url = f"/uploads/avatars/{filename}"
    user.avatar_url = avatar_url
    db.commit()
    db.refresh(user)

    percentage = 95.0 if user.role == "student" else 0.0
    res = map_user_details(user, percentage)
    res["avatarUrl"] = avatar_url
    return res

@router.delete("/{user_id}/avatar")
def delete_avatar(
    user_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete avatar")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.avatar_url and user.avatar_url.startswith("/uploads/avatars/"):
        filename = user.avatar_url.replace("/uploads/avatars/", "")
        filepath = os.path.join("uploads/avatars", filename)
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception as e:
                print(f"Error removing avatar file: {e}")

    user.avatar_url = None
    db.commit()
    db.refresh(user)

    percentage = 95.0 if user.role == "student" else 0.0
    res = map_user_details(user, percentage)
    res["avatarUrl"] = None
    return res


