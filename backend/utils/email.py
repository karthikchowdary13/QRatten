import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings

def send_email(to_email: str, subject: str, html_content: str, text_content: str = ""):
    if not settings.EMAIL_USER or not settings.EMAIL_PASSWORD:
        print("Email credentials not configured. Skipping email send.")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM or settings.EMAIL_USER
    msg["To"] = to_email

    # Attach parts into message container.
    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")
    
    msg.attach(part1)
    msg.attach(part2)

    try:
        # Create secure connection with server and send email
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)
        server.ehlo()
        server.starttls()
        server.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
        server.sendmail(msg["From"], to_email, msg.as_string())
        server.quit()
        print(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        return False

def send_verification_email(to_email: str, token: str):
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={token}&email={to_email}"
    
    subject = "Verify your email address for QRatten"
    
    text_content = f"""
    Welcome to QRatten!
    
    Please verify your email address by clicking the link below:
    {verification_link}
    
    This link will expire in 24 hours.
    
    If you did not create an account, no further action is required.
    """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .button {{ 
                display: inline-block; 
                padding: 10px 20px; 
                background-color: #4f46e5; 
                color: #ffffff !important; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
            }}
            .footer {{ margin-top: 30px; font-size: 12px; color: #777; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Welcome to QRatten!</h2>
            <p>Thank you for registering. Please verify your email address to complete your registration and activate your account.</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{verification_link}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="{verification_link}">{verification_link}</a></p>
            <p>This link will expire in 24 hours.</p>
            <div class="footer">
                <p>If you did not create an account, no further action is required.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_content, text_content)

def send_welcome_email(to_email: str):
    subject = "Welcome to QRatten!"
    
    text_content = f"""
    Your email has been successfully verified!
    
    You can now log in to your QRatten account at:
    {settings.FRONTEND_URL}/login
    """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .button {{ 
                display: inline-block; 
                padding: 10px 20px; 
                background-color: #4f46e5; 
                color: #ffffff !important; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Email Verified Successfully!</h2>
            <p>Your email has been verified and your QRatten account is now fully active.</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{settings.FRONTEND_URL}/login" class="button">Log In Now</a>
            </p>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_content, text_content)

def send_admin_approval_email(user_data, token: str):
    admin_email = "karthikethamukkala4@gmail.com"
    approval_link = f"{settings.FRONTEND_URL}/api/admin/approve-user?token={token}"
    
    subject = f"New User Registration Request: {user_data.name}"
    
    text_content = f"""
    A new user has registered and is pending approval:
    
    Name: {user_data.name}
    Email: {user_data.email}
    Role: {user_data.role}
    Mobile: {user_data.mobileNumber}
    
    Click here to approve this user:
    {approval_link}
    """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .button {{ 
                display: inline-block; 
                padding: 10px 20px; 
                background-color: #10b981; 
                color: #ffffff !important; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
            }}
            .details {{ background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>New User Registration Request</h2>
            <p>A new user has registered and is pending your approval.</p>
            <div class="details">
                <p><strong>Name:</strong> {user_data.name}</p>
                <p><strong>Email:</strong> {user_data.email}</p>
                <p><strong>Role:</strong> {user_data.role}</p>
                <p><strong>Mobile:</strong> {user_data.mobileNumber}</p>
            </div>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{approval_link}" class="button">Approve User</a>
            </p>
            <p><small>Note: Approving this user will instantly generate an account for them with the default password and send them a welcome email.</small></p>
        </div>
    </body>
    </html>
    """
    
    return send_email(admin_email, subject, html_content, text_content)

def send_user_approved_email(to_email: str):
    subject = "Your QRatten Account has been Approved!"
    
    text_content = f"""
    Welcome to QRatten!
    
    Your account has been approved by the administrator. 
    
    Your temporary password is: qratten@2026
    
    You can log in to your account at:
    {settings.FRONTEND_URL}/login
    
    Please change your password after logging in.
    """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .button {{ 
                display: inline-block; 
                padding: 10px 20px; 
                background-color: #4f46e5; 
                color: #ffffff !important; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
            }}
            .pass-box {{ background: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; font-size: 18px; font-weight: bold; letter-spacing: 1px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Welcome to QRatten!</h2>
            <p>Your account has been <strong>approved</strong> by the administrator.</p>
            <p>We have generated a secure temporary password for you:</p>
            <div class="pass-box">qratten@2026</div>
            <p>We strongly recommend you change this password from your account settings after logging in.</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{settings.FRONTEND_URL}/login" class="button">Log In Now</a>
            </p>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_content, text_content)


def send_registration_confirmation_email(to_email: str, name: str):
    subject = "We've received your registration"
    
    text_content = f"Hi {name},\n\nThank you for registering for QRatten! Your request has been forwarded to your institution's admin for review.\n\nYou will be notified by email once a decision is made.\n\nRegards,\nQRatten Team"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #5A67D8; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Registration Received</h2>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>Thank you for registering for QRatten! Your request has been forwarded to your institution's administrator for review.</p>
                <p>We will notify you by email as soon as a decision is made.</p>
                <br>
                <p>Best regards,<br>The QRatten Team</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_content, text_content)

def send_admin_approval_request_email(admin_email: str, user_id: int, name: str, email: str, role: str, token: str):
    subject = "New registration request awaiting your approval"
    
    approve_link = f"{settings.API_URL}/admin/approve-user/{user_id}?token={token}"
    reject_link = f"{settings.API_URL}/admin/reject-user/{user_id}?token={token}"
    
    text_content = f"Hello Admin,\n\nA new user has requested to join QRatten.\n\nName: {name}\nEmail: {email}\nRole: {role}\n\nPlease visit the dashboard or click the links below to approve or reject this request.\n\nApprove: {approve_link}\nReject: {reject_link}\n\nRegards,\nQRatten System"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #5A67D8; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }}
            .info-box {{ background-color: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; margin: 15px 0; }}
            .button-group {{ display: flex; gap: 10px; margin-top: 20px; justify-content: center; }}
            .btn {{ display: inline-block; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center; color: white; }}
            .btn-approve {{ background-color: #10B981; }}
            .btn-reject {{ background-color: #EF4444; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>New Registration Request</h2>
            </div>
            <div class="content">
                <p>Hello Administrator,</p>
                <p>A new user has requested to join QRatten and requires your approval.</p>
                <div class="info-box">
                    <p><strong>Name:</strong> {name}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Role:</strong> {role}</p>
                </div>
                <div class="button-group">
                    <a href="{approve_link}" class="btn btn-approve">Approve Request</a>
                    <a href="{reject_link}" class="btn btn-reject">Reject Request</a>
                </div>
                <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">These links are single-use and will securely update the user's status.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(admin_email, subject, html_content, text_content)

def send_approval_outcome_email(to_email: str, name: str, outcome: str):
    if outcome.lower() == 'approved':
        subject = "Your QRatten account has been approved!"
        status_color = "#10B981"
        message_body = "Great news! Your registration has been approved by the administrator. Your account is now active and you can log in."
        action_html = f'<p style="text-align: center;"><a href="{settings.FRONTEND_URL}/login" class="btn" style="background-color: #5A67D8;">Log In Now</a></p>'
        action_text = f"Log In Now: {settings.FRONTEND_URL}/login"
    else:
        subject = "Update regarding your QRatten registration"
        status_color = "#6B7280"
        message_body = "Thank you for your interest in QRatten. Unfortunately, your registration request was not approved at this time. If you believe this is a mistake, please contact your institution's administrator."
        action_html = ""
        action_text = ""
        
    text_content = f"Hi {name},\n\n{message_body}\n\n{action_text}\n\nRegards,\nQRatten Team"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: {status_color}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }}
            .btn {{ display: inline-block; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; color: white; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Registration Update</h2>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>{message_body}</p>
                {action_html}
                <br>
                <p>Best regards,<br>The QRatten Team</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_content, text_content)
