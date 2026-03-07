from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.queue import Queue
from app.models.user import User
from app.db.deps import get_db
from app.core.deps import require_roles
from app.services.notification import send_notification, send_queue_called_email, send_appointment_completed_email
from app.services.audit import log_event

router = APIRouter(prefix="/doctor", tags=["Doctor"])


# -----------------------------
# TOGGLE AVAILABILITY
# -----------------------------
@router.patch("/availability")
def toggle_availability(
    db: Session = Depends(get_db),
    doctor=Depends(require_roles(["doctor"]))
):
    doctor.is_available = not doctor.is_available
    db.commit()
    db.refresh(doctor)
    return {
        "is_available": doctor.is_available,
        "message": f"You are now {'available' if doctor.is_available else 'unavailable'}"
    }


# -----------------------------
# VIEW CURRENT QUEUE
# -----------------------------
@router.get("/queue")
def view_queue(
    db: Session = Depends(get_db),
    doctor=Depends(require_roles(["doctor"]))
):
    entries = db.query(Queue)\
        .filter(
            Queue.doctor_id == doctor.id,
            Queue.status.in_(["waiting", "in_progress"])
        )\
        .order_by(Queue.created_at)\
        .all()

    result = []
    for i, entry in enumerate(entries):
        patient = db.query(User).filter(User.id == entry.patient_id).first()
        result.append({
            "id": entry.id,
            "patient_id": entry.patient_id,
            "patient_name": patient.name if patient else "Unknown",
            "patient_email": patient.email if patient else "",
            "status": entry.status,
            "token_number": entry.token_number,
            "position": i + 1,
            "created_at": entry.created_at,
        })

    return result


# -----------------------------
# CALL NEXT PATIENT
# -----------------------------
@router.post("/queue/next")
def call_next_patient(
    db: Session = Depends(get_db),
    doctor=Depends(require_roles(["doctor"]))
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
    db.commit()

    log_event(
        db=db,
        queue_id=next_patient.id,
        action="called",
        performed_by="doctor"
    )

    patient = db.query(User).filter(User.id == next_patient.patient_id).first()

    # Send email notification to patient
    send_queue_called_email(
        user_email=patient.email,
        patient_name=patient.name,
        doctor_name=doctor.name,
        token_number=next_patient.token_number,
        position=1
    )

    return {
        "message": "Next patient called",
        "queue_id": next_patient.id,
        "patient_id": next_patient.patient_id,
        "patient_name": patient.name if patient else "Unknown",
        "token_number": next_patient.token_number,
    }


# -----------------------------
# COMPLETE CONSULTATION
# -----------------------------
@router.post("/queue/{queue_id}/complete")
def complete_consultation(
    queue_id: int,
    db: Session = Depends(get_db),
    doctor=Depends(require_roles(["doctor"]))
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

    patient = db.query(User).filter(User.id == entry.patient_id).first()
    if patient:
        send_appointment_completed_email(
            user_email=patient.email,
            patient_name=patient.name,
            doctor_name=doctor.name,
            token_number=entry.token_number
        )

    return {"message": "Consultation completed", "token_number": entry.token_number}


# -----------------------------
# DOCTOR QUEUE HISTORY
# -----------------------------
@router.get("/queue/history")
def doctor_queue_history(
    db: Session = Depends(get_db),
    doctor=Depends(require_roles(["doctor"]))
):
    entries = db.query(Queue)\
        .filter(
            Queue.doctor_id == doctor.id,
            Queue.status.in_(["done", "cancelled"])
        )\
        .order_by(Queue.created_at.desc())\
        .all()

    result = []
    for entry in entries:
        patient = db.query(User).filter(User.id == entry.patient_id).first()
        result.append({
            "id": entry.id,
            "patient_id": entry.patient_id,
            "patient_name": patient.name if patient else "Unknown",
            "status": entry.status,
            "token_number": entry.token_number,
            "created_at": entry.created_at,
        })

    return result
