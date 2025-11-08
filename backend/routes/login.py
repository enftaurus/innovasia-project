from models.login import log_cred
from fastapi import APIRouter
from database import supabase

router=APIRouter(prefix="/login",tags=["sign_in"])
@router.post("/")
def validate_login_cred(x:log_cred):
    z=supabase.table("basic_details").select('*').eq("mail",x.mail).execute()
    if not z.data:
        return{"message":"user does not exist try register"}
    else:
        if(z.data[0]['password']==x.password):
          return{"message":"login succesfull"}
        else:
            return{"message":"incorrect password"}
        