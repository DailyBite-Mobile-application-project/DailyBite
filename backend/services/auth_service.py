from passlib.context import CryptContext
from backend.database import get_database
from backend.auth import create_access_token, create_refresh_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def get_user_by_email(email: str):
    db = get_database()
    user = await db.users.find_one({"email": email})
    return user


async def create_user(email: str, password: str):
    db = get_database()
    hashed = pwd_context.hash(password)
    doc = {"email": email, "hashed_password": hashed, "is_active": True, "created_at": None}
    result = await db.users.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc["_id"] = result.inserted_id
    # don't return hashed password
    doc.pop("hashed_password", None)
    return doc


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


async def authenticate_user(email: str, password: str):
    user = await get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.get("hashed_password")):
        return None
    # normalize id
    user["id"] = str(user.get("_id", user.get("id")))
    return user


async def create_tokens_for_user(user: dict):
    sub = str(user["id"])
    access = create_access_token(sub)
    refresh = create_refresh_token(sub)
    db = get_database()
    # store refresh token so we can revoke it later
    await db.refresh_tokens.update_one({"user_id": sub}, {"$set": {"token": refresh}}, upsert=True)
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}
