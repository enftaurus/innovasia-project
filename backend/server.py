from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import os
from dotenv import load_dotenv
import google.generativeai as genai

# ======================================================
# ✅ 1. SETUP
# ======================================================

load_dotenv()

app = FastAPI(title="Student Sanctuary Backend", version="5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for now
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML Model
try:
    model = joblib.load("model.pkl")
    print("✅ Model loaded successfully")
except Exception as e:
    print("⚠️ Model load failed:", e)
    model = None

# Gemini Setup for Chat Only
G_API = os.getenv("GOOGLE_API_KEY")
if G_API:
    genai.configure(api_key=G_API)
    chatmodel = genai.GenerativeModel("gemini-2.5-flash")
    print("✅ Gemini configured for chat")
else:
    chatmodel = None
    print("⚠️ GOOGLE_API_KEY missing — Chat AI disabled")


# ======================================================
# ✅ 2. REQUEST MODELS
# ======================================================

class Features(BaseModel):
    phq9: float
    gad7: float
    sleep: float
    exercisefreq: float
    socialactivity: float
    onlinestress: float
    gpa: float
    familysupport: float
    screentime: float
    academicstress: float
    dietquality: float
    selfefficiency: float
    peerrelationship: float
    financialstress: float
    sleepquality: float


class ChatMessage(BaseModel):
    message: str


# ======================================================
# ✅ 3. SELF CHECK — Instant Local Feedback
# ======================================================

def generate_lifestyle_feedback(d: Features) -> str:
    parts = []

    # Sleep
    if d.sleep < 6:
        parts.append("💤 You’re not getting enough rest — 7–8 hours of sleep can improve focus and mood.")
    elif d.sleep > 9:
        parts.append("😴 You’re oversleeping slightly — consistent 7-hour sleep may boost alertness.")
    else:
        parts.append("🌙 Your sleep hours look great! Keep that routine steady.")

    # Exercise
    if d.exercisefreq < 2:
        parts.append("🏃 Add light workouts or evening walks 3 times a week — it helps release stress hormones.")
    elif d.exercisefreq >= 4:
        parts.append("💪 Excellent — regular physical activity is keeping you mentally fit!")
    else:
        parts.append("🚶 You’re active, but slightly increasing movement can lift your energy further.")

    # Social activity
    if d.socialactivity < 4:
        parts.append("👥 Spend more time talking to friends or joining college groups — social connection reduces anxiety.")
    elif d.socialactivity > 7:
        parts.append("💬 You have great social engagement — just balance it with some self-time too.")
    else:
        parts.append("😊 Balanced social life — good job!")

    # Stress levels
    if d.academicstress > 7 or d.onlinestress > 7:
        parts.append("📚 You seem to be under high stress — try 10-min breaks or deep-breathing between study sessions.")
    elif d.academicstress <= 4 and d.onlinestress <= 4:
        parts.append("🌼 Your stress levels are well-managed — that’s a strong sign of balance.")
    else:
        parts.append("⚖️ Your stress is moderate — plan tasks early to reduce last-minute anxiety.")

    # Diet
    if d.dietquality < 5:
        parts.append("🍎 Improve your meals — add more fruits, dal, and water to stabilize mood and energy.")
    else:
        parts.append("🥗 Nice! You seem to eat mindfully — nutrition supports your brain health.")

    # Self-efficacy & Relationships
    if d.selfefficiency < 5:
        parts.append("💡 You might be doubting yourself — try celebrating small wins to build self-trust.")
    else:
        parts.append("🔥 Strong self-belief — that’s your biggest advantage!")

    if d.peerrelationship < 4 or d.familysupport == 0:
        parts.append("💬 Try sharing more with peers or family — emotional openness builds support.")
    else:
        parts.append("🤝 It’s great you have supportive relationships — stay connected to them.")

    # Screen time
    if d.screentime > 8:
        parts.append("📱 You’re using screens a lot — short digital detoxes can refresh your mind.")
    else:
        parts.append("💻 Screen time is balanced — keep taking small offline breaks.")

    # Financial stress
    if d.financialstress > 6:
        parts.append("💸 Money worries can add pressure — plan small budgets or discuss options with trusted people.")
    else:
        parts.append("💰 Finances seem stable — keep your planning consistent.")

    # Final tip
    parts.append("🌱 Remember — progress, not perfection. A few mindful habits make college life much smoother.")

    return "\n".join(parts)


@app.post("/submit-assessment")
def submit_assessment(data: Features):
    """Instantly analyze mental wellness and lifestyle feedback."""
    try:
        input_data = np.array([[
            data.phq9,
            data.gad7,
            data.sleep,
            data.exercisefreq,
            data.socialactivity,
            data.onlinestress,
            data.gpa * 0.4,
            data.familysupport,
            data.screentime,
            data.academicstress,
            data.dietquality,
            data.selfefficiency,
            data.peerrelationship,
            data.financialstress,
            data.sleepquality,
        ]])

        # Prediction
        prediction = 0
        if model:
            prediction = int(model.predict(input_data)[0])

        # Message
        message = (
            "✅ You seem to be maintaining good mental balance. Keep nurturing those healthy habits!"
            if prediction == 1
            else "🧠 You may be under some emotional or academic stress. Take breaks, breathe, and seek help if needed."
        )

        feedback = generate_lifestyle_feedback(data)
        return {"prediction": prediction, "message": message, "ai_feedback": feedback}

    except Exception as e:
        print("❌ Error in /submit-assessment:", e)
        return {"error": "Server error", "details": str(e)}


# ======================================================
# ✅ 4. CHATBOT (for Indian Students)
# ======================================================

SENSITIVE_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die", "hurt myself",
    "worthless", "can't go on", "no reason to live", "give up", "end it all",
    "tired of living", "cut myself", "jump off", "hang myself", "die", "death"
]


@app.post("/chat")
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


# ======================================================
# ✅ 5. ROOT ENDPOINT
# ======================================================

@app.get("/")
def root():
    return {"status": "ok", "message": "Student Sanctuary Backend Active 🚀"}
