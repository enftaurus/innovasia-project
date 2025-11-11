from fastapi import APIRouter,HTTPException,Request
from database import supabase
from datetime import date
from pydantic import EmailStr
router=APIRouter(prefix="/counsellor/dasboard",tags=["counsellor_dashboard"]) 
@router.get("/")
def display(request:Request):
    x=request.cookies.get("user_mail")
    if not x:
        raise HTTPException(status_code=401,detail="please log in ")
    a=date.today()
    z=supabase.table("appointments").select('*').eq("counsellor_mail",x).eq("appointment_date",a).execute()
    if not z.data:
        raise HTTPException(status_code=404, detail="no appointments scheduled today ")
    data = []
    for record in z.data:
        data.append({
            "student_name": record.get("student_name"),
            "student_mail": record.get("student_mail"),
            "student_phone": record.get("student_phone"),
            "time": record.get("appointment_time")
        })

    return {"appointments": data}


SAFE_FIELDS = {
    "mail", "name", "age", "gender", "dob",
    "place", "phone", "education", "institution"
}


def _strip_sensitive(user: dict) -> dict:
    """Return only safe fields, remove password, timestamps, or unknown fields."""
    return {k: v for k, v in user.items() if k in SAFE_FIELDS}



@router.get("/{mail}")
def student_details(mail:EmailStr):
    z=supabase.table("appointments").select('*').eq('student_mail',mail).execute()
    if not z.data:
        raise HTTPException(status_code=404,detail="details not found ")
    y=z.data[0]
    a=supabase.table("basic_details").select('*').eq('mail',mail).execute()
    if not a.data:
        raise HTTPException(status_code=404,detail="data not found")
    x=_strip_sensitive(a.data[0])
    if(y['consent']):
        c=supabase.table("mental_health").select('*').eq('mail',mail).execute()
        if not c.data:
            raise HTTPException(status_code=404,detail="mental health data not found ")
        b=c.data[0]
        b.pop("created_at",None)
        b.pop("id",None)
        b.pop("mail",None)
    x.update(b)
    return{"student details":x}
            


