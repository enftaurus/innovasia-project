from pydantic import BaseModel,EmailStr
from datetime import date
class basic(BaseModel):
    name:str
    mail:EmailStr
    phone:str
    counsellor_id:str
    counsellor_name:str
    counsellor_mail:EmailStr
    date:date
    focus_goals:list
    work_problem:str
    slot:str
    consent:bool

