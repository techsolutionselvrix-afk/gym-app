from functools import lru_cache
from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = Field(default="development")
    app_name: str = Field(default="gym-backend")
    log_level: str = Field(default="INFO")

    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str

    cors_origins: str = Field(default="")
    cors_origin_regex: str | None = Field(default=None)
    rate_limit_default: str = Field(default="100/minute")
    rate_limit_auth: str = Field(default="10/minute")

    bootstrap_super_admin_email: str | None = None

    @property
    def is_prod(self) -> bool:
        return self.app_env.lower() in ("production", "prod")

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @field_validator("supabase_url")
    @classmethod
    def _validate_url(cls, v: str) -> str:
        if not v.startswith("https://"):
            raise ValueError("SUPABASE_URL must be https://")
        return v.rstrip("/")


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
