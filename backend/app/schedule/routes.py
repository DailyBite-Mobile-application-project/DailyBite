from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import get_current_user
from app.db.database import get_database
from app.schedule.models import ScheduledMealCreate, ScheduledMealUpdate

router = APIRouter()


def _oid_or_404(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=404, detail="Not found")


@router.get("/", status_code=status.HTTP_200_OK)
async def list_scheduled_meals(
    date_from: str | None = Query(None, description="YYYY-MM-DD"),
    date_to: str | None = Query(None, description="YYYY-MM-DD"),
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    q: dict = {"user_id": current_user["id"]}

    if date_from or date_to:
        q["date"] = {}
        if date_from:
            q["date"]["$gte"] = date_from
        if date_to:
            q["date"]["$lte"] = date_to

    cursor = db.scheduled_meals.find(q).sort([("date", 1), ("time", 1)])
    out = []
    async for item in cursor:
        out.append(
            {
                "id": str(item["_id"]),
                "userId": item["user_id"],
                "date": item["date"],
                "time": item["time"],
                "dishId": item["dish_id"],
                "type": item["type"],
            }
        )
    return out


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_scheduled_meal(
    payload: ScheduledMealCreate,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()

    # opcjonalna walidacja: dish musi istnieć
    dish = await db.dishes.find_one({"_id": _oid_or_404(payload.dishId), "user_id": current_user["id"]})
    if not dish:
        raise HTTPException(status_code=400, detail="Dish not found")

    doc = {
        "user_id": current_user["id"],
        "date": payload.date,
        "time": payload.time,
        "dish_id": payload.dishId,
        "type": payload.type,
    }
    res = await db.scheduled_meals.insert_one(doc)
    return {
        "id": str(res.inserted_id),
        "userId": current_user["id"],
        "date": payload.date,
        "time": payload.time,
        "dishId": payload.dishId,
        "type": payload.type,
    }


@router.put("/{meal_id}", status_code=status.HTTP_200_OK)
async def update_scheduled_meal(
    meal_id: str,
    payload: ScheduledMealUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    oid = _oid_or_404(meal_id)

    existing = await db.scheduled_meals.find_one({"_id": oid, "user_id": current_user["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Not found")

    update: dict = {}
    if payload.date is not None:
        update["date"] = payload.date
    if payload.time is not None:
        update["time"] = payload.time
    if payload.type is not None:
        update["type"] = payload.type
    if payload.dishId is not None:
        # walidacja dish
        dish = await db.dishes.find_one({"_id": _oid_or_404(payload.dishId), "user_id": current_user["id"]})
        if not dish:
            raise HTTPException(status_code=400, detail="Dish not found")
        update["dish_id"] = payload.dishId

    if update:
        await db.scheduled_meals.update_one({"_id": oid}, {"$set": update})

    refreshed = await db.scheduled_meals.find_one({"_id": oid})
    return {
        "id": str(refreshed["_id"]),
        "userId": refreshed["user_id"],
        "date": refreshed["date"],
        "time": refreshed["time"],
        "dishId": refreshed["dish_id"],
        "type": refreshed["type"],
    }


@router.delete("/{meal_id}", status_code=status.HTTP_200_OK)
async def delete_scheduled_meal(
    meal_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    oid = _oid_or_404(meal_id)

    res = await db.scheduled_meals.delete_one({"_id": oid, "user_id": current_user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}
