from services.usda_api import get_product_info
from models.product import Product
from db.database import produkty_collection

produkty_do_pobrania = ["jajko", "kurczak", "ryż", "banan"]

for nazwa in produkty_do_pobrania:
    info = get_product_info(nazwa)
    if info:
        prod = Product(**info)
        prod.save(produkty_collection)
        print(f"Dodano produkt: {prod.nazwa}")
    else:
        print(f"Nie udało się pobrać produktu: {nazwa}")
