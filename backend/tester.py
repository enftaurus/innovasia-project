import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

# Load credentials from .env
load_dotenv()

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_PORT = int(os.getenv("MAIL_PORT", 587))

# Function to send email
def send_email(to_email: str, subject: str, body: str):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = MAIL_FROM
    msg["To"] = to_email

    # Connect to SMTP server
    with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
        server.starttls()  # Secure the connection
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.send_message(msg)
        print("✅ Email sent successfully!")

# Test it
send_email("boothpurrukwithreddy@gmail.com", "Hello Rukwith!", "This is a test email sent using SMTP 😎 thanks for using student sanctuary")
