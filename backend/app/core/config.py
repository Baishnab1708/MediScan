from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    FRONTEND_URL: str
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # OCR Service Settings
    AZURE_SUBSCRIPTION_KEY: str
    AZURE_ENDPOINT: str

    # OpenRouter API Settings
    OPENROUTER_API_KEY: str
    OPENROUTER_BASE_URL: str
    OPENROUTER_MODEL: str

    # File Upload Settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set = frozenset({".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".pdf"})
    UPLOAD_DIR: str = "temp_uploads"

    class Config:
        env_file = ".env"


settings = Settings()