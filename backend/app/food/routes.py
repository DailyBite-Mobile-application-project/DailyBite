from fastapi import APIRouter, HTTPException, Query, status

from app.db.database import get_database

router = APIRouter()


@router.get("/", status_code=status.HTTP_200_OK)
async def list_products(limit: int = Query(50, ge=1, le=200)):

    db = get_database()

    cursor = db.products.find().limit(limit)
    products = []

    async for item in cursor:
        products.append(
            {
                "id": str(item["_id"]),
                "nazwa": item["nazwa"],
                "kalorie": item.get("kalorie", 0),
                "bialko": item.get("bialko", 0),
                "weglowodany": item.get("weglowodany", 0),
                "tluszcze": item.get("tluszcze", 0),
                "waga": item.get("waga", 100),
            }
        )

    return products


@router.get("/search", status_code=status.HTTP_200_OK)
async def search_products(
    q: str = Query(..., min_length=2, description="Fragment nazwy produktu")
):

    db = get_database()

    cursor = db.products.find(
        {"nazwa": {"$regex": q, "$options": "i"}}
    ).limit(50)

    results = []

    async for item in cursor:
        results.append(
            {
                "id": str(item["_id"]),
                "nazwa": item["nazwa"],
                "kalorie": item.get("kalorie", 0),
                "bialko": item.get("bialko", 0),
                "weglowodany": item.get("weglowodany", 0),
                "tluszcze": item.get("tluszcze", 0),
                "waga": item.get("waga", 100),
            }
        )

    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No products found",
        )

    return results
