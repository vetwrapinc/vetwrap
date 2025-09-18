from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class AIRequestType(str, Enum):
    EMAIL_WRITER = "email_writer"
    QUOTE_GENERATOR = "quote_generator"
    TASK_SUMMARIZER = "task_summarizer"
    FEEDBACK_RESOLVER = "feedback_resolver"
    REVISION_TRANSLATOR = "revision_translator"
    TESTIMONIAL_GENERATOR = "testimonial_generator"

class AIRequestStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class AIRequestBase(BaseModel):
    request_type: AIRequestType
    user_id: str
    project_id: Optional[str] = None
    input_data: Dict[str, Any]
    status: AIRequestStatus = AIRequestStatus.PENDING

class AIRequestCreate(AIRequestBase):
    pass

class AIRequestUpdate(BaseModel):
    status: Optional[AIRequestStatus] = None
    output_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None

class AIRequestResponse(AIRequestBase):
    id: str
    output_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AIRequestInDB(AIRequestResponse):
    pass

# Specific request models for different AI features
class EmailWriterRequest(BaseModel):
    recipient_name: str
    recipient_email: str
    email_type: str  # "update", "quote", "follow_up", "proposal"
    project_context: Optional[str] = None
    tone: str = "professional"
    additional_notes: Optional[str] = None

class QuoteGeneratorRequest(BaseModel):
    project_brief: str
    project_type: str
    complexity_level: str = "medium"
    timeline: str = "standard"
    client_budget_range: Optional[str] = None

class TaskSummarizerRequest(BaseModel):
    work_logs: List[Dict[str, Any]]
    date_range: str
    include_insights: bool = True

class FeedbackResolverRequest(BaseModel):
    client_feedback: str
    project_context: str
    current_design_stage: str

class RevisionTranslatorRequest(BaseModel):
    client_feedback: str
    design_type: str
    current_version: str
    project_requirements: Optional[str] = None
