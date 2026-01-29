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