from __future__ import annotations

import json
from functools import lru_cache
from typing import Any, Dict, List

from fastapi import HTTPException, status
from openai import OpenAI

from ..core.config import get_settings


class OpenAIAgent:
  """Wrapper around OpenAI's GPT models to produce structured JSON outputs."""

  def __init__(self, api_key: str | None, model: str) -> None:
    self._api_key = api_key
    self._model = model
    self._client: OpenAI | None = None

  @property
  def client(self) -> OpenAI:
    if not self._api_key:
      raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail='OpenAI API key is not configured.'
      )

    if self._client is None:
      self._client = OpenAI(api_key=self._api_key)

    return self._client

  @property
  def model(self) -> str:
    return self._model

  def _create_json_response(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
    response = self.client.responses.create(
      model=self.model,
      input=messages,
      temperature=0.7,
      response_format={"type": "json_object"}
    )

    try:
      content = response.output[0].content[0].text
      return json.loads(content)
    except (KeyError, IndexError, json.JSONDecodeError) as exc:
      raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail='Malformed response from OpenAI') from exc

  def generate_email_draft(self, *, client_name: str, context: str, tone: str, call_to_action: str | None) -> Dict[str, Any]:
    system_prompt = (
      'You are a senior producer at VetWraps Studios drafting a concise status email for a client.'
      ' Respond with JSON containing subject, previewText, and body keys.'
    )
    user_prompt = (
      f"Client: {client_name}\n"
      f"Tone: {tone}\n"
      f"Context: {context}\n"
      f"CallToAction: {call_to_action or 'none'}\n"
      'Summarize next steps, wins, and make the CTA explicit if provided.'
    )
    return self._create_json_response([
      {"role": "system", "content": system_prompt},
      {"role": "user", "content": user_prompt}
    ])

  def summarize_tasks(self, *, tasks_completed: str, obstacles: str | None, next_focus: str | None) -> Dict[str, Any]:
    system_prompt = (
      'You are an operations assistant summarizing a creative professional\'s day.'
      ' Return JSON with summary and logLineItems array where each item is a bullet for a time log.'
    )
    user_prompt = (
      f"Completed: {tasks_completed}\n"
      f"Obstacles: {obstacles or 'none'}\n"
      f"NextFocus: {next_focus or 'unspecified'}"
    )
    return self._create_json_response([
      {"role": "system", "content": system_prompt},
      {"role": "user", "content": user_prompt}
    ])

  def translate_revision(self, *, project_name: str, feedback: str, style_preferences: str | None) -> Dict[str, Any]:
    system_prompt = (
      'You help clients articulate feedback for designers at VetWraps Studios.'
      ' Respond with JSON containing translatedBrief, milestoneImpacts (array) and clarifyingQuestions (array).' \
      ' Use positive, collaborative language.'
    )
    user_prompt = (
      f"Project: {project_name}\nFeedback: {feedback}\nPreferences: {style_preferences or 'not provided'}"
    )
    return self._create_json_response([
      {"role": "system", "content": system_prompt},
      {"role": "user", "content": user_prompt}
    ])


@lru_cache(maxsize=1)
def get_openai_agent() -> OpenAIAgent:
  settings = get_settings()
  return OpenAIAgent(settings.openai_api_key, settings.openai_model)
