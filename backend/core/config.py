from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGO_URL: str
    MONGO_DB: str = "DailyBite_DB"

    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    CORS_ORIGINS: List[str] = []

    model_config = SettingsConfigDict(
        env_file=None,           # ⬅️ KLUCZOWE
        extra="ignore"
    )


settings = Settings()

