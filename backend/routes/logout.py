# from fastapi import APIRouter, HTTPException, Response

# router = APIRouter(prefix="/logout", tags=["logout"])

# @router.post("/")
# def logout(response: Response):
#     try:
#         # ✅ delete the login cookie
#         response.delete_cookie("user_mail")
#         return {"message": "Logged out successfully!"}

#     except Exception as e:
#         raise HTTPException(
#             status_code=401,
#             detail="Not logged in or error while logging out."
#         )


from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/logout", tags=["logout"])

@router.post("/")
def logout(response: Response):
    try:
        # ✅ Explicitly delete the authentication cookie
        response.delete_cookie(
            key="user_mail",
            samesite="lax",
            secure=False  # 🔹 Set True in production (HTTPS)
        )

        # ✅ Return JSONResponse to ensure proper CORS headers
        return JSONResponse(
            status_code=200,
            content={"message": "Logged out successfully!"},
            headers={"Access-Control-Allow-Credentials": "true"}
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during logout: {str(e)}"
        )
