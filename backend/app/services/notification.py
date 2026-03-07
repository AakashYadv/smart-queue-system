from datetime import datetime
import traceback

# Import email service, but handle if it fails
try:
    from app.services.email_service import send_appointment_email, send_queue_update_email
    EMAIL_SERVICE_AVAILABLE = True
except Exception as e:
    print(f"Email service import error: {e}")
    EMAIL_SERVICE_AVAILABLE = False
    # Dummy functions to prevent import errors
    def send_appointment_email(*args, **kwargs): pass
    def send_queue_update_email(*args, **kwargs): pass


def send_notification(
    user_email: str,
    message: str,
    qr_code: str = None,
    token_number: str = None,
    patient_name: str = None,
    doctor_name: str = None,
    doctor_specialization: str = None
):
    """
    Send notification via email.
    Uses real email service if configured, otherwise falls back to console.
    """
    # Try to send real email
    if EMAIL_SERVICE_AVAILABLE:
        try:
            # If we have appointment details, send appointment email
            if doctor_name and token_number:
                appointment_date = datetime.now().strftime("%B %d, %Y at %I:%M %p")
                send_appointment_email(
                    to_email=user_email,
                    patient_name=patient_name or "Patient",
                    doctor_name=doctor_name,
                    doctor_specialization=doctor_specialization or "General Physician",
                    token_number=token_number,
                    appointment_date=appointment_date,
                    qr_code_base64=qr_code
                )
                return
        except Exception as e:
            print(f"Email service error: {e}")
            traceback.print_exc()
    
    # Fallback to console notification
    print(f"\n{'='*60}")
    print(f"[EMAIL NOTIFICATION]")
    print(f"  To      : {user_email}")
    print(f"  Message : {message}")
    if token_number:
        print(f"  Token # : {token_number}")
    if qr_code:
        print(f"  QR Code : [base64 image attached — {len(qr_code)} chars]")
    print(f"{'='*60}\n")


def send_queue_called_email(
    user_email: str,
    patient_name: str,
    doctor_name: str,
    token_number: str,
    position: int = None
):
    """Send email when patient's turn is called."""
    if not EMAIL_SERVICE_AVAILABLE:
        print(f"[QUEUE UPDATE] Patient {patient_name}: Your turn! Token: {token_number}")
        return
    
    try:
        send_queue_update_email(
            to_email=user_email,
            patient_name=patient_name,
            doctor_name=doctor_name,
            token_number=token_number,
            status="called",
            position=position
        )
    except Exception as e:
        print(f"Email service error: {e}")
        traceback.print_exc()


def send_appointment_completed_email(
    user_email: str,
    patient_name: str,
    doctor_name: str,
    token_number: str
):
    """Send email when appointment is completed."""
    if not EMAIL_SERVICE_AVAILABLE:
        print(f"[APPOINTMENT COMPLETE] Patient {patient_name}: Completed with Dr. {doctor_name}")
        return
    
    try:
        send_queue_update_email(
            to_email=user_email,
            patient_name=patient_name,
            doctor_name=doctor_name,
            token_number=token_number,
            status="completed"
        )
    except Exception as e:
        print(f"Email service error: {e}")
        traceback.print_exc()
