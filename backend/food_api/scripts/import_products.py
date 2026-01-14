from food_api.services.usda_api import get_product_info
from food_api.models.product import Product
from food_api.db.database import produkty_collection

produkty_do_pobrania = ["jajko", "kurczak", "ryż", "banan"]

for nazwa in produkty_do_pobrania:
    info = get_product_info(nazwa)
    if info:
        produkt = Product(**info)
        produkt.save(produkty_collection)
        print(f"Dodano produkt: {produkt.nazwa}")
    else:
        print(f"Nie udało się pobrać produktu: {nazwa}")
