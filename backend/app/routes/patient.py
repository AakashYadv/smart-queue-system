from fastapi import APIRouter, Depends
from app.core.deps import require_roles

router=APIRouter(prefix="/patient",tags=["Patient"])
@router.get("/profile")
def patient_profile(
    patient=Depends(require_roles(["patient"]))
):
    return {
        "message":"Patient profile",
        "email": patient.email
    }

from sqlalchemy.orm import Session
from app.models.queue import Queue
from app.schemas.queue import QueueCreate, QueueResponse
from app.core.deps import require_roles
from app.db.deps import get_db

@router.post("/join-queue", response_model=QueueResponse)
def join_queue(
    data: QueueCreate,
    db: Session = Depends(get_db),
    patient = Depends(require_roles(["patient"]))
):
    queue_entry = Queue(
        patient_id=patient.id,
        doctor_id=data.doctor_id
    )
    db.add(queue_entry)
    db.commit()
    db.refresh(queue_entry)
    return queue_entry
