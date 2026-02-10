def send_notification(user_email: str ,message: str):
    """
    Mock notification service.
    Later ths can be replaced with WhatsApp /SMS/Email.
    """
    print(f"[NOTFICATION] To :{user_email} | Message:{message}")