from motor.motor_asyncio import AsyncIOMotorClient
from backend.core.config import settings

client: AsyncIOMotorClient | None = None
_db = None


async def connect_to_mongo() -> None:
    global client, _db

    if client is not None:
        return

    client = AsyncIOMotorClient(
        settings.MONGO_URL,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
        socketTimeoutMS=5000,
    )

    _db = client[settings.MONGO_DB]


async def close_mongo_connection() -> None:
    global client, _db

    if client:
        client.close()

    client = None
    _db = None


def get_database():
    if _db is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return _db
