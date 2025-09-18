from __future__ import annotations

from datetime import datetime
from functools import lru_cache
from supabase import Client, create_client

from ..core.config import get_settings
from ..schemas.projects import FileVersionItem, PerformanceMetric, ProjectOverview, ProjectStatusSummary, TimelineEntry


def _parse_datetime(value: str | None) -> datetime:
  if not value:
    return datetime.utcnow()
  try:
    formatted = value.replace('Z', '+00:00') if value.endswith('Z') else value
    return datetime.fromisoformat(formatted)
  except ValueError:
    return datetime.utcnow()


@lru_cache(maxsize=1)
def get_supabase_client() -> Client | None:
  settings = get_settings()
  if not settings.supabase_url or not settings.supabase_key:
    return None
  return create_client(settings.supabase_url, settings.supabase_key)


def get_project_overview() -> ProjectOverview:
  client = get_supabase_client()
  if client is None:
    return ProjectOverview()

  status_summary = ProjectStatusSummary()

  try:
    pipeline = client.table('projects').select('status').execute()
    if pipeline.data:
      for row in pipeline.data:
        status = (row.get('status') or '').lower()
        if hasattr(status_summary, status):
          setattr(status_summary, status, getattr(status_summary, status) + 1)
  except Exception:  # pylint: disable=broad-except
    pass

  weekly_metrics: list[PerformanceMetric] = []
  try:
    metrics_response = client.table('project_metrics').select('*').order('week_ending', desc=True).limit(3).execute()
    for metric in metrics_response.data or []:
      weekly_metrics.append(
        PerformanceMetric(
          label=metric.get('label', 'Metric'),
          value=metric.get('value', '0'),
          delta=metric.get('delta')
        )
      )
  except Exception:  # pylint: disable=broad-except
    pass

  active_timeline: list[TimelineEntry] = []
  try:
    timeline_response = client.table('project_events').select('*').order('updated_at', desc=True).limit(5).execute()
    for item in timeline_response.data or []:
      active_timeline.append(
        TimelineEntry(
          id=str(item.get('id')),
          projectName=item.get('project_name', 'Project'),
          status=item.get('status', 'Updated'),
          owner=item.get('owner', 'Unassigned'),
          updatedAt=_parse_datetime(item.get('updated_at'))
        )
      )
  except Exception:  # pylint: disable=broad-except
    pass

  recent_files: list[FileVersionItem] = []
  try:
    files_response = client.table('project_files').select('*').order('uploaded_at', desc=True).limit(5).execute()
    for item in files_response.data or []:
      recent_files.append(
        FileVersionItem(
          id=str(item.get('id')),
          filename=item.get('filename', 'Asset'),
          version=item.get('version', 'v1'),
          uploadedAt=_parse_datetime(item.get('uploaded_at')),
          uploadedBy=item.get('uploaded_by', 'Team')
        )
      )
  except Exception:  # pylint: disable=broad-except
    pass

  ai_insights: list[str] = []
  try:
    insights_response = client.table('project_insights').select('summary').order('created_at', desc=True).limit(3).execute()
    for item in insights_response.data or []:
      summary = item.get('summary')
      if isinstance(summary, str):
        ai_insights.append(summary)
  except Exception:  # pylint: disable=broad-except
    pass

  return ProjectOverview(
    statusSummary=status_summary,
    weeklyMetrics=weekly_metrics,
    activeTimeline=active_timeline,
    recentFiles=recent_files,
    aiInsights=ai_insights
  )
