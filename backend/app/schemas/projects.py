from __future__ import annotations

from datetime import datetime
from typing import List

from pydantic import BaseModel, Field
from pydantic.config import ConfigDict


def to_camel(value: str) -> str:
  parts = value.split('_')
  return parts[0] + ''.join(word.capitalize() for word in parts[1:])


class ProjectStatusSummary(BaseModel):
  model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

  inquiry: int = 0
  design: int = 0
  review: int = 0
  delivered: int = 0


class PerformanceMetric(BaseModel):
  model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

  label: str
  value: str
  delta: str | None = None


class TimelineEntry(BaseModel):
  model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

  id: str
  project_name: str = Field(..., alias='projectName')
  status: str
  owner: str
  updated_at: datetime = Field(..., alias='updatedAt')


class FileVersionItem(BaseModel):
  model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

  id: str
  filename: str
  version: str
  uploaded_at: datetime = Field(..., alias='uploadedAt')
  uploaded_by: str = Field(..., alias='uploadedBy')


class ProjectOverview(BaseModel):
  model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

  status_summary: ProjectStatusSummary = Field(default_factory=ProjectStatusSummary, alias='statusSummary')
  weekly_metrics: List[PerformanceMetric] = Field(default_factory=list, alias='weeklyMetrics')
  active_timeline: List[TimelineEntry] = Field(default_factory=list, alias='activeTimeline')
  recent_files: List[FileVersionItem] = Field(default_factory=list, alias='recentFiles')
  ai_insights: List[str] = Field(default_factory=list, alias='aiInsights')
