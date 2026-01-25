from fastapi import APIRouter, HTTPException, Query, status
from app.db.database import get_database
from app.food.services import search_food, product_from_usda_record, translate_query

router = APIRouter()


def serialize_product(item: dict) -> dict:
    return {
        "id": str(item["_id"]),
        "nazwa": item.get("nazwa", ""),
        "kategoria": item.get("kategoria", "Inne"),
        "kalorie": item.get("kalorie", 0),
        "bialko": item.get("bialko", 0),
        "weglowodany": item.get("weglowodany", 0),
        "tluszcz": item.get("tluszcz", 0),
        "waga": item.get("waga", 100),
    }


@router.get("/", status_code=status.HTTP_200_OK)
async def list_products(limit: int = Query(50, ge=1, le=200)):
    db = get_database()

    cursor = db.products.find().limit(limit)
    products = []

    async for item in cursor:
        products.append(serialize_product(item))

    return products


@router.get("/search", status_code=status.HTTP_200_OK)
async def search_products(
    q: str = Query(..., min_length=2, description="Fragment nazwy produktu")
):
    db = get_database()

    cursor = db.products.find({"nazwa": {"$regex": q, "$options": "i"}}).limit(50)
    results = []

    async for item in cursor:
        results.append(serialize_product(item))

    return results


@router.post("/import-defaults", status_code=status.HTTP_200_OK)
async def import_default_products():
    db = get_database()
    default_names = [
        "jajko",
        "kurczak",
        "ryż",
        "ryż brązowy",
        "banan",
        "jabłko",
        "ziemniaki",
        "mleko",
        "ser",
        "chleb",
        "wołowina",
        "wieprzowina",
    ]

    imported = 0
    for name in default_names:
        query = translate_query(name)
        record = search_food(query=query, page_size=10)
        if not record:
            continue

        try:
            produkt = product_from_usda_record(original_name=name, record=record)
        except Exception:
            continue

        await db.products.update_one(
            {"nazwa": produkt.nazwa},
            {"$set": produkt.to_dict()},
            upsert=True,
        )
        imported += 1

    return {"imported": imported}
