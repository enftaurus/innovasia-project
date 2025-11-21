# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# import config
# from routes import predict
# from routes import chatbot
# from routes import register
# from routes import login
# from routes import logout
# from database import supabase
# app = FastAPI(title="Student Sanctuary Backend", version="5.0")
# app.include_router(predict.router)
# app.include_router(chatbot.router)
# app.include_router(register.router)
# app.include_router(login.router)
# app.include_router(logout.router)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Allow all for now
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(register.router)
# app.include_router(login.router)

# @app.get("/")
# def root():
#     return {"status": "ok", "message": "Student Sanctuary Backend Active 🚀"}



from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import config
from routes import predict
from routes import chatbot
from routes import register
from routes import login
from routes import logout
from routes import profile
from routes import session
from routes import counsellor_login
from routes import counsellor_logout
from routes import counsellor_profile
from routes import appointments
from database import supabase

app = FastAPI(title="Student Sanctuary Backend", version="5.0")

# ✅ Step 1: Add CORS middleware BEFORE routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",  # ✅ Use your frontend dev server URL
        "http://localhost:5173",  # ✅ Optional, covers both
    ],
    allow_credentials=True,       # ✅ Required for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Step 2: Include routers
app.include_router(predict.router)
app.include_router(chatbot.router)
app.include_router(register.router)
app.include_router(login.router)
app.include_router(logout.router)
app.include_router(profile.router)
app.include_router(session.router)
app.include_router(counsellor_profile.router)
app.include_router(counsellor_login.router)
app.include_router(counsellor_logout.router)
app.include_router(appointments.router)
@app.get("/")
def root():
    return {"status": "ok", "message": "Student Sanctuary Backend Active 🚀"}
