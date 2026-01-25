from __future__ import annotations

import logging
import os
from typing import Any, Dict, List, Optional

import requests

from app.food.models import Product

logger = logging.getLogger(__name__)

DEFAULT_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

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


def _get_api_key() -> str:
    key = os.getenv("USDA_API_KEY")
    if not key:
        raise RuntimeError("Brak USDA_API_KEY w zmiennych środowiskowych.")
    return key


def _get_search_url() -> str:
    return (os.getenv("SEARCH_URL") or DEFAULT_SEARCH_URL).strip().strip('"').strip("'")


def translate_query(name: str) -> str:
    raw = (name or "").strip()
    if not raw:
        return raw
    return PL_TO_EN.get(raw.lower(), raw)


def _pick_best_food(foods: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not foods:
        return None

    preferred_types = {"Foundation", "SR Legacy"}
    best = None
    best_score = -1

    for f in foods:
        nutrients = f.get("foodNutrients") or []
        n_count = len(nutrients)

        dtype = (f.get("dataType") or "").strip()
        dtype_bonus = 50 if dtype in preferred_types else 0

        desc = (f.get("description") or "").strip()
        desc_penalty = 5 if len(desc) > 80 else 0

        score = n_count + dtype_bonus - desc_penalty
        if score > best_score:
            best_score = score
            best = f

    return best


def search_food(query: str, page_size: int = 10) -> Optional[Dict[str, Any]]:

    url = _get_search_url()
    api_key = _get_api_key()

    payload = {
        "query": query,
        "pageSize": page_size,
        "dataType": ["Foundation", "SR Legacy", "Survey (FNDDS)"],
    }

    try:
        resp = requests.post(url, params={"api_key": api_key}, json=payload, timeout=15)
    except requests.RequestException as e:
        logger.warning("USDA request error dla query=%r: %s", query, e)
        return None

    if resp.status_code != 200:
        snippet = (resp.text or "")[:300].replace("\n", " ")
        logger.warning("USDA HTTP %s dla query=%r. Body: %s", resp.status_code, query, snippet)
        return None

    try:
        data = resp.json()
    except ValueError:
        snippet = (resp.text or "")[:300].replace("\n", " ")
        logger.warning("USDA: niepoprawny JSON dla query=%r. Body: %s", query, snippet)
        return None

    foods = data.get("foods") or []
    return _pick_best_food(foods)


def product_from_usda_record(original_name: str, record: dict) -> Product:

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
        kategoria="Inne",
        kalorie=kalorie,
        bialko=bialko,
        weglowodany=weglowodany,
        tluszcz=tluszcz,
        waga=100,
    )
