import requests
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("USDA_API_KEY")
SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

NUTRIENT_MAP = {
    1008: "kalorie",
    1003: "bialko",
    1005: "weglowodany",
    1004: "tluszcze"
}

def get_product_info(query):
    params = {"query": query, "api_key": API_KEY, "pageSize": 1}
    response = requests.get(SEARCH_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        if "foods" in data and len(data["foods"]) > 0:
            food = data["foods"][0]
            nutrients = {v: 0 for v in NUTRIENT_MAP.values()}
            for n in food.get("foodNutrients", []):
                if n["nutrientNumber"] in NUTRIENT_MAP:
                    nutrients[NUTRIENT_MAP[n["nutrientNumber"]]] = n.get("value", 0)
            return {
                "nazwa": food.get("description", query),
                **nutrients
            }
    else:
        print(f"Error {response.status_code}: {response.text}")
    return None
