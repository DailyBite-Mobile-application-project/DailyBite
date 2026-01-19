import os
from pymongo import MongoClient


def _get_mongo_uri() -> str:
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise RuntimeError(
            "Brak MONGO_URI w zmiennych środowiskowych. "
            "Ustaw MONGO_URI (lokalnie możesz użyć pliku .env i python-dotenv w entrypoincie)."
        )
    return mongo_uri


def get_db_name() -> str:
    return os.getenv("MONGO_DB_NAME", "fooddb")


def get_client() -> MongoClient:
    return MongoClient(_get_mongo_uri())


def get_produkty_collection():
    client = get_client()
    db = client[get_db_name()]
    return db["produkty"]

