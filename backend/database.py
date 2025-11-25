from dotenv import load_dotenv
import os

load_dotenv()
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.getenv("MONGO_URL")

client = AsyncIOMotorClient(MONGO_URL)
db = client.dailybites
users_collection = db.users
