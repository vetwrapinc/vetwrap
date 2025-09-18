from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from agents.ai_client import ai_client
from models.ai_requests import (
    EmailWriterRequest,
    QuoteGeneratorRequest,
    TaskSummarizerRequest,
    FeedbackResolverRequest,
    RevisionTranslatorRequest
)
from routes.auth import verify_clerk_token

router = APIRouter()

@router.post("/email-writer", response_model=Dict[str, Any])
async def generate_email(
    request: EmailWriterRequest,
    token_data: dict = Depends(verify_clerk_token)
):
    """Generate AI-powered email content"""
    try:
        result = await ai_client.generate_email(
            recipient_name=request.recipient_name,
            recipient_email=request.recipient_email,
            email_type=request.email_type,
            project_context=request.project_context,
            tone=request.tone,
            additional_notes=request.additional_notes
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate email: {str(e)}"
        )

@router.post("/quote-generator", response_model=Dict[str, Any])
async def generate_quote(
    request: QuoteGeneratorRequest,
    token_data: dict = Depends(verify_clerk_token)
):
    """Generate AI-powered project quote"""
    try:
        result = await ai_client.generate_quote(
            project_brief=request.project_brief,
            project_type=request.project_type,
            complexity_level=request.complexity_level,
            timeline=request.timeline,
            client_budget_range=request.client_budget_range
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quote: {str(e)}"
        )

@router.post("/task-summarizer", response_model=Dict[str, Any])
async def summarize_tasks(
    request: TaskSummarizerRequest,
    token_data: dict = Depends(verify_clerk_token)
):
    """Generate AI-powered task summaries"""
    try:
        result = await ai_client.summarize_tasks(
            work_logs=request.work_logs,
            date_range=request.date_range,
            include_insights=request.include_insights
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to summarize tasks: {str(e)}"
        )

@router.post("/feedback-resolver", response_model=Dict[str, Any])
async def resolve_feedback(
    request: FeedbackResolverRequest,
    token_data: dict = Depends(verify_clerk_token)
):
    """Convert vague client feedback into actionable tasks"""
    try:
        result = await ai_client.resolve_feedback(
            client_feedback=request.client_feedback,
            project_context=request.project_context,
            current_design_stage=request.current_design_stage
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resolve feedback: {str(e)}"
        )

@router.post("/revision-translator", response_model=Dict[str, Any])
async def translate_revision(
    request: RevisionTranslatorRequest,
    token_data: dict = Depends(verify_clerk_token)
):
    """Translate client feedback into design language"""
    try:
        result = await ai_client.translate_revision(
            client_feedback=request.client_feedback,
            design_type=request.design_type,
            current_version=request.current_version,
            project_requirements=request.project_requirements
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to translate revision: {str(e)}"
        )
