from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QueueCreate(BaseModel):
    doctor_id: int

class QueueResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    status: str
    token_number: Optional[str] = None
    qr_code: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
