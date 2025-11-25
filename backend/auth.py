import os
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET = os.getenv("JWT_SECRET")


def hash_password(password: str):
    password_bytes = password.encode("utf-8")[:72]
    return pwd.hash(password_bytes)


def verify_password(password: str, hash: str):
    password_bytes = password.encode("utf-8")[:72]
    return pwd.verify(password_bytes, hash)


def create_token(user_id: str):
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")
