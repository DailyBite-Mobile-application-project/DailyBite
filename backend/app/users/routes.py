from __future__ import annotations

from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.db.database import get_database
from app.users.models import UserMe, UserStats

router = APIRouter()


@router.get("/me", response_model=UserMe)
async def me(user: dict = Depends(get_current_user)):
  db = get_database()
  u = await db.users.find_one({"_id": __import__("bson").ObjectId(user["id"])})
  # fallback: jeśli user z tokena ma tylko email
  return {
    "id": user["id"],
    "email": (u.get("email") if u else user.get("email", "")),
    "name": (u.get("name") if u else None),
  }


@router.get("/stats", response_model=UserStats)
async def stats(user: dict = Depends(get_current_user)):
  db = get_database()

  # mealsLogged = liczba wpisów w schedule
  meals_logged = await db.scheduled_meals.count_documents({"user_id": user["id"]})

  # daysActive = liczba unikalnych date w schedule
  pipeline = [
    {"$match": {"user_id": user["id"]}},
    {"$group": {"_id": "$date"}},
    {"$count": "days"},
  ]
  agg = await db.scheduled_meals.aggregate(pipeline).to_list(length=1)
  days_active = int(agg[0]["days"]) if agg else 0

  return {"daysActive": days_active, "mealsLogged": meals_logged}
