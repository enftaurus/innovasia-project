from fastapi import APIRouter, HTTPException, Response
from models.login import log_cred
from database import supabase

router = APIRouter(prefix="/counsellor/login", tags=["counsellor_login"])

@router.post("/")
def verify(x: log_cred):
    try:
        z = supabase.table("counsellor_details").select("*").eq("mail", x.mail).execute()
        if not z.data:
            raise HTTPException(status_code=404, detail="invalid credentials")
        user = z.data[0]
        if x.password != user["password"]:
            raise HTTPException(status_code=401, detail="invalid credentials")
        resp = Response(content='{"message":"login successful"}', media_type="application/json")
        resp.set_cookie(
            key="user_mail",
            value=x.mail,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=60 * 30
        )
        return resp
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"login failed {str(e)}")
