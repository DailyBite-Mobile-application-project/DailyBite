from fastapi import APIRouter, HTTPException, status
from jose import JWTError, jwt

from app.auth.models import (
    UserCreate,
    UserLogin,
    RefreshTokenRequest,
    UserResponse,
    TokenResponse,
)
from app.auth.services import (
    create_user,
    authenticate_user,
    create_tokens_for_user,
    get_user_by_email,
)
from app.db.database import get_database
from app.core.config import settings

router = APIRouter()


def to_user_response(user: dict) -> UserResponse:
    """
    Normalizuje obiekt usera z DB do DTO dla frontu.
    Obsługuje zarówno 'id' jak i Mongo '_id'.
    """
    uid = user.get("id") or user.get("_id")
    return UserResponse(
        id=str(uid) if uid is not None else None,
        name=str(user.get("name") or "").strip(),
        email=user["email"],
        is_active=bool(user.get("is_active", True)),
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate):
    existing = await get_user_by_email(payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = await create_user(payload.email, payload.password, payload.name)
    return {"id": user["id"], "email": user["email"], "name": user["name"]}


@router.post("/token", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(payload: UserLogin):
    user = await authenticate_user(payload.email, payload.password, payload.name)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    tokens = await create_tokens_for_user(user)

    # tokens np. {access_token, refresh_token, token_type}
    return TokenResponse(
        **tokens,
        user=to_user_response(user),
    )


@router.post("/refresh", response_model=TokenResponse, status_code=status.HTTP_200_OK)
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

    user = await db.users.find_one({"_id": user_id})
    if not user:
        user = await db.users.find_one({"id": user_id})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    tokens = await create_tokens_for_user(user)
    return TokenResponse(
        **tokens,
        user=to_user_response(user),
    )
