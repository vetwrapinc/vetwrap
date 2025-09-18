from __future__ import annotations

from functools import lru_cache
from typing import Any, Dict, List

from fastapi import HTTPException, status
from jwt import PyJWKClient, decode
from pydantic import BaseModel

from .config import get_settings


class ClerkTokenPayload(BaseModel):
  sub: str
  email: str | None = None
  primary_email: str | None = None
  public_metadata: Dict[str, Any] = {}
  org_id: str | None = None

  @property
  def roles(self) -> List[str]:
    metadata = self.public_metadata or {}
    roles: List[str] = []
    if isinstance(metadata.get('roles'), list):
      roles.extend([value for value in metadata['roles'] if isinstance(value, str)])
    if isinstance(metadata.get('role'), str) and metadata['role'] not in roles:
      roles.insert(0, metadata['role'])
    return roles

  @property
  def primary_role(self) -> str | None:
    if 'admin' in self.roles:
      return 'admin'
    if 'employee' in self.roles:
      return 'employee'
    return self.roles[0] if self.roles else None


class ClerkTokenVerifier:
  def __init__(self, jwks_url: str | None, audience: str | None, issuer: str | None) -> None:
    self._jwks_url = jwks_url
    self._audience = audience
    self._issuer = issuer
    self._jwks_client: PyJWKClient | None = None

  @property
  def jwks_client(self) -> PyJWKClient:
    if not self._jwks_url:
      raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='Clerk JWKS URL not configured')
    if self._jwks_client is None:
      self._jwks_client = PyJWKClient(self._jwks_url)
    return self._jwks_client

  def verify(self, token: str) -> ClerkTokenPayload:
    if not token:
      raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Missing authorization token')

    try:
      signing_key = self.jwks_client.get_signing_key_from_jwt(token)
      decoded = decode(
        token,
        signing_key.key,
        algorithms=['RS256'],
        audience=self._audience,
        issuer=self._issuer,
        options={'verify_aud': bool(self._audience)}
      )
    except Exception as exc:  # pylint: disable=broad-except
      raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid Clerk token') from exc

    payload = ClerkTokenPayload.model_validate(decoded)
    if payload.email is None and isinstance(decoded.get('email_addresses'), list):
      payload.email = next((entry.get('email_address') for entry in decoded['email_addresses'] if isinstance(entry, dict)), None)

    return payload


@lru_cache(maxsize=1)
def get_token_verifier() -> ClerkTokenVerifier:
  settings = get_settings()
  return ClerkTokenVerifier(settings.clerk_jwks_url, settings.clerk_audience, settings.clerk_issuer)
