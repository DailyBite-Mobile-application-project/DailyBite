from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.config import settings
from backend.database import connect_to_mongo, close_mongo_connection
from backend.routes import auth as auth_router
from backend.routes import users as users_router


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
)


@app.on_event("startup")
async def startup_event() -> None:
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    await close_mongo_connection()


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router.router)
app.include_router(users_router.router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
