from __future__ import annotations

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import get_current_user
from app.db.database import get_database
from app.dishes.models import DishCreate, DishResponse

router = APIRouter()


def _oid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")


@router.get("/", response_model=list[DishResponse], status_code=status.HTTP_200_OK)
async def list_dishes(
    limit: int = Query(50, ge=1, le=200),
    user: dict = Depends(get_current_user),
):
    db = get_database()
    cursor = db.dishes.find({"user_id": user["id"]}).sort("_id", -1).limit(limit)

    out: list[DishResponse] = []
    async for d in cursor:
        out.append(
            DishResponse(
                id=str(d["_id"]),
                name=d["name"],
                prepTimeMinutes=d["prepTimeMinutes"],
                instructions=d["instructions"],
                ingredients=d["ingredients"],
                nutritionTotal=d["nutritionTotal"],
            )
        )
    return out


@router.post("/", response_model=DishResponse, status_code=status.HTTP_201_CREATED)
async def create_dish(
    payload: DishCreate,
    user: dict = Depends(get_current_user),
):
    db = get_database()
    doc = payload.model_dump()
    doc["user_id"] = user["id"]

    res = await db.dishes.insert_one(doc)
    return DishResponse(id=str(res.inserted_id), **payload.model_dump())


@router.put("/{dish_id}", response_model=DishResponse, status_code=status.HTTP_200_OK)
async def update_dish(
    dish_id: str,
    payload: DishCreate,
    user: dict = Depends(get_current_user),
):
    db = get_database()
    oid = _oid(dish_id)

    existing = await db.dishes.find_one({"_id": oid, "user_id": user["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Dish not found")

    await db.dishes.update_one(
        {"_id": oid, "user_id": user["id"]},
        {"$set": payload.model_dump()},
    )
    return DishResponse(id=dish_id, **payload.model_dump())


@router.delete("/{dish_id}", status_code=status.HTTP_200_OK)
async def delete_dish(
    dish_id: str,
    user: dict = Depends(get_current_user),
):
    db = get_database()
    oid = _oid(dish_id)

    res = await db.dishes.delete_one({"_id": oid, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Dish not found")

    return {"ok": True}
