from fastapi import APIRouter, HTTPException, Response

router = APIRouter(prefix="/logout", tags=["logout"])

@router.post("/")
def logout(response: Response):
    try:
        # ✅ delete the login cookie
        response.delete_cookie("user_mail")
        return {"message": "Logged out successfully!"}

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="Not logged in or error while logging out."
        )
