# Run with: uvicorn main:app --reload
# Or from project root: cd backend && uvicorn main:app --reload

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
try:
    from supabase_client import supabase
except ImportError:
    try:
        from backend.supabase_client import supabase
    except ImportError:
        supabase = None

app = FastAPI(
    title="Python Mastery Tracker API",
    description="FastAPI backend for sync and data persistence in Python Mastery Tracker",
    version="1.0.0",
)

# Enable CORS for frontend dev servers (Next.js port 3000, Vite port 5173, local loopback)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory database mimicking the localStorage schema
db: Dict[str, Any] = {
    "completedTopics": {},
    "projectStatus": {},
    "dailyActivity": {},
    "topicState": {},
    "badges": [],
    "settings": {
        "dailyGoalHours": 1,
        "startDate": "2026-08-07",
        "targetCompletionDate": None,
        "theme": "dark",
        "reminderTime": "19:00",
        "notificationsEnabled": False,
    },
    "streakFreezes": {
        "available": 1,
        "usedOn": [],
    },
    "activeTimer": None,
    "studyLog": [],
}

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "Python Mastery Tracker Backend API",
        "supabase_connected": supabase is not None,
        "endpoints": ["/api/data", "/api/sync"],
    }

@app.get("/api/data")
def get_user_data():
    """Returns all user data: dailyActivity, topicState, badges, settings, etc."""
    global db
    if supabase is not None:
        try:
            res = supabase.table("user_data").select("*").eq("id", "default_user").execute()
            if res.data and len(res.data) > 0:
                stored = res.data[0].get("payload")
                if stored and isinstance(stored, dict):
                    db.update(stored)
        except Exception as e:
            # Fallback to in-memory db if table isn't created yet
            pass

    return db

@app.post("/api/sync")
def sync_user_data(payload: Dict[str, Any]):
    """Accepts a full JSON payload from the client to overwrite/update the database."""
    global db
    if not payload and not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Invalid payload provided")

    # Update in-memory DB keys if present in payload
    keys = [
        "completedTopics",
        "projectStatus",
        "dailyActivity",
        "topicState",
        "badges",
        "settings",
        "streakFreezes",
        "activeTimer",
        "studyLog",
    ]
    for key in keys:
        if key in payload:
            db[key] = payload[key]

    # Attempt to persist to Supabase PostgreSQL table
    if supabase is not None:
        try:
            supabase.table("user_data").upsert({"id": "default_user", "payload": db}).execute()
        except Exception as e:
            # Silent fallback to in-memory cache if table doesn't exist
            pass

    return {
        "status": "success",
        "message": "Data synchronized successfully",
        "supabase_synced": supabase is not None,
        "data": db,
    }
