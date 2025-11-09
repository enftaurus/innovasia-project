# from models.login import log_cred
# from fastapi import APIRouter, HTTPException, status, Response
# from database import supabase
# import bcrypt

# router = APIRouter(prefix="/login", tags=["sign_in"])

# @router.post("/")
# def validate_login_cred(x: log_cred,response:Response):
#     z = supabase.table("basic_details").select('*').eq("mail", x.mail).execute()
    
#     if not z.data:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="user does not exist try register"
#         )

#     user = z.data[0]
#     stored_hashed_pw = user["password"].encode("utf-8")
    
#     if not bcrypt.checkpw(x.password.encode("utf-8"), stored_hashed_pw):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="incorrect password"
#         )
#     response.set_cookie(
#         key="user_mail",
#         value=x.mail,
#         secure=False,          
#         samesite="lax",        
#         max_age=60*30 
#     )
    
#     return {"message": "login successful"}


from models.login import log_cred
from fastapi import APIRouter, HTTPException, status, Response
from fastapi.responses import JSONResponse
from database import supabase
import bcrypt

router = APIRouter(prefix="/login", tags=["sign_in"])

@router.post("/")
def validate_login_cred(x: log_cred, response: Response):
    # 🔹 Check if user exists
    z = supabase.table("basic_details").select('*').eq("mail", x.mail).execute()
    
    if not z.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="user does not exist try register"
        )

    user = z.data[0]
    stored_hashed_pw = user["password"].encode("utf-8")

    # 🔹 Verify password
    if not bcrypt.checkpw(x.password.encode("utf-8"), stored_hashed_pw):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="incorrect password"
        )

    # 🔹 Set cookie for authentication
    response.set_cookie(
        key="user_mail",
        value=x.mail,
        secure=False,          # for HTTPS use True in production
        samesite="lax",
        max_age=60 * 30,       # 30 minutes
    )

    # ✅ Return a clean JSON response with proper CORS headers
    return JSONResponse(
        status_code=200,
        content={"message": "login successful"},
        headers={"Access-Control-Allow-Credentials": "true"}
    )
