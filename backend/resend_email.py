import requests
import json

def resend_verification():
    print("=== Resend Verification Trigger ===")
    
    email = input("Enter the email address you want to verify (e.g. 2320030408cse@gmail.com): ").strip()
    
    url = "https://qratten-backend.onrender.com/auth/resend-verification"
    payload = {"email": email}
    headers = {"Content-Type": "application/json"}
    
    print(f"\nContacting your Render server to send an email to {email}...")
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            print("\n✅ SUCCESS: The server accepted the request!")
            print("Please check your email inbox (and Spam folder) now.")
            print("If you still don't get the email, it means your Render Environment Variables for EMAIL_PASSWORD are still wrong!")
        else:
            print(f"\n❌ ERROR from server: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"\n❌ Failed to connect to server: {e}")

if __name__ == "__main__":
    resend_verification()
