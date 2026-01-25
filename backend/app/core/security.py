from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.core.config import settings
from app.db.database import get_database


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload: Dict[str, Any] = {
        "sub": str(subject),
        "exp": expire,
        "type": "access",
    }

    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    payload: Dict[str, Any] = {
        "sub": str(subject),
        "exp": expire,
        "type": "refresh",
    }

    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError:
        raise credentials_exception

    if payload.get("type") != "access":
        raise credentials_exception

    user_id = payload.get("sub")
    if not user_id or not isinstance(user_id, str):
        raise credentials_exception

    # wymagamy, żeby sub był ObjectId string
    if not ObjectId.is_valid(user_id):
        raise credentials_exception

    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise credentials_exception

    if not user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    return {
        "id": str(user["_id"]),
        "email": user.get("email", ""),
    }
