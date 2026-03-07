from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import hash_password

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check for duplicate email
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Validate role
    if user.role not in ("patient", "doctor"):
        raise HTTPException(status_code=400, detail="Role must be 'patient' or 'doctor'")

    # Doctors must provide specialization
    if user.role == "doctor" and not user.specialization:
        raise HTTPException(status_code=400, detail="Specialization is required for doctors")

    db_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role,
        specialization=user.specialization if user.role == "doctor" else None,
        is_available=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# Legacy endpoint kept for compatibility
@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    return register_user(user, db)
