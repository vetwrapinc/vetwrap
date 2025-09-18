from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field
from pydantic.config import ConfigDict

from .projects import to_camel


class AdminEmailRequest(BaseModel):
  model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

  client_name: str = Field(..., alias='clientName')
  project_context: str = Field(..., alias='projectContext')
  tone: Literal['friendly', 'professional', 'direct'] = 'professional'
  call_to_action: str | None = Field(default=None, alias='callToAction')


class AdminEmailResponse(BaseModel):
  subject: str
  preview_text: str = Field(..., alias='previewText')
  body: str


class TaskSummarizerRequest(BaseModel):
  model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

  tasks_completed: str = Field(..., alias='tasksCompleted')
  obstacles: str | None = None
  next_focus: str | None = Field(default=None, alias='nextFocus')


class TaskSummarizerResponse(BaseModel):
  summary: str
  log_line_items: list[str] = Field(..., alias='logLineItems')


class RevisionTranslatorRequest(BaseModel):
  model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

  project_name: str = Field(..., alias='projectName')
  feedback: str
  style_preferences: str | None = Field(default=None, alias='stylePreferences')


class RevisionTranslatorResponse(BaseModel):
  translated_brief: str = Field(..., alias='translatedBrief')
  milestone_impacts: list[str] = Field(..., alias='milestoneImpacts')
  clarifying_questions: list[str] = Field(..., alias='clarifyingQuestions')
