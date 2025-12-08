from fastapi import APIRouter, HTTPException, status
from backend.schemas import UserCreate, UserLogin
from backend.services.auth_service import create_user, authenticate_user, create_tokens_for_user, get_user_by_email
from backend.database import get_database

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", status_code=201)
async def register(payload: UserCreate):
    existing = await get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = await create_user(payload.email, payload.password)
    return {"id": user["id"], "email": user["email"]}


@router.post("/token")
async def login(payload: UserLogin):
    user = await authenticate_user(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    tokens = await create_tokens_for_user(user)
    return tokens


@router.post("/refresh")
async def refresh_token(body: dict):
    token = body.get("refresh_token")
    if not token:
        raise HTTPException(status_code=400, detail="Missing token")
    from jose import jwt, JWTError
    from backend.core.config import settings
    db = get_database()
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Wrong token type")
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    stored = await db.refresh_tokens.find_one({"user_id": user_id})
    if not stored or stored.get("token") != token:
        raise HTTPException(status_code=401, detail="Invalid or revoked token")
    from backend.auth import create_access_token
    access = create_access_token(user_id)
    return {"access_token": access, "token_type": "bearer"}
