from fastapi import APIRouter, HTTPException, status
from models.register import cred, otp_entered
from database import supabase
import smtplib
from email.mime.text import MIMEText
import os
import random
import bcrypt

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_PORT = int(os.getenv("MAIL_PORT", 587))

data = {}

def send_email(to_email: str, subject: str, body: str):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = MAIL_FROM
    msg["To"] = to_email

    with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.send_message(msg)
        print("✅ Email sent successfully!")


router = APIRouter(prefix="/register", tags=["sign_up"])

@router.post("/")
def sign_up(details: cred):
    data = details.model_dump()
    data['dob'] = str(data['dob'])
    hashed_pw = bcrypt.hashpw(details.password.encode("utf-8"), bcrypt.gensalt())
    data["password"] = hashed_pw.decode("utf-8")

    existing = supabase.table("basic_details").select('*').eq("mail", details.mail).execute()
    if existing.data:
        existing_user = existing.data[0]['name']
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"user already exists linked to this mail with name {existing_user}"
        )

    otp = random.randint(100000, 999999)
    try:
        supabase.table("otp_table").insert({"email": details.mail, "otp": otp}).execute()
        message = f"""\
Subject: Your Student Sanctuary Verification Code

Hi {details.name},

Your One-Time Password (OTP) for completing your registration with Student Sanctuary is: **{otp}**

Please enter this code within the next 5 minutes to verify your account.

Thank you for choosing Student Sanctuary 🌿  
Empowering every student, one step at a time.

Warm regards,  
Team Student Sanctuary
"""
        send_email(details.mail, "OTP for login", message)
        supabase.table("basic_details_copy").insert(data).execute()
        return {"message": "otp sent successfully"}
    except Exception as e:
        print("❌ Error sending OTP or inserting data:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP try after some time : {str(e)}"
        )

####========================================================================
@router.post("/validate")
def validate_otp(x: otp_entered):
    auth = supabase.table("otp_table").select('*').eq('email', x.mail).execute()

    if not auth.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No OTP found for this email. Please register again."
        )

    y = auth.data[0]['otp']
    if y != x.otp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="otp incorrect"
        )

    try:
        z = supabase.table("basic_details_copy").select('*').eq('mail', x.mail).execute()
        record = z.data[0]
        if "id" in record:
            del record["id"]
        supabase.table("basic_details").insert(record).execute()
        supabase.table('otp_table').delete().eq('email', x.mail).execute()
        supabase.table("basic_details_copy").delete().eq('mail', x.mail).execute()
        return {"message": "user registered successfully now you can login"}
    except Exception as e:
        print("❌ Error in OTP validation:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error during validation: {str(e)}"
        )
