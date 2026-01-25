from datetime import date
from bson import ObjectId
from fastapi import APIRouter, Depends, status
from app.core.security import get_current_user
from app.db.database import get_database

router = APIRouter()


@router.get("/me", status_code=status.HTTP_200_OK)
async def me(current_user: dict = Depends(get_current_user)):
    db = get_database()

    user = None
    if ObjectId.is_valid(current_user["id"]):
        user = await db.users.find_one({"_id": ObjectId(current_user["id"])})

    if not user:
        user = await db.users.find_one({"id": current_user["id"]})

    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": (user or {}).get("name", ""),
        "goal": (user or {}).get("goal", ""),
        "targetCalories": (user or {}).get("targetCalories", 0),
    }


@router.get("/me/stats", status_code=status.HTTP_200_OK)
async def my_stats(current_user: dict = Depends(get_current_user)):
    db = get_database()

    meals_logged = await db.scheduled_meals.count_documents({"user_id": current_user["id"]})

    pipeline = [
        {"$match": {"user_id": current_user["id"]}},
        {"$group": {"_id": "$date"}},
        {"$count": "days"},
    ]
    agg = await db.scheduled_meals.aggregate(pipeline).to_list(length=1)
    days_active = agg[0]["days"] if agg else 0

    return {
        "daysActive": days_active,
        "mealsLogged": meals_logged,
        "progressKg": None,
    }
