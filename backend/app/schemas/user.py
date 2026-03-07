from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # patient, doctor
    specialization: Optional[str] = None  # required if role == doctor

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    specialization: Optional[str] = None
    is_available: Optional[bool] = True

    class Config:
        from_attributes = True
