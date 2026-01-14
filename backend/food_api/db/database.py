from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB_NAME", "fooddb")

if not MONGO_URI:
    raise RuntimeError("Brak MONGO_URI w .env")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
produkty_collection = db["produkty"]
