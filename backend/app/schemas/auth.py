from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field
from pydantic.config import ConfigDict

from .projects import to_camel


class UserIdentity(BaseModel):
  model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

  user_id: str = Field(..., alias='userId')
  email: Optional[str] = None
  roles: List[str] = Field(default_factory=list)
  primary_role: Optional[str] = Field(default=None, alias='primaryRole')
