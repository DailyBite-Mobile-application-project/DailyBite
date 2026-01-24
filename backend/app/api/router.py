from fastapi import APIRouter

from app.auth.routes import router as auth_router
from app.food.routes import router as food_router

router = APIRouter()

router.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["auth"],
)



router.include_router(
    food_router,
    prefix="/api/food",
    tags=["food"],
 )
