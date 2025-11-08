from fastapi import APIRouter
from models.Features import features
from ml.stress_model import ml_model
import numpy as np
from database import supabase
router =APIRouter(prefix="/submit-assessment",tags=["predict"])

#prediction
@router.post("/")
def submit_assessment(data: features):
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
        if ml_model:
            prediction = int(ml_model.predict(input_data)[0])

        # Message
        message = (
    "✅ Your responses suggest you’re maintaining a good emotional balance. "
    "Keep nurturing those healthy habits and staying consistent with your routine!"
    if prediction == 1
    else "🧠 Your stress indicators seem slightly elevated. "
         "Try incorporating more rest, breaks, and positive coping habits — you’ve got this!"
)


        feedback = generate_lifestyle_feedback(data)
        return {"prediction": prediction, "message": message, "ai_feedback": feedback}

    except Exception as e:
        print("❌ Error in /submit-assessment:", e)
        return {"error": "Server error", "details": str(e)}

#customised reply
def generate_lifestyle_feedback(d: features) -> str:
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
