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


def _default_products() -> list[dict]:
    return [
        {"id": "local-egg", "nazwa": "Jajko", "kategoria": "Białko", "kalorie": 143, "bialko": 13, "weglowodany": 1, "tluszcz": 10, "waga": 100},
        {"id": "local-chicken", "nazwa": "Kurczak (pierś)", "kategoria": "Białko", "kalorie": 165, "bialko": 31, "weglowodany": 0, "tluszcz": 4, "waga": 100},
        {"id": "local-rice", "nazwa": "Ryż", "kategoria": "Zboża", "kalorie": 130, "bialko": 2.7, "weglowodany": 28, "tluszcz": 0.3, "waga": 100},
        {"id": "local-potato", "nazwa": "Ziemniaki", "kategoria": "Warzywa", "kalorie": 77, "bialko": 2, "weglowodany": 17, "tluszcz": 0.1, "waga": 100},
        {"id": "local-milk", "nazwa": "Mleko 2%", "kategoria": "Nabiał", "kalorie": 50, "bialko": 3.4, "weglowodany": 5, "tluszcz": 2, "waga": 100},
        {"id": "local-banana", "nazwa": "Banan", "kategoria": "Owoce", "kalorie": 89, "bialko": 1.1, "weglowodany": 23, "tluszcz": 0.3, "waga": 100},
    ]


@router.get("/", status_code=status.HTTP_200_OK)
async def list_products(limit: int = Query(50, ge=1, le=200)):
    db = get_database()

    cursor = db.products.find().limit(limit)
    products = []

    async for item in cursor:
        products.append(serialize_product(item))

    if not products:
        return _default_products()

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
