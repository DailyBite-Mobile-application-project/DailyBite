from fastapi import APIRouter, HTTPException, status
from jose import JWTError, jwt

from app.auth.models import UserCreate, UserLogin, RefreshTokenRequest
from app.auth.services import (
    create_user,
    authenticate_user,
    create_tokens_for_user,
    get_user_by_email,
)
from app.db.database import get_database
from app.core.config import settings

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate):
    existing = await get_user_by_email(payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = await create_user(payload.email, payload.password)
    return {"id": str(user["id"]), "email": user["email"]}


@router.post("/token", status_code=status.HTTP_200_OK)
async def login(payload: UserLogin):
    user = await authenticate_user(payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    return await create_tokens_for_user(user)


@router.post("/refresh", status_code=status.HTTP_200_OK)
async def refresh_token(payload: RefreshTokenRequest):
    db = get_database()

    try:
        decoded = jwt.decode(
            payload.refresh_token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    if decoded.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wrong token type",
        )

    user_id = decoded.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    stored = await db.refresh_tokens.find_one({"user_id": user_id})
    if not stored or stored.get("token") != payload.refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked token",
        )


    return await create_tokens_for_user({"id": user_id})
