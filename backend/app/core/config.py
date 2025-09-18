from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  api_prefix: str = '/api'
  cors_origins: List[str] = ['http://localhost:5173', 'https://vetwraps-studios.vercel.app']
  openai_api_key: str | None = None
  openai_model: str = 'gpt-4o-mini'
  supabase_url: str | None = None
  supabase_key: str | None = None
  clerk_jwks_url: str | None = None
  clerk_audience: str | None = None
  clerk_issuer: str | None = None

  model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='allow')


@lru_cache(maxsize=1)
def get_settings() -> Settings:
  return Settings()
