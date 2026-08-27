
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    google_cloud_project: str | None = Field(default=None, validation_alias="GOOGLE_CLOUD_PROJECT")
    google_cloud_location: str = Field(default="us-central1", validation_alias="GOOGLE_CLOUD_LOCATION")
    google_genai_use_vertexai: bool = Field(default=True, validation_alias="GOOGLE_GENAI_USE_VERTEXAI")
    gemini_model: str = Field(default="gemini-2.5-flash", validation_alias="GEMINI_MODEL")

    host: str = Field(default="127.0.0.1", validation_alias="HOST")
    port: int = Field(default=8000, validation_alias="PORT")
    log_level: str = Field(default="info", validation_alias="LOG_LEVEL")

settings = Settings()
