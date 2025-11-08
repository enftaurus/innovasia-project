from fastapi import APIRouter
from models.register import cred,otp_entered
from database import supabase
import smtplib
from email.mime.text import MIMEText
import os
import random
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
data={}
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


router=APIRouter(prefix="/register",tags=["sign_up"])
@router.post("/")
def sign_up(details:cred):
    
    data=details.model_dump()
    data['dob']=str(data['dob'])

    existing=supabase.table("basic_details").select('*').eq("mail",details.mail).execute()
    if existing.data:
        existing_user=existing.data[0]['name']
        return{f"user already exists linked to this mail with name{existing_user}"}
    otp=random.randint(100000,999999)
    supabase.table("otp_table").insert({"email":details.mail,"otp":otp}).execute()
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
    send_email(details.mail,"OTP for login",message)
    supabase.table("basic_details_copy").insert(data).execute()
    return{"message":"otp sent succesfully" }



####========================================================================
@router.post("/validate")
def validate_otp(x:otp_entered):
    auth=supabase.table("otp_table").select('*').eq('email',x.mail).execute()
    y=auth.data[0]['otp']
    if(y==x.otp):
        z=supabase.table("basic_details_copy").select('*').eq('mail',x.mail).execute()
        record = z.data[0]
        if "id" in record:
            del record["id"]
        supabase.table("basic_details").insert(record).execute()
        supabase.table('otp_table').delete().eq('email',x.mail).execute()
        supabase.table("basic_details_copy").delete().eq('mail',x.mail).execute()
    else:
        return{"message":"otp incorrect"}
    return{"message":"user registered succesfully"}
        

   