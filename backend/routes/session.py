# routes/session.py
from fastapi import APIRouter, Request, HTTPException, status

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me")
def me(request: Request):
    mail = request.cookies.get("user_mail")  # server can read HttpOnly
    if not mail:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not logged in")
    # return any extra user info you want
    return {"email": mail, "displayName": mail.split("@")[0]}
