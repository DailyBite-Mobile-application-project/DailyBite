# food_api/services/usda_api.py
from __future__ import annotations

import os
import logging
from typing import Any, Dict, Optional, List

import requests

logger = logging.getLogger(__name__)

DEFAULT_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"


def _get_api_key() -> str:
    key = os.getenv("USDA_API_KEY")
    if not key:
        raise RuntimeError("Brak USDA_API_KEY w zmiennych środowiskowych.")
    return key


def _get_search_url() -> str:
    return (os.getenv("SEARCH_URL") or DEFAULT_SEARCH_URL).strip().strip('"').strip("'")


def _pick_best_food(foods: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Heurystyka wyboru najlepszego rekordu:
    - preferuj rekordy z większą liczbą nutrientów
    - preferuj dataType Foundation / SR Legacy
    """
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

        # krótkie opisy zwykle są bardziej "bazowe" (nie brandowe elaboraty)
        desc = (f.get("description") or "").strip()
        desc_penalty = 0
        if len(desc) > 80:
            desc_penalty = 5

        score = n_count + dtype_bonus - desc_penalty

        if score > best_score:
            best_score = score
            best = f

    return best


def search_food(query: str, page_size: int = 10) -> Optional[Dict[str, Any]]:
    """
    Zwraca 'najlepszy' rekord food z USDA FDC albo None.
    """
    url = _get_search_url()
    api_key = _get_api_key()

    payload = {
        "query": query,
        "pageSize": page_size,
        # zawężamy do bardziej bazowych danych (dużo lepsze trafienia)
        "dataType": ["Foundation", "SR Legacy", "Survey (FNDDS)"],
    }

    try:
        resp = requests.post(url, params={"api_key": api_key}, json=payload, timeout=15)
    except requests.RequestException as e:
        logger.warning("USDA request error dla query=%r: %s", query, e)
        return None

    if resp.status_code != 200:
        snippet = (resp.text or "")[:300].replace("\n", " ")
        logger.warning(
            "USDA HTTP %s dla query=%r. Body: %s",
            resp.status_code,
            query,
            snippet,
        )
        return None

    try:
        data = resp.json()
    except ValueError:
        snippet = (resp.text or "")[:300].replace("\n", " ")
        logger.warning("USDA: niepoprawny JSON dla query=%r. Body: %s", query, snippet)
        return None

    foods = data.get("foods") or []
    best = _pick_best_food(foods)

    if not best:
        logger.info("USDA: brak wyników dla query=%r (foods=%s)", query, len(foods))
        return None

    return best
