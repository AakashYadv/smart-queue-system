from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    queue_id = Column(Integer, ForeignKey("queue.id"))
    action = Column(String)  # joined, called, completed, cancelled
    performed_by = Column(String)  # patient / doctor / system
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
