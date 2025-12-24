from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: Optional[str]
    email: EmailStr
    is_active: bool


class RefreshTokenRequest(BaseModel):
    refresh_token: str

