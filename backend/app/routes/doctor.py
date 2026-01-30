from fastapi import APIRouter,Depends
from app.core.deps import require_roles
router=APIRouter(prefix="/doctor",tags=["Doctor"])
@router.get("/queue")
def doctor_queue(
    doctor=Depends(require_roles(["doctor"]))
):
    return {
        "message":"Doctor queue accessed",
        "doctor": doctor.email
    }
from sqlalchemy.orm import Session
from app.models.queue import Queue
from app.db.deps import get_db
from app.core.deps import require_roles

@router.get("/queue")
def view_queue(
    db: Session = Depends(get_db),
    doctor = Depends(require_roles(["doctor"]))
):
    queue = db.query(Queue)\
        .filter(Queue.doctor_id == doctor.id)\
        .order_by(Queue.created_at)\
        .all()
    return queue
