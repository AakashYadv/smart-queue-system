# from fastapi import APIRouter, Depends
# from app.core.deps import require_roles
# router=APIRouter(prefix="/admin",tags=["Admin"])
# @router.get("/dashboard")
# def admin_dashboard(
#     admin=Depends(require_roles(["admin"]))
# ):
#     return{
#         "message":"Welcome Admin",
#         "admin_email":admin.email
#     }
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.deps import get_db
from app.core.deps import require_roles
from app.models.user import User
from app.models.queue import Queue

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    admin = Depends(require_roles(["admin"]))
):
    total_users = db.query(User).count()
    total_patients = db.query(User).filter(User.role == "patient").count()
    total_doctors = db.query(User).filter(User.role == "doctor").count()

    total_queue_entries = db.query(Queue).count()

    queue_status = db.query(
        Queue.status,
        func.count(Queue.id)
    ).group_by(Queue.status).all()

    doctor_load = db.query(
        Queue.doctor_id,
        func.count(Queue.id)
    ).filter(
        Queue.status == "waiting"
    ).group_by(Queue.doctor_id).all()

    return {
        "users": {
            "total": total_users,
            "patients": total_patients,
            "doctors": total_doctors
        },
        "queue": {
            "total_entries": total_queue_entries,
            "status_breakdown": dict(queue_status)
        },
        "doctor_load": [
            {
                "doctor_id": doc_id,
                "waiting_patients": count
            }
            for doc_id, count in doctor_load
        ]
    }
