
from datetime import datetime, timedelta
from typing import Any, Dict
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from .core.config import settings
from .database import get_database

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def create_access_token(subject: str) -> str:
    to_encode: Dict[str, Any] = {}
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"sub": subject, "exp": expire, "type": "access"})
    encoded = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded


def create_refresh_token(subject: str) -> str:
    to_encode: Dict[str, Any] = {}
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"sub": subject, "exp": expire, "type": "refresh"})
    encoded = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise credentials_exception
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    db = get_database()
    # user ids are stored as ObjectId in Mongo -> try to convert
    try:
        oid = ObjectId(user_id)
    except Exception:
        # if not a valid ObjectId, try to query by string id field
        user = await db.users.find_one({"id": user_id})
    else:
        user = await db.users.find_one({"_id": oid})

    if not user:
        raise credentials_exception

    # normalize id to string
    if isinstance(user.get("_id"), ObjectId):
        user["id"] = str(user["_id"])
    else:
        user["id"] = user.get("id")

    # remove password fields before returning
    user.pop("hashed_password", None)
    return user
