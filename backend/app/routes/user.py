from fastapi import APIRouter ,Depends
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.models.user import User
from app.schemas.user import UserCreate,UserResponse
from app.core.security import hash_password

router=APIRouter(prefix="/users" , tags=["Users"])
@router.post("/",response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user=User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
