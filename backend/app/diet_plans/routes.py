from __future__ import annotations

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import get_current_user
from app.db.database import get_database
from app.diet_plans.models import DietPlanCreate, DietPlanResponse

router = APIRouter()


def _oid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")


@router.get("/", response_model=list[DietPlanResponse], status_code=status.HTTP_200_OK)
async def list_plans(
    limit: int = Query(50, ge=1, le=200),
    user: dict = Depends(get_current_user),
):
    db = get_database()
    cursor = db.diet_plans.find({"user_id": user["id"]}).sort("_id", -1).limit(limit)

    out: list[DietPlanResponse] = []
    async for p in cursor:
        out.append(
            DietPlanResponse(
                id=str(p["_id"]),
                name=p["name"],
                description=p["description"],
                durationDays=p["durationDays"],
                category=p["category"],
                imageUrl=p.get("imageUrl"),
                dishIds=p["dishIds"],
                nutritionTotal=p["nutritionTotal"],
            )
        )
    return out


@router.post("/", response_model=DietPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_plan(
    payload: DietPlanCreate,
    user: dict = Depends(get_current_user),
):
    db = get_database()

    # opcjonalnie: waliduj czy dishIds należą do usera
    count = await db.dishes.count_documents({"user_id": user["id"], "_id": {"$in": [ObjectId(d) for d in payload.dishIds if ObjectId.is_valid(d)]}})
    if count == 0:
        raise HTTPException(status_code=400, detail="dishIds invalid or not owned by user")

    doc = payload.model_dump()
    doc["user_id"] = user["id"]

    res = await db.diet_plans.insert_one(doc)
    return DietPlanResponse(id=str(res.inserted_id), **payload.model_dump())


@router.put("/{plan_id}", response_model=DietPlanResponse, status_code=status.HTTP_200_OK)
async def update_plan(
    plan_id: str,
    payload: DietPlanCreate,
    user: dict = Depends(get_current_user),
):
    db = get_database()
    oid = _oid(plan_id)

    existing = await db.diet_plans.find_one({"_id": oid, "user_id": user["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Plan not found")

    await db.diet_plans.update_one(
        {"_id": oid, "user_id": user["id"]},
        {"$set": payload.model_dump()},
    )
    return DietPlanResponse(id=plan_id, **payload.model_dump())


@router.delete("/{plan_id}", status_code=status.HTTP_200_OK)
async def delete_plan(
    plan_id: str,
    user: dict = Depends(get_current_user),
):
    db = get_database()
    oid = _oid(plan_id)

    res = await db.diet_plans.delete_one({"_id": oid, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")

    return {"ok": True}
