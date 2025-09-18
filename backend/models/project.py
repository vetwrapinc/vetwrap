from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ProjectStatus(str, Enum):
    INQUIRY = "inquiry"
    DESIGN = "design"
    REVIEW = "review"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ProjectPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class ProjectType(str, Enum):
    LOGO = "logo"
    BRAND_IDENTITY = "brand_identity"
    SOCIAL_MEDIA = "social_media"
    WEB_DESIGN = "web_design"
    PRINT_DESIGN = "print_design"
    RETAINER = "retainer"

class ProjectBase(BaseModel):
    title: str
    description: str
    project_type: ProjectType
    status: ProjectStatus = ProjectStatus.INQUIRY
    priority: ProjectPriority = ProjectPriority.MEDIUM
    client_id: str
    assigned_employee_id: Optional[str] = None
    budget: Optional[float] = None
    deadline: Optional[datetime] = None
    tags: List[str] = []

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    priority: Optional[ProjectPriority] = None
    assigned_employee_id: Optional[str] = None
    budget: Optional[float] = None
    deadline: Optional[datetime] = None
    tags: Optional[List[str]] = None

class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime
    client: Optional[Dict[str, Any]] = None
    assigned_employee: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

class ProjectInDB(ProjectResponse):
    pass
