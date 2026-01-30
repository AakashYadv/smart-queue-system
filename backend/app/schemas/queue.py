from pydantic import BaseModel
class QueueCreate(BaseModel):
    doctor_id: int
class QueueResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    status: str
    class Config:
        from_attributes = True