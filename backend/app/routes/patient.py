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

from fastapi import HTTPException
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
    # 🔴 CHECK DUPLICATE
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

    queue_entry = Queue(
        patient_id=patient.id,
        doctor_id=data.doctor_id
    )
    db.add(queue_entry)
    db.commit()
    db.refresh(queue_entry)
    return queue_entry


from sqlalchemy.orm import Session
from app.models.queue import Queue
from app.db.deps import get_db
from app.core.deps import require_roles

@router.get("/queue/status")
def queue_status(
    db: Session = Depends(get_db),
    patient = Depends(require_roles(["patient"]))
):
    entry = db.query(Queue)\
        .filter(
            Queue.patient_id == patient.id,
            Queue.status.in_(["waiting", "in_progress"])
        )\
        .order_by(Queue.created_at)\
        .first()

    if not entry:
        return {"message": "You are not in any queue"}

    waiting_list = db.query(Queue)\
        .filter(
            Queue.doctor_id == entry.doctor_id,
            Queue.status == "waiting"
        )\
        .order_by(Queue.created_at)\
        .all()

    position = next(
        (i + 1 for i, q in enumerate(waiting_list) if q.patient_id == patient.id),
        None
    )

    avg_time = 10  # minutes
    estimated_time = position * avg_time if position else 0

    return {
        "status": entry.status,
        "position": position,
        "estimated_wait_time_minutes": estimated_time
    }
from fastapi import HTTPException

@router.delete("/queue/cancel")
def cancel_queue(
    db: Session = Depends(get_db),
    patient = Depends(require_roles(["patient"]))
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

    entry.status = "done"
    db.commit()

    return {"message": "Queue cancelled successfully"}
