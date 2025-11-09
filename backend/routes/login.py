from models.login import log_cred
from fastapi import APIRouter, HTTPException, status, Response
from database import supabase
import bcrypt

router = APIRouter(prefix="/login", tags=["sign_in"])

@router.post("/")
def validate_login_cred(x: log_cred, response: Response):
    """Authenticate user and set cookie session."""

    # 🔍 Check user existence
    z = supabase.table("basic_details").select("*").eq("mail", x.mail).execute()
    if not z.data:
        raise HTTPException(status_code=404, detail="user does not exist try register")

    user = z.data[0]
    stored_hashed_pw = user["password"].encode("utf-8")

    # 🔑 Validate password
    if not bcrypt.checkpw(x.password.encode("utf-8"), stored_hashed_pw):
        raise HTTPException(status_code=401, detail="incorrect password")

    # 🍪 Set cookie for session
    response.set_cookie(
        key="user_mail",
        value=x.mail,
        httponly=True,     # ✅ Protects cookie from JS access
        secure=False,      # ✅ Set to True in production (HTTPS)
        samesite="lax",
        max_age=60 * 30    # ✅ 30-minute session
    )

    print(f"✅ Cookie set for {x.mail}")

    # ✅ Return JSON response
    return {
        "status": "success",
        "message": "login successful",
        "user": {"mail": x.mail}
    }
