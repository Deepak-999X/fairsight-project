"""
FairSight AI — Configuration
Loads environment variables via pydantic-settings.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-this-to-a-secure-secret-key-min-32-chars"
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./fairsight.db"

    # Google Gemini AI
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GEMINI_MAX_TOKENS: int = 1500

    # Firebase
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None

    # File limits
    MAX_UPLOAD_SIZE_MB: int = 50
    MAX_ROWS: int = 500000

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
