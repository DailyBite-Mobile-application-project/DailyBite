from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson import ObjectId

from app.core.security import get_current_user
from app.db.database import get_database
from app.schedule.models import ScheduledMealCreate, ScheduledMealResponse


router = APIRouter()


def _oid(id_str: str) -> ObjectId:
  try:
    return ObjectId(id_str)
  except Exception:
    raise HTTPException(status_code=400, detail="Invalid id")


@router.get("/", response_model=list[ScheduledMealResponse])
async def list_schedule(
  date: str | None = Query(default=None, description="YYYY-MM-DD"),
  user: dict = Depends(get_current_user),
):
  db = get_database()

  q = {"user_id": user["id"]}
  if date:
    q["date"] = date

  cursor = db.scheduled_meals.find(q).sort([("date", 1), ("time", 1)])

  out: list[ScheduledMealResponse] = []
  async for m in cursor:
    out.append({**m, "id": str(m["_id"])})  # type: ignore
  return out


@router.post("/", response_model=ScheduledMealResponse, status_code=status.HTTP_201_CREATED)
async def create_scheduled_meal(payload: ScheduledMealCreate, user: dict = Depends(get_current_user)):
  db = get_database()

  # opcjonalnie: sprawdź czy dish należy do usera
  dish = await db.dishes.find_one({"_id": _oid(payload.dishId), "user_id": user["id"]})
  if not dish:
    raise HTTPException(status_code=400, detail="Dish does not exist")

  doc = payload.model_dump()
  doc["user_id"] = user["id"]

  res = await db.scheduled_meals.insert_one(doc)
  created = await db.scheduled_meals.find_one({"_id": res.inserted_id})
  assert created is not None
  return {**created, "id": str(created["_id"])}


@router.put("/{meal_id}", response_model=ScheduledMealResponse)
async def update_scheduled_meal(meal_id: str, payload: ScheduledMealCreate, user: dict = Depends(get_current_user)):
  db = get_database()
  oid = _oid(meal_id)

  existing = await db.scheduled_meals.find_one({"_id": oid, "user_id": user["id"]})
  if not existing:
    raise HTTPException(status_code=404, detail="Scheduled meal not found")

  dish = await db.dishes.find_one({"_id": _oid(payload.dishId), "user_id": user["id"]})
  if not dish:
    raise HTTPException(status_code=400, detail="Dish does not exist")

  await db.scheduled_meals.update_one({"_id": oid}, {"$set": payload.model_dump()})
  updated = await db.scheduled_meals.find_one({"_id": oid})
  assert updated is not None
  return {**updated, "id": str(updated["_id"])}


@router.delete("/{meal_id}")
async def delete_scheduled_meal(meal_id: str, user: dict = Depends(get_current_user)):
  db = get_database()
  oid = _oid(meal_id)

  res = await db.scheduled_meals.delete_one({"_id": oid, "user_id": user["id"]})
  if res.deleted_count == 0:
    raise HTTPException(status_code=404, detail="Scheduled meal not found")

  return {"ok": True}
