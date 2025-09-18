from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from models.project import ProjectResponse
from routes.auth import verify_clerk_token
from config.database import get_supabase

router = APIRouter()

async def verify_client_role(token_data: dict = Depends(verify_clerk_token)):
    """Verify user has client role"""
    supabase = get_supabase()
    result = supabase.table("users").select("role").eq("clerk_id", token_data["user_id"]).execute()
    
    if not result.data or result.data[0]["role"] not in ["client", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Client access required"
        )
    return token_data

@router.get("/my-projects", response_model=List[ProjectResponse])
async def get_my_projects(client_token: dict = Depends(verify_client_role)):
    """Get projects for current client"""
    try:
        supabase = get_supabase()
        
        # Get current user
        user_result = supabase.table("users").select("id").eq("clerk_id", client_token["user_id"]).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = user_result.data[0]["id"]
        
        # Get client's projects
        result = supabase.table("projects").select(
            "*, client:users!client_id(*), assigned_employee:users!assigned_employee_id(*)"
        ).eq("client_id", user_id).execute()
        
        return [ProjectResponse(**project) for project in result.data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get projects: {str(e)}"
        )

@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    client_token: dict = Depends(verify_client_role)
):
    """Get specific project details"""
    try:
        supabase = get_supabase()
        
        # Get current user
        user_result = supabase.table("users").select("id").eq("clerk_id", client_token["user_id"]).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = user_result.data[0]["id"]
        
        # Get project
        result = supabase.table("projects").select(
            "*, client:users!client_id(*), assigned_employee:users!assigned_employee_id(*)"
        ).eq("id", project_id).eq("client_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return ProjectResponse(**result.data[0])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get project: {str(e)}"
        )

@router.get("/files/{project_id}", response_model=List[Dict[str, Any]])
async def get_project_files(
    project_id: str,
    client_token: dict = Depends(verify_client_role)
):
    """Get files for a project"""
    try:
        supabase = get_supabase()
        
        # Verify project belongs to client
        project_result = supabase.table("projects").select("client_id").eq("id", project_id).execute()
        if not project_result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get current user
        user_result = supabase.table("users").select("id").eq("clerk_id", client_token["user_id"]).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = user_result.data[0]["id"]
        
        if project_result.data[0]["client_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this project"
            )
        
        # Get project files
        result = supabase.table("project_files").select("*").eq("project_id", project_id).execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get files: {str(e)}"
        )

@router.post("/feedback", response_model=Dict[str, Any])
async def submit_feedback(
    project_id: str,
    feedback: Dict[str, Any],
    client_token: dict = Depends(verify_client_role)
):
    """Submit feedback for a project"""
    try:
        supabase = get_supabase()
        
        # Verify project belongs to client
        project_result = supabase.table("projects").select("client_id").eq("id", project_id).execute()
        if not project_result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get current user
        user_result = supabase.table("users").select("id").eq("clerk_id", client_token["user_id"]).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = user_result.data[0]["id"]
        
        if project_result.data[0]["client_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to provide feedback for this project"
            )
        
        # Add feedback
        feedback["project_id"] = project_id
        feedback["client_id"] = user_id
        
        result = supabase.table("project_feedback").insert(feedback).execute()
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit feedback: {str(e)}"
        )
