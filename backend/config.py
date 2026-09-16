from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    # App config
    APP_NAME: str = "QRatten Backend"
    PORT: int = 3000
    
    # Database config
    DATABASE_URL: str
    
    # Redis config
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    
    # JWT config
    JWT_SECRET: str
    JWT_REFRESH_SECRET: str
    JWT_EXPIRES_IN: str = "15m"
    JWT_REFRESH_EXPIRES_IN: str = "7d"
    
    # AWS config (for later if needed)
    AWS_REGION: str = "ap-south-1"
    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None
    
    # Email config
    EMAIL_USER: str | None = None
    EMAIL_PASSWORD: str | None = None
    EMAIL_FROM: str | None = None
    FRONTEND_URL: str = "http://localhost:3000"
    API_URL: str = "http://127.0.0.1:8000"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

@lru_cache
def get_settings():
    return Settings()

settings = get_settings()
