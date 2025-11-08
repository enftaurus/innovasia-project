import os
import google.generativeai as genai
from fastapi import APIRouter
from models.chat import ChatMessage
router=APIRouter(prefix="/chat",tags=["chat"])
G_API = os.getenv("GOOGLE_API_KEY")
print(G_API)
if G_API:
    genai.configure(api_key=G_API)
    chatmodel = genai.GenerativeModel("gemini-2.5-flash")
    print("✅ Gemini configured for chat")
else:
    chatmodel = None
    print("⚠️ GOOGLE_API_KEY missing — Chat AI disabled")
SENSITIVE_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die", "hurt myself",
    "worthless", "can't go on", "no reason to live", "give up", "end it all",
    "tired of living", "cut myself", "jump off", "hang myself", "die", "death"
]


@router.post("/")
def chat_response(req: ChatMessage):
    user_message = req.message.strip().lower()

    # Safety first: detect harmful intent
    for word in SENSITIVE_KEYWORDS:
        if word in user_message:
            return {
                "reply": (
                    "💛 You're not alone, and your feelings matter deeply. "
                    "Please don’t face this by yourself — help is always available. "
                    "You can contact **AASRA (91-9820466726)** or **Vandrevala Foundation (1860 2662 345)** right now. "
                    "If you’d like, I can also help you book a counselling session safely."
                )
            }

    # If Gemini not configured
    if not chatmodel:
        return {"reply": "Chat service is currently unavailable. Please try again later."}

    # Build AI prompt for Indian college students
    prompt = f"""
    You are a friendly, empathetic AI counselor for Indian college students.
    Respond conversationally in short, natural paragraphs.
    Be culturally aware (Indian context: exams, hostel, family expectations, etc).
    Avoid giving medical advice — just listen, support, and give practical student-friendly tips.
    keep the prompt short and simple dont brag on something 
    Student says: "{req.message}"
    """

    try:
        response = chatmodel.generate_content(prompt)
        if hasattr(response, "text") and response.text:
            reply = response.text.strip()
        elif response.candidates:
            reply = response.candidates[0].content.parts[0].text.strip()
        else:
            reply = "I'm here to listen — tell me a bit more about what’s on your mind."
        print(f"🤖 Chat reply: {reply[:80]}...")
        return {"reply": reply}

    except Exception as e:
        print("❌ Gemini error:", e)
        return {"reply": "Sorry, I’m having trouble connecting to my AI partner right now. Please try again later."}



