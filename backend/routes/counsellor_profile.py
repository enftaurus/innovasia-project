from fastapi import APIRouter,HTTPException,Request
from database import supabase 
router=APIRouter(prefix="/cpunsellor_profile",tags=["counsellor_profile"])
@router.get("/")
def viewprof(request: Request):
    mail = request.cookies.get("user_mail")
    print("Cookie value:", mail)

    result = supabase.table("counsellor_details").select("*").eq("mail", mail).execute()
    #print("🧩 Supabase result:", result.data)

    if not mail:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if not result.data:
        raise HTTPException(status_code=404, detail=f"No counsellor found with mail: {mail}")

    profile = result.data[0]
    profile.pop("password", None)
    profile.pop("created_at", None)
    profile.pop("updated_at", None)

    return {"details": profile}
