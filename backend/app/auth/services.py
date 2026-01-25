from datetime import datetime, timezone
from passlib.context import CryptContext
from bson import ObjectId

from app.db.database import get_database
from app.core.security import create_access_token, create_refresh_token

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
)


def _normalize_user(doc: dict) -> dict:
    """
    Zwraca ustandaryzowany dict usera (dla routes / tokenów / frontu).
    """
    uid = doc.get("id") or doc.get("_id")
    return {
        "id": str(uid) if uid is not None else "",
        "email": doc.get("email", ""),
        "name": doc.get("name", "") or "",
        "is_active": bool(doc.get("is_active", True)),
    }


async def get_user_by_email(email: str) -> dict | None:
    db = get_database()
    doc = await db.users.find_one({"email": email})
    return _normalize_user(doc) if doc else None


async def get_user_by_id(user_id: str) -> dict | None:
    """
    user_id w JWT trzymasz jako string (str(ObjectId)).
    """
    db = get_database()

    doc = None
    # typowy przypadek: Mongo ObjectId
    try:
        doc = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        doc = None

    # fallback (jeśli kiedyś trzymasz własne pole id)
    if not doc:
        doc = await db.users.find_one({"id": user_id})

    return _normalize_user(doc) if doc else None


async def create_user(email: str, password: str, name: str) -> dict:
    db = get_database()
    hashed = pwd_context.hash(password)

    doc = {
        "email": email,
        "name": name.strip(),
        "hashed_password": hashed,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(doc)

    # zwracamy spójny format
    return {
        "id": str(result.inserted_id),
        "email": email,
        "name": doc["name"],
        "is_active": True,
    }


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


async def authenticate_user(email: str, password: str) -> dict | None:
    db = get_database()
    doc = await db.users.find_one({"email": email})
    if not doc:
        return None

    if not doc.get("is_active", False):
        return None

    if not verify_password(password, doc["hashed_password"]):
        return None

    return _normalize_user(doc)


async def create_tokens_for_user(user: dict) -> dict:
    """
    Przyjmuje user w formacie z _normalize_user() albo dict z _id/id.
    """
    user_id = user.get("id") or (str(user["_id"]) if "_id" in user else None)
    if not user_id:
        raise RuntimeError("Missing user id for token creation")

    access = create_access_token(user_id)
    refresh = create_refresh_token(user_id)

    db = get_database()
    await db.refresh_tokens.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "token": refresh,
                "updated_at": datetime.now(timezone.utc),
            }
        },
        upsert=True,
    )

    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
    }
