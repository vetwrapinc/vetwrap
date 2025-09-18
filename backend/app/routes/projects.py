from __future__ import annotations

from fastapi import APIRouter, Depends

from ..core.auth import ClerkTokenPayload
from ..core.deps import get_current_user
from ..schemas.projects import ProjectOverview
from ..services.supabase import get_project_overview

router = APIRouter(prefix='/projects', tags=['Projects'])


@router.get('/overview', response_model=ProjectOverview)
async def project_overview(current_user: ClerkTokenPayload = Depends(get_current_user)) -> ProjectOverview:
  # Administrators and employees can review pipeline metrics. Clients see their own sanitized data in future iterations.
  if not set(current_user.roles).intersection({'admin', 'employee'}):
    return ProjectOverview()
  return get_project_overview()
