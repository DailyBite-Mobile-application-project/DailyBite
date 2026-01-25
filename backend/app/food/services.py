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
