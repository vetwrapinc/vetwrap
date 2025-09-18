from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from models.project import ProjectResponse, ProjectUpdate
from routes.auth import verify_clerk_token
from config.database import get_supabase

router = APIRouter()

async def verify_employee_role(token_data: dict = Depends(verify_clerk_token)):
    """Verify user has employee role"""
    supabase = get_supabase()
    result = supabase.table("users").select("role").eq("clerk_id", token_data["user_id"]).execute()
    
    if not result.data or result.data[0]["role"] not in ["employee", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employee access required"
        )
    return token_data

@router.get("/my-projects", response_model=List[ProjectResponse])
async def get_my_projects(employee_token: dict = Depends(verify_employee_role)):
    """Get projects assigned to current employee"""
    try:
        supabase = get_supabase()
        
        # Get current user
        user_result = supabase.table("users").select("id").eq("clerk_id", employee_token["user_id"]).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = user_result.data[0]["id"]
        
        # Get assigned projects
        result = supabase.table("projects").select(
            "*, client:users!client_id(*), assigned_employee:users!assigned_employee_id(*)"
        ).eq("assigned_employee_id", user_id).execute()
        
        return [ProjectResponse(**project) for project in result.data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get projects: {str(e)}"
        )

@router.put("/projects/{project_id}/status", response_model=ProjectResponse)
async def update_project_status(
    project_id: str,
    status_update: ProjectUpdate,
    employee_token: dict = Depends(verify_employee_role)
):
    """Update project status (employee only)"""
    try:
        supabase = get_supabase()
        
        # Verify employee is assigned to this project
        project_result = supabase.table("projects").select("assigned_employee_id").eq("id", project_id).execute()
        if not project_result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get current user
        user_result = supabase.table("users").select("id").eq("clerk_id", employee_token["user_id"]).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = user_result.data[0]["id"]
        
        if project_result.data[0]["assigned_employee_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not assigned to this project"
            )
        
        # Update project
        result = supabase.table("projects").update(
            status_update.dict(exclude_unset=True)
        ).eq("id", project_id).execute()
        
        return ProjectResponse(**result.data[0])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update project: {str(e)}"
        )

@router.get("/work-log", response_model=List[Dict[str, Any]])
async def get_work_log(employee_token: dict = Depends(verify_employee_role)):
    """Get work log for current employee"""
    try:
        supabase = get_supabase()
        
        # Get current user
        user_result = supabase.table("users").select("id").eq("clerk_id", employee_token["user_id"]).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = user_result.data[0]["id"]
        
        # Get work logs
        result = supabase.table("work_logs").select("*").eq("employee_id", user_id).order("created_at", desc=True).execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get work log: {str(e)}"
        )

@router.post("/work-log", response_model=Dict[str, Any])
async def create_work_log(
    work_log: Dict[str, Any],
    employee_token: dict = Depends(verify_employee_role)
):
    """Create work log entry (employee only)"""
    try:
        supabase = get_supabase()
        
        # Get current user
        user_result = supabase.table("users").select("id").eq("clerk_id", employee_token["user_id"]).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = user_result.data[0]["id"]
        
        # Add employee_id to work log
        work_log["employee_id"] = user_id
        
        # Create work log
        result = supabase.table("work_logs").insert(work_log).execute()
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create work log: {str(e)}"
        )
