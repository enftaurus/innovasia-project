from fastapi import APIRouter,Request,HTTPException
from fastapi.responses import JSONResponse
router=APIRouter(prefix="/counsellor/logout",tags=["counsellor_logout"])
@router.post("/")
def logout():
    resp=JSONResponse(
        status_code=200,
        content={"status": "success", "message": "Logged out successfully"},
    )
    resp.delete_cookie(
        key="user_mail",
        path="/",          # must match how it was set
        # domain="localhost",   # include ONLY if you set it originally
        httponly=True,
        samesite="lax",
        secure=False
    )
    return resp
