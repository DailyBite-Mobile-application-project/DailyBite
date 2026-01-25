from fastapi import APIRouter

from app.auth.routes import router as auth_router
from app.food.routes import router as food_router
from app.dishes.routes import router as dishes_router
from app.diet_plans.routes import router as diet_plans_router
from app.schedule.routes import router as schedule_router
from app.users.routes import router as users_router

router = APIRouter()

router.include_router(auth_router, prefix="/api/auth", tags=["auth"])
router.include_router(food_router, prefix="/api/food", tags=["food"])

router.include_router(dishes_router, prefix="/api/dishes", tags=["dishes"])
router.include_router(diet_plans_router, prefix="/api/diet-plans", tags=["diet-plans"])
router.include_router(schedule_router, prefix="/api/schedule", tags=["schedule"])
router.include_router(users_router, prefix="/api/users", tags=["users"])
