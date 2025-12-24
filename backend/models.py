from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr, Field


class UserInDB(BaseModel):
    id: str
    email: EmailStr
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenWithRefresh(Token):
    refresh_token: str

