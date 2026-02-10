from app.models.audit_log import AuditLog

def log_event(db, queue_id: int, action: str, performed_by: str):
    log = AuditLog(
        queue_id=queue_id,
        action=action,
        performed_by=performed_by
    )
    db.add(log)
    db.commit()
