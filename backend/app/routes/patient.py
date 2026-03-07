import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import require_roles
from app.db.deps import get_db
from app.models.queue import Queue
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.queue import QueueCreate, QueueResponse
from app.services.notification import send_notification
from app.services.audit import log_event
from app.services.qr_service import generate_qr_base64

router = APIRouter(prefix="/patient", tags=["Patient"])


# -----------------------------
# PATIENT PROFILE
# -----------------------------
@router.get("/profile")
def patient_profile(
    patient=Depends(require_roles(["patient"]))
):
    return {
        "message": "Patient profile",
        "email": patient.email,
        "role": patient.role
    }


# -----------------------------
# LIST AVAILABLE DOCTORS
# -----------------------------
@router.get("/doctors")
def list_doctors(
    db: Session = Depends(get_db),
    patient=Depends(require_roles(["patient"]))
):
    doctors = db.query(User).filter(User.role == "doctor").all()

    result = []
    for doc in doctors:
        waiting_count = db.query(Queue).filter(
            Queue.doctor_id == doc.id,
            Queue.status.in_(["waiting", "in_progress"])
        ).count()

        result.append({
            "id": doc.id,
            "name": doc.name,
            "email": doc.email,
            "specialization": doc.specialization or "General Physician",
            "is_available": doc.is_available if doc.is_available is not None else True,
            "waiting_patients": waiting_count,
        })

    return result


# -----------------------------
# JOIN QUEUE
# -----------------------------
@router.post("/join-queue", response_model=QueueResponse)
def join_queue(
    data: QueueCreate,
    db: Session = Depends(get_db),
    patient=Depends(require_roles(["patient"]))
):
    # Prevent duplicate queue entry
    existing = db.query(Queue).filter(
        Queue.patient_id == patient.id,
        Queue.doctor_id == data.doctor_id,
        Queue.status.in_(["waiting", "in_progress"])
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You are already in the queue for this doctor"
        )

    # Verify doctor exists
    doctor = db.query(User).filter(User.id == data.doctor_id, User.role == "doctor").first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Generate token number (sequential per doctor today)
    existing_count = db.query(Queue).filter(
        Queue.doctor_id == data.doctor_id
    ).count()
    token_number = f"TKN-{data.doctor_id:03d}-{existing_count + 1:04d}"

    # Generate QR code containing token info
    qr_data = json.dumps({
        "token": token_number,
        "patient_id": patient.id,
        "doctor_id": data.doctor_id,
        "patient_email": patient.email,
    })
    qr_code = generate_qr_base64(qr_data)

    # Create queue entry
    queue_entry = Queue(
        patient_id=patient.id,
        doctor_id=data.doctor_id,
        token_number=token_number,
        qr_code=qr_code,
    )

    db.add(queue_entry)
    db.commit()
    db.refresh(queue_entry)

    # Audit log
    log_event(
        db=db,
        queue_id=queue_entry.id,
        action="joined",
        performed_by="patient"
    )

    # Notification with QR
    send_notification(
        patient.email,
        f"You have joined the queue for Dr. {doctor.name}. Your token is {token_number}.",
        qr_code=qr_code,
        token_number=token_number,
        patient_name=patient.name,
        doctor_name=doctor.name,
        doctor_specialization=doctor.specialization,
    )

    return queue_entry


# -----------------------------
# QUEUE STATUS + POSITION
# -----------------------------
@router.get("/queue/status")
def queue_status(
    db: Session = Depends(get_db),
    patient=Depends(require_roles(["patient"]))
):
    entry = db.query(Queue).filter(
        Queue.patient_id == patient.id,
        Queue.status.in_(["waiting", "in_progress"])
    ).order_by(Queue.created_at).first()

    if not entry:
        return {"message": "You are not in any active queue"}

    waiting_list = db.query(Queue).filter(
        Queue.doctor_id == entry.doctor_id,
        Queue.status == "waiting"
    ).order_by(Queue.created_at).all()

    position = next(
        (i + 1 for i, q in enumerate(waiting_list) if q.patient_id == patient.id),
        None
    )

    avg_time = 10  # minutes per patient
    estimated_time = position * avg_time if position else 0

    # Get doctor info
    doctor = db.query(User).filter(User.id == entry.doctor_id).first()

    return {
        "status": entry.status,
        "position": position,
        "estimated_wait_time_minutes": estimated_time,
        "token_number": entry.token_number,
        "qr_code": entry.qr_code,
        "doctor_name": doctor.name if doctor else None,
        "queue_id": entry.id,
    }


# -----------------------------
# CANCEL QUEUE
# -----------------------------
@router.delete("/queue/cancel")
def cancel_queue(
    db: Session = Depends(get_db),
    patient=Depends(require_roles(["patient"]))
):
    entry = db.query(Queue).filter(
        Queue.patient_id == patient.id,
        Queue.status == "waiting"
    ).first()

    if not entry:
        raise HTTPException(
            status_code=400,
            detail="No cancellable queue entry found"
        )

    entry.status = "cancelled"
    db.commit()

    log_event(
        db=db,
        queue_id=entry.id,
        action="cancelled",
        performed_by="patient"
    )

    return {"message": "Queue cancelled successfully"}


# -----------------------------
# QUEUE HISTORY (AUDIT BASED)
# -----------------------------
@router.get("/queue/history")
def patient_queue_history(
    db: Session = Depends(get_db),
    patient=Depends(require_roles(["patient"]))
):
    logs = db.query(AuditLog)\
        .join(Queue, Queue.id == AuditLog.queue_id)\
        .filter(Queue.patient_id == patient.id)\
        .order_by(AuditLog.timestamp.desc())\
        .all()

    return [
        {
            "queue_id": log.queue_id,
            "action": log.action,
            "performed_by": log.performed_by,
            "timestamp": log.timestamp
        }
        for log in logs
    ]
