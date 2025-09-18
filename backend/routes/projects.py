from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from models.project import ProjectResponse, ProjectCreate, ProjectUpdate
from routes.auth import verify_clerk_token
from config.database import get_supabase

router = APIRouter()

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(token_data: dict = Depends(verify_clerk_token)):
    """Get projects based on user role"""
    try:
        supabase = get_supabase()
        
        # Get current user
        user_result = supabase.table("users").select("id, role").eq("clerk_id", token_data["user_id"]).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = user_result.data[0]
        user_id = user["id"]
        user_role = user["role"]
        
        # Get projects based on role
        if user_role == "admin":
            result = supabase.table("projects").select(
                "*, client:users!client_id(*), assigned_employee:users!assigned_employee_id(*)"
            ).execute()
        elif user_role == "employee":
            result = supabase.table("projects").select(
                "*, client:users!client_id(*), assigned_employee:users!assigned_employee_id(*)"
            ).eq("assigned_employee_id", user_id).execute()
        elif user_role == "client":
            result = supabase.table("projects").select(
                "*, client:users!client_id(*), assigned_employee:users!assigned_employee_id(*)"
            ).eq("client_id", user_id).execute()
        else:
            raise HTTPException(status_code=403, detail="Invalid role")
        
        return [ProjectResponse(**project) for project in result.data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get projects: {str(e)}"
        )

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    token_data: dict = Depends(verify_clerk_token)
):
    """Get specific project"""
    try:
        supabase = get_supabase()
        
        # Get current user
        user_result = supabase.table("users").select("id, role").eq("clerk_id", token_data["user_id"]).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = user_result.data[0]
        user_id = user["id"]
        user_role = user["role"]
        
        # Get project
        result = supabase.table("projects").select(
            "*, client:users!client_id(*), assigned_employee:users!assigned_employee_id(*)"
        ).eq("id", project_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project = result.data[0]
        
        # Check access permissions
        if user_role == "client" and project["client_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this project")
        elif user_role == "employee" and project["assigned_employee_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this project")
        
        return ProjectResponse(**project)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get project: {str(e)}"
        )
