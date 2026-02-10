from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.queue import Queue
from app.db.deps import get_db
from app.core.deps import require_roles
from app.services.notification import send_notification
from app.models.user import User
from app.services.audit import log_event

router = APIRouter(prefix="/doctor", tags=["Doctor"])


@router.get("/queue")
def view_queue(
    db: Session = Depends(get_db),
    doctor = Depends(require_roles(["doctor"]))
):
    queue = db.query(Queue)\
        .filter(
            Queue.doctor_id == doctor.id,
            Queue.status == "waiting"
        )\
        .order_by(Queue.created_at)\
        .all()

    return queue
@router.post("/queue/next")
def call_next_patient(
    db: Session = Depends(get_db),
    doctor = Depends(require_roles(["doctor"]))
):
    next_patient = db.query(Queue)\
        .filter(
            Queue.doctor_id == doctor.id,
            Queue.status == "waiting"
        )\
        .order_by(Queue.created_at)\
        .first()

    if not next_patient:
        return {"message": "No patients in queue"}

    next_patient.status = "in_progress"
    
    log_event(
    db=db,
    queue_id=next_patient.id,
    action="called",
    performed_by="doctor"
)

    patient = db.query(User).filter(User.id == next_patient.patient_id).first()

    send_notification(
     patient.email,
    "It is now your turn. Please proceed to the doctor's room."
    )


    return {
        "message": "Next patient called",
        "queue_id": next_patient.id,
        "patient_id": next_patient.patient_id
    }
@router.post("/queue/{queue_id}/complete")
def complete_consultation(
    queue_id: int,
    db: Session = Depends(get_db),
    doctor = Depends(require_roles(["doctor"]))
):
    entry = db.query(Queue).filter(
        Queue.id == queue_id,
        Queue.doctor_id == doctor.id
    ).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Queue entry not found")

    entry.status = "done"
    db.commit()
    log_event(
    db=db,
    queue_id=entry.id,
    action="completed",
    performed_by="doctor"
)
    return {"message": "Consultation completed"}
