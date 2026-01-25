from __future__ import annotations

import argparse
import logging
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from pymongo import MongoClient

from app.core.config import settings
from app.food.models import Product
from app.food.services import search_food

logger = logging.getLogger(__name__)

PL_TO_EN = {
    "jajko": "egg",
    "kurczak": "chicken breast",
    "ryż": "rice",
    "mleko": "milk",
    "ser": "cheese",
    "chleb": "bread",
    "ziemniaki": "potato",
    "wołowina": "beef",
    "wieprzowina": "pork",
    "jabłko": "apple",
    "banan": "banana",
}


def configure_logging() -> None:
    import os

    lvl = (os.getenv("LOG_LEVEL") or "INFO").upper()
    level = getattr(logging, lvl, logging.INFO)

    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )


def _load_env(project_root: Path, use_dotenv: bool) -> None:
    if not use_dotenv:
        return
    env_path = project_root / ".env"
    load_dotenv(env_path, override=False)


def _default_products() -> List[str]:
    return ["jajko", "kurczak", "ryż", "banan"]


def _product_from_usda_record(original_name: str, record: dict) -> Product:

    nutrients = record.get("foodNutrients") or []

    def get_nutrient_value(nutrient_id: int) -> float:
        for n in nutrients:
            if n.get("nutrientId") == nutrient_id:
                v = n.get("value")
                try:
                    return float(v)
                except (TypeError, ValueError):
                    return 0.0
        return 0.0

    kalorie = get_nutrient_value(1008)
    bialko = get_nutrient_value(1003)
    tluszcz = get_nutrient_value(1004)
    weglowodany = get_nutrient_value(1005)

    return Product(
        nazwa=original_name,
        kalorie=kalorie,
        bialko=bialko,
        weglowodany=weglowodany,
        tluszcz=tluszcz,
        waga=100,
    )


def _get_produkty_collection():

    client = MongoClient(settings.MONGO_URI)
    db_name = settings.MONGO_DB or settings.MONGO_DB_NAME or "dailybite"
    db = client[db_name]
    return db["products"]


def main() -> None:
    parser = argparse.ArgumentParser(description="Import produktów z USDA do MongoDB.")
    parser.add_argument("products", nargs="*", help="Lista produktów do importu (domyślnie wbudowana).")
    parser.add_argument("--no-dotenv", action="store_true", help="Nie ładuj .env (przydatne w chmurze).")
    parser.add_argument("--page-size", type=int, default=10, help="Ile rekordów pobrać z USDA (szersze szukanie).")
    args = parser.parse_args()

    configure_logging()

    # backend/app/food/scripts/import_products.py -> backend/
    project_root = Path(__file__).resolve().parents[3]
    _load_env(project_root, use_dotenv=not args.no_dotenv)

    products = args.products or _default_products()

    collection = _get_produkty_collection()

    for name in products:
        query = PL_TO_EN.get(name.lower().strip(), name.strip())

        record = search_food(query=query, page_size=args.page_size)
        if not record:
            logger.warning("Nie udało się pobrać produktu: %s (query do USDA: %s)", name, query)
            continue

        try:
            produkt = _product_from_usda_record(original_name=name, record=record)
        except Exception as e:
            logger.warning("Nie udało się zbudować produktu dla %s (query=%s): %s", name, query, e)
            continue

        try:
            produkt.save(collection)
            logger.info("Dodano/zaaktualizowano produkt: %s (query=%s)", name, query)
        except Exception as e:
            logger.exception("Błąd zapisu do Mongo dla %s (query=%s): %s", name, query, e)
            continue


if __name__ == "__main__":
    main()
