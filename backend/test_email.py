import smtplib
from email.mime.text import MIMEText
import getpass

def test_google_app_password():
    print("=== Google App Password Tester ===")
    print("This script will test if your Google App Password is correct and working.")
    
    email_user = input("Enter your Gmail address (e.g. karthikethamukkala4@gmail.com): ").strip()
    email_password = getpass.getpass("Enter your 16-letter Google App Password (no spaces): ").strip()
    to_email = input("Enter the email address to send a test message to: ").strip()
    
    # Remove any accidental spaces in the password
    email_password = email_password.replace(" ", "")
    
    msg = MIMEText("If you are reading this, your Google App Password works perfectly!")
    msg["Subject"] = "QRatten Test Email"
    msg["From"] = email_user
    msg["To"] = to_email

    print("\nAttempting to log in to Gmail and send email...")
    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(email_user, email_password)
        server.sendmail(email_user, to_email, msg.as_string())
        server.quit()
        print("\n✅ SUCCESS! The email was sent successfully.")
        print("This means your App Password is 100% CORRECT.")
        print("If it works here but not on Render, it means your Render Environment Variables are misspelled or didn't save.")
    except smtplib.SMTPAuthenticationError:
        print("\n❌ AUTHENTICATION FAILED!")
        print("Google rejected your password. This means your App Password is INVALID or REVOKED.")
        print("You must go to your Google Account and generate a brand new one.")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    test_google_app_password()
