from fastapi import APIRouter, HTTPException, Request
from database import supabase
router=APIRouter(prefix="/profile",tags=["profile"])
@router.get("/")
def viewprofile(request:Request):
    mail=request.cookies.get("user_mail")
    if not mail:
        raise HTTPException(status_code=401,detail="please login to view ")
    z=supabase.table('basic_details').select('*').eq('mail',mail).execute()
    if not z.data:
        raise HTTPException(status_code=404,detail="profile not found")
    user=z.data[0]
    if "password" in user:
        del user["password"]
    if "created_at" in user:
        del user['created_at']
    return {"profile":user}
