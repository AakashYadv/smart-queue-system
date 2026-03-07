from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, Text
from sqlalchemy.sql import func
from app.db.database import Base

class Queue(Base):
    __tablename__ = "queue"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"))
    doctor_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="waiting")  # waiting, in_progress, done, cancelled
    token_number = Column(String, nullable=True)
    qr_code = Column(Text, nullable=True)  # base64 encoded QR image
    created_at = Column(DateTime(timezone=True), server_default=func.now())
