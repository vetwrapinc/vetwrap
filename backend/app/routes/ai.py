from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ..agents.openai_agent import get_openai_agent
from ..core.auth import ClerkTokenPayload
from ..core.deps import get_current_user
from ..schemas.ai import (
  AdminEmailRequest,
  AdminEmailResponse,
  RevisionTranslatorRequest,
  RevisionTranslatorResponse,
  TaskSummarizerRequest,
  TaskSummarizerResponse
)

router = APIRouter(prefix='/ai', tags=['AI'])


def require_role(user: ClerkTokenPayload, allowed: set[str]) -> None:
  if not set(user.roles).intersection(allowed):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Insufficient role permissions')


@router.post('/admin/email-draft', response_model=AdminEmailResponse)
async def generate_email_draft(
  payload: AdminEmailRequest,
  current_user: ClerkTokenPayload = Depends(get_current_user)
) -> AdminEmailResponse:
  require_role(current_user, {'admin'})
  agent = get_openai_agent()
  response = agent.generate_email_draft(
    client_name=payload.client_name,
    context=payload.project_context,
    tone=payload.tone,
    call_to_action=payload.call_to_action
  )
  return AdminEmailResponse.model_validate(response)


@router.post('/employee/task-summary', response_model=TaskSummarizerResponse)
async def summarize_tasks(
  payload: TaskSummarizerRequest,
  current_user: ClerkTokenPayload = Depends(get_current_user)
) -> TaskSummarizerResponse:
  require_role(current_user, {'admin', 'employee'})
  agent = get_openai_agent()
  response = agent.summarize_tasks(
    tasks_completed=payload.tasks_completed,
    obstacles=payload.obstacles,
    next_focus=payload.next_focus
  )
  return TaskSummarizerResponse.model_validate(response)


@router.post('/client/revision-brief', response_model=RevisionTranslatorResponse)
async def translate_revision(
  payload: RevisionTranslatorRequest,
  current_user: ClerkTokenPayload = Depends(get_current_user)
) -> RevisionTranslatorResponse:
  require_role(current_user, {'admin', 'client'})
  agent = get_openai_agent()
  response = agent.translate_revision(
    project_name=payload.project_name,
    feedback=payload.feedback,
    style_preferences=payload.style_preferences
  )
  return RevisionTranslatorResponse.model_validate(response)
