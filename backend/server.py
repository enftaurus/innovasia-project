from fastapi import FastAPI
import joblib
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
# import os
# from dotenv import load_dotenv
# import google.generativeai as genai
model=joblib.load('model.pkl')
app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     
    allow_methods=["*"],     
    allow_headers=["*"],     
)
class features(BaseModel):
    phq9:float  # below 27 each question 3 9 questions
    gad7:float   #below 21 each question 3 7 questions
    sleep:float  #3-12
    exercisefreq:float #0-7 for in one week 
    socialactivity:float #on a scale of 10
    onlinestress:float #on a scale of 10
    gpa:float #0-10
    familysupport:float #0 or 1 
    screentime:float
    academicstress:float #0 -10
    dietquality:float #0-10
    selfefficiency:float #0-10
    peerrelationship:float #0-10
    financialstress:float #0-10
    sleepquality:float #0-10

@app.post("/submit-assessment")
def predict(data: features):
    # Convert input data into model-friendly format
    input_data = np.array([[
        data.phq9,
        data.gad7,
        data.sleep,
        data.exercisefreq,
        data.socialactivity,
        data.onlinestress,
        data.gpa*0.4,
        data.familysupport,
        data.screentime,
        data.academicstress,
        data.dietquality,
        data.selfefficiency,
        data.peerrelationship,
        data.financialstress,
        data.sleepquality
    ]])

    # Model prediction
    prediction = model.predict(input_data)[0]

    # Custom messages based on prediction
    if prediction == 1:
        message = (
            "✅ Perfect! You seem to be in a healthy mental state. "
            "Let's continue to the chatbot and plan your schedule or productivity goals!"
        )
    else:
        message = (
            "🧠 It seems like you might be experiencing some stress. "
            "Would you like some relaxation tips or prefer to book a session with a counsellor?"
        )

    # Return both prediction and message
    return {
        "prediction": int(prediction),
        "message": message
    }
load_dotenv()
G_API=os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=G_API)
chatmodel=genai.GenerativeModel("gemini-2.5-flash")
class chat(BaseModel):
    message:str
SUSPICIOUS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die", "hurt myself",
    "worthless", "can't go on", "no reason to live", "give up", "end it all",
    "tired of living", "cut myself", "jump off", "hang myself", "die", "death"
]
@app.post("/chat")
def chat_response(mess: chat):
    message = mess.message.lower()

    
    for word in SUSPICIOUS_KEYWORDS:
        if word in message:
            return {
                "reply": (
                    "You’re not alone — we’re right here with you."
                    "It’s completely okay to feel this way, and you don’t have to face it by yourself."
                    "Our counsellor is here to support you and guide you through this."
                    "Please don’t worry — you’re in safe hands, and we’ll help you find a way forward together."
                    "I’ll redirect you to our appointment booking page so you can connect with our counsellor soon. 💙"
                    "If you ever feel unsafe or in crisis, please reach out right away —"
                    "you can contact **AASRA Helpline (91-9820466726)** or **Vandrevala Foundation (1860 2662 345)** anytime."
                )
            }

    try:
    
        response = chatmodel.generate_content(message)
        reply_text = ""

        
        if hasattr(response, "text") and response.text:
            reply_text = response.text.strip()
        elif response.candidates:
            reply_text = (
                response.candidates[0].content.parts[0].text.strip()
                if response.candidates[0].content.parts
                else "I'm here for you."
            )
        else:
            reply_text = "I'm here for you."
        print(f"sending reply to frontend {reply_text}")
        return {"reply": reply_text}

    except Exception as e:
        print(f"Gemini error: {e}")
        return {
            "reply": (
                "I'm having trouble connecting to my AI partner right now. "
                "But I'm here for you — can you tell me a bit more about what’s going on?"
            )
        }


    