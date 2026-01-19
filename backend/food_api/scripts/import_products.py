# food_api/scripts/import_products.py
from __future__ import annotations

import argparse
import logging
from pathlib import Path
from typing import List

from dotenv import load_dotenv

from food_api.db.database import get_produkty_collection
from food_api.models.product import Product
from food_api.services.usda_api import search_food

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
    level = (Path(".").resolve() and (logging.INFO))
    # jeśli chcesz poziom z env: LOG_LEVEL=DEBUG/INFO/WARNING
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
    env_path = project_root / "food_api" / ".env"
    load_dotenv(env_path, override=False)


def _default_products() -> List[str]:
    # Możesz tu trzymać PL nazwy – i tak mapujemy do EN przy wyszukiwaniu
    return ["jajko", "kurczak", "ryż", "banan"]


def _product_from_usda_record(original_name: str, record: dict) -> Product:
    """
    Buduje Product z rekordu USDA pod Twoją klasę:
    Product(nazwa, kalorie, bialko, weglowodany, tluszcze, waga)
    """
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

    # USDA nutrient IDs (standardowe):
    # Energy: 1008 (kcal), Protein: 1003, Total lipid (fat): 1004, Carbohydrate: 1005
    kalorie = get_nutrient_value(1008)
    bialko = get_nutrient_value(1003)
    tluszcze = get_nutrient_value(1004)
    weglowodany = get_nutrient_value(1005)

    # Waga domyślnie 100g (tak jak w Twojej klasie)
    return Product(
        nazwa=original_name,
        kalorie=kalorie,
        bialko=bialko,
        weglowodany=weglowodany,
        tluszcze=tluszcze,
        waga=100,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Import produktów z USDA do MongoDB.")
    parser.add_argument("products", nargs="*", help="Lista produktów do importu (domyślnie wbudowana).")
    parser.add_argument("--no-dotenv", action="store_true", help="Nie ładuj .env (przydatne w chmurze).")
    parser.add_argument("--page-size", type=int, default=10, help="Ile rekordów pobrać z USDA (szersze szukanie).")
    args = parser.parse_args()

    configure_logging()

    # backend/food_api/scripts/import_products.py -> backend/
    project_root = Path(__file__).resolve().parents[2]
    _load_env(project_root, use_dotenv=not args.no_dotenv)

    products = args.products or _default_products()

    collection = get_produkty_collection()

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
