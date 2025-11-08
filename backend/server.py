from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import config
from routes import predict
from routes import chatbot
app = FastAPI(title="Student Sanctuary Backend", version="5.0")
app.include_router(predict.router)
app.include_router(chatbot.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for now
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "message": "Student Sanctuary Backend Active 🚀"}
