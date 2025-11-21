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
    print(f"Profile endpoint - Cookie value: {mail}")
    print(f"All cookies: {request.cookies}")
    
    if not mail:
        print("No mail found in cookies")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please log in to view your profile"
        )

    # 🔍 Fetch the profile from Supabase
    try:
        result = supabase.table("basic_details").select("*").eq("mail", mail).limit(1).execute()
        if not result.data:
            print(f"No profile found for mail: {mail}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

        user = _strip_sensitive(result.data[0])
        print(f"Profile found for: {mail}")
        return {"profile": user}
    except Exception as e:
        print(f"Error fetching profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching profile: {str(e)}"
        )
