from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header, HTTPException, status

from .auth import ClerkTokenPayload, get_token_verifier


def get_authorization_header(authorization: Annotated[str | None, Header(convert_underscores=False)]):
  if not authorization:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Authorization header missing')
  return authorization


def get_current_user(authorization: Annotated[str, Depends(get_authorization_header)]) -> ClerkTokenPayload:
  scheme, _, token = authorization.partition(' ')
  if scheme.lower() != 'bearer' or not token:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid authorization header')

  verifier = get_token_verifier()
  return verifier.verify(token)
