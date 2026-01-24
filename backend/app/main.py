from fastapi import FastAPI

from app.api.router import router as api_router
from app.db.database import connect_to_mongo, close_mongo_connection


app = FastAPI(
    title="DailyBite API",
    version="1.0.0",
)


@app.on_event("startup")
async def startup_event():
    connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event():
    close_mongo_connection()


app.include_router(api_router)
