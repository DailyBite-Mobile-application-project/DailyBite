from datetime import datetime, timezone
from passlib.context import CryptContext
from backend.database import get_database
from backend.security import create_access_token, create_refresh_token

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)


async def get_user_by_email(email: str) -> dict | None:
    db = get_database()
    return await db.users.find_one({"email": email})


async def create_user(email: str, password: str) -> dict:
    db = get_database()

    hashed = pwd_context.hash(password)

    doc = {
        "email": email,
        "hashed_password": hashed,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(doc)

    return {
        "id": str(result.inserted_id),
        "email": email,
    }


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


async def authenticate_user(email: str, password: str) -> dict | None:
    user = await get_user_by_email(email)
    if not user:
        return None

    if not user.get("is_active", False):
        return None

    if not verify_password(password, user["hashed_password"]):
        return None

    return {
        "_id": user["_id"],
        "id": str(user["_id"]),
        "email": user["email"],
    }
