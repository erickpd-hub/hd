from typing import List, Optional
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        case_sensitive=True,
        extra="ignore"
    )

    APP_ENV: str = "development"
    APP_NAME: str = "SupportL1 AI SaaS"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-jwt-key-replace-in-production-min-32-chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/support_db"
    SYNC_DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/support_db"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10

    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # OpenAI & LLM Providers
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    
    TRIAGE_MODEL_NAME: str = "gpt-4o-mini"
    L1_AGENT_MODEL_NAME: str = "gpt-4o"
    EMBEDDING_MODEL_NAME: str = "text-embedding-3-small"
    EMBEDDING_DIMENSIONS: int = 1536

    # Agent thresholds
    L1_CONFIDENCE_THRESHOLD: float = 0.75
    MAX_RAG_CHUNKS: int = 5
    RAG_SIMILARITY_THRESHOLD: float = 0.65

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*"
    ]


settings = Settings()
