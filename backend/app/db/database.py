from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def connect_to_mongo() -> None:
    global _client, _db

    if _client is not None and _db is not None:
        return

    _client = AsyncIOMotorClient(
        settings.MONGO_URI,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
        socketTimeoutMS=20000,
        maxPoolSize=20,
    )
    _db = _client[settings.MONGO_DB_NAME]


def close_mongo_connection() -> None:
    global _client, _db

    if _client is not None:
        _client.close()

    _client = None
    _db = None


def get_database() -> AsyncIOMotorDatabase:
    global _db

    if _db is None:

        try:
            connect_to_mongo()
        except Exception as e:
            raise RuntimeError("MongoDB is not initialized. Check MONGO_URI / startup hooks.") from e

    if _db is None:
        raise RuntimeError("MongoDB is not initialized. connect_to_mongo() was not called.")

    return _db
