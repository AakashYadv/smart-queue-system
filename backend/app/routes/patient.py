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