"""
PanoERP — Core Configuration
"""
from functools import lru_cache
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    APP_NAME: str = "PanoERP"
    APP_ENV: Literal["development", "staging", "production"] = "development"
    APP_DEBUG: bool = True
    APP_SECRET_KEY: str = "change_me_in_production"
    APP_VERSION: str = "0.1.0"

    DATABASE_URL: str = "sqlite+aiosqlite:///./pano_erp.db"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_ECHO: bool = False

    JWT_SECRET_KEY: str = "change_me_in_production_jwt_secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8000"]
    UPLOAD_DIR: str = "uploads"
    LOG_LEVEL: str = "INFO"

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
