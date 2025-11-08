from pydantic import BaseModel, EmailStr, StringConstraints
from typing_extensions import Annotated
from datetime import date
from enum import Enum


class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "prefer_not_to_say"



class cred(BaseModel):
    name: str
    dob: date
    gender: Gender
    age: int
    mail: EmailStr
    place: str
    phone: str
    education: str
    institution: str
    password: str


class otp_entered(BaseModel):
    mail: EmailStr
    otp: int
