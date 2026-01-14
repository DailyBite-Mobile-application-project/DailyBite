import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("USDA_API_KEY")
SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

if not API_KEY:
    raise RuntimeError("Brak USDA_API_KEY w .env")

NUTRIENT_MAP = {
    "208": "kalorie",        # Energy (kcal)
    "203": "bialko",         # Protein
    "204": "tluszcze",       # Total fat
    "205": "weglowodany"     # Carbohydrates
}


def get_product_info(query):
    params = {
        "query": query,
        "api_key": API_KEY,
        "pageSize": 1
    }

    try:
        response = requests.get(SEARCH_URL, params=params, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Błąd połączenia z USDA ({query}): {e}")
        return None

    data = response.json()

    if "foods" not in data or not data["foods"]:
        return None

    food = data["foods"][0]
    nutrients = {v: 0 for v in NUTRIENT_MAP.values()}

    for n in food.get("foodNutrients", []):
        nutrient_number = n.get("nutrientNumber")
        if nutrient_number in NUTRIENT_MAP:
            nutrients[NUTRIENT_MAP[nutrient_number]] = n.get("value", 0)

    return {
        "nazwa": food.get("description", query),
        **nutrients
    }
