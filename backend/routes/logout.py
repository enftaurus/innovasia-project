from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/logout", tags=["logout"])

@router.post("/")
def logout():
    # Build the response you'll return
    resp = JSONResponse(
        status_code=200,
        content={"status": "success", "message": "Logged out successfully"},
    )

    # IMPORTANT: delete cookie on the SAME response
    resp.delete_cookie(
        key="user_mail",
        path="/",          # must match how it was set
        # domain="localhost",   # include ONLY if you set it originally
        httponly=True,
        samesite="lax",
        secure=False       # True in prod (HTTPS)
    )
    return resp
