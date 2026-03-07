"""Email service for sending appointment confirmations with QR codes."""
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import base64
from io import BytesIO


def send_appointment_email(
    to_email: str,
    patient_name: str,
    doctor_name: str,
    doctor_specialization: str,
    token_number: str,
    appointment_date: str,
    qr_code_base64: str = None
):
    """Send appointment confirmation email with QR code.
    
    Args:
        to_email: Patient's email address
        patient_name: Patient's name
        doctor_name: Doctor's name
        doctor_specialization: Doctor's specialization
        token_number: Queue token number
        appointment_date: Date of appointment
        qr_code_base64: Base64 encoded QR code image
    """
    # Get email settings from environment
    EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
    EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
    EMAIL_FROM = os.getenv("EMAIL_FROM", EMAIL_USERNAME)
    
    # Check if credentials are configured
    if not EMAIL_USERNAME or not EMAIL_PASSWORD:
        print("Email credentials not configured. Skipping email send.")
        return False
    
    # Check if password is a placeholder (user hasn't set it)
    if not EMAIL_PASSWORD or EMAIL_PASSWORD == "":
        print("Email password not set. Skipping email send.")
        return False
    
    # Create message
    msg = MIMEMultipart('related')
    msg['From'] = EMAIL_FROM
    msg['To'] = to_email
    msg['Subject'] = f'Appointment Confirmed - Token: {token_number}'
    
    # HTML email body with embedded QR code
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 24px; }}
            .content {{ padding: 30px; }}
            .token-box {{ background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
            .token-number {{ font-size: 32px; font-weight: bold; color: #0ea5e9; }}
            .details {{ margin: 20px 0; }}
            .details p {{ margin: 10px 0; color: #374151; }}
            .details strong {{ color: #1f2937; }}
            .qr-section {{ text-align: center; margin: 25px 0; }}
            .qr-section img {{ max-width: 200px; border-radius: 8px; }}
            .footer {{ background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }}
            .btn {{ display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 15px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏥 Appointment Confirmed</h1>
            </div>
            <div class="content">
                <p>Dear <strong>{patient_name}</strong>,</p>
                <p>Your appointment has been successfully booked. Here are your appointment details:</p>
                
                <div class="token-box">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Your Token Number</p>
                    <div class="token-number">{token_number}</div>
                </div>
                
                <div class="details">
                    <p><strong>👨‍⚕️ Doctor:</strong> Dr. {doctor_name}</p>
                    <p><strong>🏥 Specialization:</strong> {doctor_specialization}</p>
                    <p><strong>📅 Date:</strong> {appointment_date}</p>
                    <p><strong>⏰ Status:</strong> You are in the queue</p>
                </div>
                
                <div class="qr-section">
                    <p style="color: #6b7280; font-size: 14px;">Show this QR code at the clinic:</p>
    """
    
    # Add QR code if provided
    if qr_code_base64:
        # Remove data URI prefix if present
        if ',' in qr_code_base64:
            qr_code_base64 = qr_code_base64.split(',')[1]
        
        html_body += f"""
                    <img src="data:image/png;base64,{qr_code_base64}" alt="Appointment QR Code" />
        """
    
    html_body += f"""
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">📍 Please arrive at the clinic 15 minutes before your turn.</p>
                <p style="color: #6b7280; font-size: 14px;">📞 For any queries, contact the clinic reception.</p>
            </div>
            <div class="footer">
                <p>Smart Queue System - Making Healthcare Accessible</p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Attach HTML body
    msg.attach(MIMEText(html_body, 'html'))
    
    # Attach QR code image if provided
    if qr_code_base64:
        try:
            # Remove data URI prefix if present
            if ',' in qr_code_base64:
                qr_code_base64 = qr_code_base64.split(',')[1]
            
            # Decode base64 and create image
            qr_data = base64.b64decode(qr_code_base64)
            image = MIMEImage(qr_data, _subtype='png')
            image.add_header('Content-ID', '<qr_code>')
            image.add_header('Content-Disposition', 'inline', filename='qr_code.png')
            msg.attach(image)
        except Exception as e:
            print(f"Error attaching QR code: {e}")
    
    # Send email
    try:
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
        server.sendmail(EMAIL_FROM, to_email, msg.as_string())
        server.quit()
        print(f"Appointment email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


def send_queue_update_email(
    to_email: str,
    patient_name: str,
    doctor_name: str,
    token_number: str,
    status: str,
    position: int = None
):
    """Send queue status update email.
    
    Args:
        to_email: Patient's email address
        patient_name: Patient's name
        doctor_name: Doctor's name
        token_number: Queue token number
        status: Status (called, completed, cancelled)
        position: Current position in queue (optional)
    """
    EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
    EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
    EMAIL_FROM = os.getenv("EMAIL_FROM", EMAIL_USERNAME)
    
    # Check if credentials are configured
    if not EMAIL_USERNAME or not EMAIL_PASSWORD:
        print("Email credentials not configured. Skipping email send.")
        return False
    
    # Check if password is a placeholder (user hasn't set it)
    if not EMAIL_PASSWORD or EMAIL_PASSWORD == "":
        print("Email password not set. Skipping email send.")
        return False
    
    # Determine message based on status
    if status == "called":
        subject = f"⏰ It's Your Turn! - Token: {token_number}"
        status_message = "Your turn has arrived! Please proceed to the doctor's room."
        icon = "✅"
    elif status == "completed":
        subject = f"✅ Appointment Completed - Token: {token_number}"
        status_message = "Your appointment has been completed. Thank you for using Smart Queue System."
        icon = "🏥"
    else:
        subject = f"❌ Queue Cancelled - Token: {token_number}"
        status_message = "Your queue entry has been cancelled."
        icon = "❌"
    
    msg = MIMEMultipart('related')
    msg['From'] = EMAIL_FROM
    msg['To'] = to_email
    msg['Subject'] = subject
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }}
            .content {{ padding: 30px; }}
            .status-box {{ background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
            .footer {{ background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{icon} Queue Update</h1>
            </div>
            <div class="content">
                <p>Dear <strong>{patient_name}</strong>,</p>
                <p>{status_message}</p>
                
                <div class="status-box">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Token Number</p>
                    <div style="font-size: 32px; font-weight: bold; color: #10b981;">{token_number}</div>
                </div>
                
                <p><strong>👨‍⚕️ Doctor:</strong> Dr. {doctor_name}</p>
    """
    
    if position is not None and status == "called":
        html_body += f"<p><strong>📍 Please proceed to the doctor's room immediately.</strong></p>"
    
    html_body += """
                <p style="color: #6b7280; font-size: 14px;">Thank you for using Smart Queue System!</p>
            </div>
            <div class="footer">
                <p>Smart Queue System - Making Healthcare Accessible</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    msg.attach(MIMEText(html_body, 'html'))
    
    try:
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
        server.sendmail(EMAIL_FROM, to_email, msg.as_string())
        server.quit()
        print(f"Queue update email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
