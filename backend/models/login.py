from pydantic import BaseModel,EmailStr
class log_cred(BaseModel):
    mail:EmailStr
    password:str
