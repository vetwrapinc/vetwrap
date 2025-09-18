from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import get_settings
from .routes import ai, auth, projects


def create_app() -> FastAPI:
  settings = get_settings()
  application = FastAPI(title='VetWraps Studios API', version='0.1.0')

  application.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
  )

  application.include_router(auth.router, prefix=settings.api_prefix)
  application.include_router(ai.router, prefix=settings.api_prefix)
  application.include_router(projects.router, prefix=settings.api_prefix)

  @application.get('/health')
  async def health_check():
    return {'status': 'ok'}

  return application


def get_app() -> FastAPI:
  return create_app()


app = get_app()
