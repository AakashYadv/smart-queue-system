from fastapi import APIRouter, Depends
from app.core.deps import require_roles
router=APIRouter(prefix="/admin",tags=["Admin"])
@router.get("/dashboard")
def admin_dashboard(
    admin=Depends(require_roles(["admin"]))
):
    return{
        "message":"Welcome Admin",
        "admin_email":admin.email
    }