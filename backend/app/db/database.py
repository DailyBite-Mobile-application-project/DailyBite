from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings


_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def connect_to_mongo() -> None:

    global _client, _db

    if _client is not None and _db is not None:
        return

    _client = AsyncIOMotorClient(settings.MONGO_URI)
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
        connect_to_mongo()

    # po connect_to_mongo _db na pewno powinno być ustawione
    assert _db is not None
    return _db
