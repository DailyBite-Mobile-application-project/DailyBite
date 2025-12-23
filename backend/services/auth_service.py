from datetime import datetime, timezone
from passlib.context import CryptContext
from backend.database import get_database
from backend.security import create_access_token, create_refresh_token

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)


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
