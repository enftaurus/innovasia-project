from fastapi import APIRouter, HTTPException, Request, status
from models.appointments import basic
from database import supabase
import smtplib
from email.mime.text import MIMEText
import os
from datetime import date

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_PORT = int(os.getenv("MAIL_PORT", 587))

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("/counsellors")
def get_counsellors():
    """Get list of available counsellors."""
    try:
        result = supabase.table("counsellor_details").select("*").execute()
        if result.data:
            return {"counsellors": result.data}
        # Fallback to hardcoded list if database is empty
        return {
            "counsellors": [
                {"id": "cns-elena", "name": "AKASH", "mail": "akash@example.com", "specialization": ["Anxiety", "Sleep", "Study Stress"], "credentials": "M.Sc, RCI", "img": "https://sdbeqzvabcggpkmicvlk.supabase.co/storage/v1/object/public/counsellor%20pics/prem.jpeg"},
                {"id": "cns-faisal", "name": "DHANUSH", "mail": "dhanush@example.com", "specialization": ["Depression", "Motivation", "Panic"], "credentials": "Ph.D., Clinical Psych.", "img": "https://sdbeqzvabcggpkmicvlk.supabase.co/storage/v1/object/public/counsellor%20pics/dhanush.jpeg"},
                {"id": "cns-nat", "name": "PREM", "mail": "prem@example.com", "specialization": ["Relationships", "Time Management", "Study Stress"], "credentials": "M.Phil, CBT", "img": "https://sdbeqzvabcggpkmicvlk.supabase.co/storage/v1/object/public/counsellor%20pics/akash.jpeg"},
            ]
        }
    except Exception as e:
        # Return hardcoded list on error
        return {
            "counsellors": [
                {"id": "cns-elena", "name": "AKASH", "mail": "akash@example.com", "specialization": ["Anxiety", "Sleep", "Study Stress"], "credentials": "M.Sc, RCI", "img": "https://sdbeqzvabcggpkmicvlk.supabase.co/storage/v1/object/public/counsellor%20pics/prem.jpeg"},
                {"id": "cns-faisal", "name": "DHANUSH", "mail": "dhanush@example.com", "specialization": ["Depression", "Motivation", "Panic"], "credentials": "Ph.D., Clinical Psych.", "img": "https://sdbeqzvabcggpkmicvlk.supabase.co/storage/v1/object/public/counsellor%20pics/dhanush.jpeg"},
                {"id": "cns-nat", "name": "PREM", "mail": "prem@example.com", "specialization": ["Relationships", "Time Management", "Study Stress"], "credentials": "M.Phil, CBT", "img": "https://sdbeqzvabcggpkmicvlk.supabase.co/storage/v1/object/public/counsellor%20pics/akash.jpeg"},
            ]
        }


def send_email(to_email: str, subject: str, body: str):
    msg = MIMEText(body, "plain")
    msg["Subject"] = subject
    msg["From"] = MAIL_FROM
    msg["To"] = to_email

    try:
        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.send_message(msg)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send email."
        )


@router.get("/slots/{id}/{date}")
def display_slots(id: str, date: date):
    date_val = str(date)
    counsellor_id = id  # Use the ID as-is (could be UUID string or integer)
    
    # Try to read from DB first
    z = (
        supabase.table("slots")
        .select("*")
        .eq("date", date_val)
        .eq("counsellor_id", counsellor_id)
        .execute()
    )

    # If not found (z.data is empty), create a new entry with all slots set to True
    if not z.data:
        print(f"Creating new slots entry for counsellor_id={counsellor_id}, date={date_val}")
        try:
            # Try to insert with the ID as-is (could be string UUID or integer)
            insert_result = supabase.table("slots").insert({
                "counsellor_id": counsellor_id,
                "date": date_val,
                "slot1": True,
                "slot2": True,
                "slot3": True,
                "slot4": True,
                "slot5": True
            }).execute()
            print(f"Insert result: {insert_result.data}")
            
            # Read again after insert
            z = (
                supabase.table("slots")
                .select("*")
                .eq("date", date_val)
                .eq("counsellor_id", counsellor_id)
                .execute()
            )
        except Exception as e:
            print(f"Error creating slots: {str(e)}")
            # If insert failed due to type mismatch, try converting to int
            try:
                counsellor_id_int = int(counsellor_id)
                insert_result = supabase.table("slots").insert({
                    "counsellor_id": counsellor_id_int,
                    "date": date_val,
                    "slot1": True,
                    "slot2": True,
                    "slot3": True,
                    "slot4": True,
                    "slot5": True
                }).execute()
                z = (
                    supabase.table("slots")
                    .select("*")
                    .eq("date", date_val)
                    .eq("counsellor_id", counsellor_id_int)
                    .execute()
                )
            except (ValueError, Exception) as e2:
                raise HTTPException(status_code=500, detail=f"Failed to create slots: {str(e2)}")

    if not z.data:
        raise HTTPException(status_code=500, detail="Slot creation failed - no data returned")

    row = z.data[0]
    print(f"Retrieved slots row: {row}")

    # Return all slots as True (available) if they exist, otherwise default to True
    available = {
        "slot1": row.get("slot1", True) if row.get("slot1") is not None else True,
        "slot2": row.get("slot2", True) if row.get("slot2") is not None else True,
        "slot3": row.get("slot3", True) if row.get("slot3") is not None else True,
        "slot4": row.get("slot4", True) if row.get("slot4") is not None else True,
        "slot5": row.get("slot5", True) if row.get("slot5") is not None else True
    }

    return {"counsellor_id": counsellor_id, "date": date_val, "available_slots": available}
@router.post("/book")
def book(details: basic, request: Request):

    student_email = request.cookies.get("user_mail")
    if not student_email:
        raise HTTPException(status_code=401, detail="User not logged in")

    allowed_slots = {"slot1", "slot2", "slot3", "slot4", "slot5"}
    slot_column = details.slot
    if slot_column not in allowed_slots:
        raise HTTPException(status_code=400, detail="Invalid slot")

    counsellor_id = details.counsellor_id  # Use as-is (could be UUID string or integer)
    date_val = str(details.date)

    fetch = (
        supabase.table("slots")
        .select("*")
        .eq("counsellor_id", counsellor_id)
        .eq("date", date_val)
        .execute()
    )
    
    # If not found, try with integer conversion
    if not fetch.data:
        try:
            counsellor_id_int = int(counsellor_id)
            fetch = (
                supabase.table("slots")
                .select("*")
                .eq("counsellor_id", counsellor_id_int)
                .eq("date", date_val)
                .execute()
            )
            counsellor_id = counsellor_id_int
        except ValueError:
            pass  # Keep original counsellor_id if conversion fails

    if not fetch.data:
        raise HTTPException(status_code=404, detail="Slots not found")

    row = fetch.data[0]

    if not row.get(slot_column, False):
        raise HTTPException(status_code=409, detail="Slot already booked")

    supabase.table("slots") \
        .update({slot_column: False}) \
        .eq("counsellor_id", counsellor_id) \
        .eq("date", date_val) \
        .execute()

    assessment_data = None
    if details.consent:
        res = supabase.table("mental_health").select("*").eq("mail", student_email).execute()
        assessment_data = res.data[0] if res.data else None
    bd=supabase.table("basic_details").select('*').eq("mail",student_email).execute()
    send_to_coun=""
    coun=bd.data[0] if bd.data else None
    assessment_block = ""
    if coun:
        send_to_coun="\n\n student basic details: \n"
        for k,v in coun.items():
            if k not in ("mail","password","id","phone","created_at","password"):
                send_to_coun+=f" - {k}:{v}\n"
    if details.consent and assessment_data:
        assessment_block = "\n\nMental Health Assessment Data:\n"
        for k, v in assessment_data.items():
            if k not in ("created_at","id","mail"):  # Skip email as it's already in the main body
                assessment_block += f"- {k}: {v}\n"

    body1 = f"""
Hello {details.counsellor_name},

You have received a new appointment request.

{send_to_coun}
Email: {student_email}

Date: {date_val}
Slot: {slot_column}
Focus Goals: {details.focus_goals}
Work Problem: {details.work_problem}
{assessment_block} 

"""

    body2 = f"""
Hello {details.name},

Your appointment has been successfully booked.

Counsellor: {details.counsellor_name}
Date: {date_val}
Slot: {slot_column}

These are your submitted details:

Name: {details.name}
Phone: {details.phone}
Focus Goals: {details.focus_goals}
Work Problem: {details.work_problem}

We will notify you before the session.
"""

    try:
        send_email(details.counsellor_mail, "New Appointment Booking", body1)
        send_email(student_email, "Your Appointment Confirmation", body2)
    except HTTPException:
        supabase.table("slots") \
            .update({slot_column: True}) \
            .eq("counsellor_id", counsellor_id) \
            .eq("date", date_val) \
            .execute()
        raise

    return {"message": "Appointment booked and emails sent", "counsellor_id": counsellor_id, "date": date_val, "slot": slot_column}
