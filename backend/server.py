from fastapi import FastAPI
import joblib
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import os
from dotenv import load_dotenv
import google.generativeai as genai
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

@app.post("/predict")
def predict(data: features):
    # Convert input data into model-friendly format
    input_data = np.array([[
        data.phq9,
        data.gad7,
        data.sleep,
        data.exercisefreq,
        data.socialactivity,
        data.onlinestress,
        data.gpa,
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
chatmodel=genai.GenerativeModel("gemini-2.0-flash")
class chat(BaseModel):
    user_message:str
@app.post("/chatbot")
def responses (message:chat):
    