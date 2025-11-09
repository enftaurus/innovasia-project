from fastapi import APIRouter, HTTPException, status
from models.register import cred, otp_entered
from database import supabase
import smtplib
from email.mime.text import MIMEText
import os
import random
import bcrypt
from datetime import datetime, timedelta

# ============================================================
# Email Configuration
# ============================================================
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_PORT = int(os.getenv("MAIL_PORT", 587))

router = APIRouter(prefix="/register", tags=["sign_up"])


# ============================================================
# Helper: Send Email via SMTP
# ============================================================
def send_email(to_email: str, subject: str, body: str):
    """Send an email using SMTP."""
    msg = MIMEText(body, "plain")
    msg["Subject"] = subject
    msg["From"] = MAIL_FROM
    msg["To"] = to_email

    try:
        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.send_message(msg)
        print(f"✅ Email sent successfully to {to_email}")
    except Exception as e:
        print(f"❌ Email sending failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP email. Please try again later."
        )


# ============================================================
# Route: Sign Up → Send OTP
# ============================================================
@router.post("/")
def sign_up(details: cred):
    """Registers a new user and sends OTP for verification."""

    data = details.model_dump()
    data["dob"] = str(data["dob"])  # ensure DOB is a string

    # ✅ Validate and sanitize phone number
    phone = str(data.get("phone", "")).strip()
    if not phone.isdigit() or len(phone) != 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number. Must be exactly 10 digits."
        )
    data["phone"] = phone

    # ✅ Hash password securely
    hashed_pw = bcrypt.hashpw(details.password.encode("utf-8"), bcrypt.gensalt())
    data["password"] = hashed_pw.decode("utf-8")

    # ✅ Check if user already exists
    existing = supabase.table("basic_details").select("*").eq("mail", details.mail).execute()
    if existing.data:
        existing_user = existing.data[0]["name"]
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User already exists with this email (Name: {existing_user})"
        )

    # ✅ Generate OTP
    otp = random.randint(100000, 999999)

    # ✅ Prepare and send email
    message = f"""
Hi {details.name},

Your One-Time Password (OTP) for completing your registration with Student Sanctuary is: {otp}

Please enter this code to verify your account.

Thank you for choosing Student Sanctuary 🌿  
Empowering every student, one step at a time.

Warm regards,  
Team Student Sanctuary
"""
    send_email(details.mail, "OTP for Verification - Student Sanctuary", message)

    try:
        # ✅ Save OTP and temporary user record
        supabase.table("otp_table").upsert({
            "email": details.mail,
            "otp": otp
        }).execute()

        supabase.table("basic_details_copy").insert(data).execute()

        print(f"✅ OTP {otp} generated for {details.mail}")
        return {"message": "OTP sent successfully"}

    except Exception as e:
        print("❌ Error inserting OTP or user data:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error during registration: {str(e)}"
        )


# ============================================================
# Route: Validate OTP and Finalize Registration
# ============================================================
@router.post("/validate")
def validate_otp(x: otp_entered):
    """Validates OTP and transfers user from temp to main table."""

    # ✅ Fetch OTP record
    auth = supabase.table("otp_table").select("*").eq("email", x.mail).execute()
    if not auth.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No OTP found for this email. Please register again."
        )

    otp_record = auth.data[0]

    # ❌ Removed expiry check (OTP never expires now)

    # ✅ Verify OTP
    if otp_record["otp"] != x.otp:
        raise HTTPException(status_code=401, detail="Incorrect OTP. Please try again.")

    try:
        # ✅ Get user record from temp table
        z = supabase.table("basic_details_copy").select("*").eq("mail", x.mail).execute()
        if not z.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Temporary user record not found. Please register again."
            )

        record = z.data[0]
        record.pop("id", None)  # remove temp ID if any

        # ✅ Insert into main table
        supabase.table("basic_details").insert(record).execute()

        # ✅ Cleanup
        supabase.table("otp_table").delete().eq("email", x.mail).execute()
        supabase.table("basic_details_copy").delete().eq("mail", x.mail).execute()

        print(f"✅ User verified and registered: {x.mail}")
        return {"message": "User registered successfully. You can now log in."}

    except Exception as e:
        print("❌ Error during OTP validation:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error during validation: {str(e)}"
        )
