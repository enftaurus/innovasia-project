from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import config
from routes import predict
from routes import chatbot
from routes import register
from routes import login
from routes import logout
from routes import profile
from database import supabase
app = FastAPI(title="Student Sanctuary Backend", version="5.0")
app.include_router(predict.router)
app.include_router(chatbot.router)
app.include_router(register.router)
app.include_router(login.router)
app.include_router(logout.router)
app.include_router(profile.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for now
    allow_credentials="True",
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "message": "Student Sanctuary Backend Active 🚀"}
