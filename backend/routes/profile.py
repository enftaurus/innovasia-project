from fastapi import APIRouter, HTTPException
from database import supabase

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/{email}")
def get_profile(email: str):
    try:
        res = supabase.table("basic_details").select("*").eq("mail", email).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        profile = res.data[0]
        # 🚫 remove password before sending
        if "password" in profile:
            del profile["password"]

        return profile

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")
