from __future__ import annotations

from fastapi import APIRouter, Depends

from ..core.auth import ClerkTokenPayload
from ..core.deps import get_current_user
from ..schemas.auth import UserIdentity

router = APIRouter(prefix='/auth', tags=['Auth'])


@router.get('/me', response_model=UserIdentity)
async def read_current_user(current_user: ClerkTokenPayload = Depends(get_current_user)) -> UserIdentity:
  return UserIdentity(
    userId=current_user.sub,
    email=current_user.email or current_user.primary_email,
    roles=current_user.roles,
    primaryRole=current_user.primary_role
  )
