from fastapi import APIRouter, HTTPException, Request, status
from database import supabase

router = APIRouter(prefix="/profile", tags=["profile"])

# ✅ Define only the fields that actually exist in your 'basic_details' table
SAFE_FIELDS = {
    "mail", "name", "age", "gender", "dob",
    "place", "phone", "education", "institution"
}

def _strip_sensitive(user: dict) -> dict:
    """Return only safe fields, remove password, timestamps, or unknown fields."""
    return {k: v for k, v in user.items() if k in SAFE_FIELDS}

@router.get("/", summary="View logged-in user's profile")
def view_profile(request: Request):
    """
    Fetch the current user's profile using their cookie (user_mail).
    """
    mail = request.cookies.get("user_mail")
    if not mail:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please log in to view your profile"
        )

    # 🔍 Fetch the profile from Supabase
    result = supabase.table("basic_details").select("*").eq("mail", mail).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    user = _strip_sensitive(result.data[0])
    return {"profile": user}
