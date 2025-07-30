from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from pydantic import EmailStr, Field

class Settings(BaseSettings):
    FRONTEND_URL: str 
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    MAX_FAILED_LOGIN_ATTEMPTS: int = 5

    LOCKOUT_TIME_MINUTES: int = 15

    # ── Mail settings match your .env keys ───────────────────────────────
    MAIL_SERVER:   str
    MAIL_PORT:     int
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM:     EmailStr

    # ── FastAPI‑Mail’s real flags ───────────────────────────────────────
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS:  bool = False
    USE_CREDENTIALS: bool = True

    model_config = ConfigDict(
        from_attributes=True,
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",   # silently drop anything in .env you haven’t declared
    )
        



settings = Settings()
