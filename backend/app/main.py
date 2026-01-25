from fastapi import FastAPI

from app.api.router import router as api_router
from app.db.database import connect_to_mongo, close_mongo_connection

app = FastAPI(title="DailyBite API", version="1.0.0")

@app.on_event("startup")
def startup_event():
    connect_to_mongo()

@app.on_event("shutdown")
def shutdown_event():
    close_mongo_connection()

@app.get("/health")
def health():
    return {"ok": True}

app.include_router(api_router)
