from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.user import UserResponse, UserUpdate, UserRole
from models.project import ProjectResponse, ProjectCreate, ProjectUpdate
from routes.auth import verify_clerk_token
from config.database import get_supabase

router = APIRouter()

async def verify_admin_role(token_data: dict = Depends(verify_clerk_token)):
    """Verify user has admin role"""
    supabase = get_supabase()
    result = supabase.table("users").select("role").eq("clerk_id", token_data["user_id"]).execute()
    
    if not result.data or result.data[0]["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return token_data

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(admin_token: dict = Depends(verify_admin_role)):
    """Get all users (admin only)"""
    try:
        supabase = get_supabase()
        result = supabase.table("users").select("*").execute()
        return [UserResponse(**user) for user in result.data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get users: {str(e)}"
        )

@router.put("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    role: UserRole,
    admin_token: dict = Depends(verify_admin_role)
):
    """Update user role (admin only)"""
    try:
        supabase = get_supabase()
        result = supabase.table("users").update({"role": role}).eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(**result.data[0])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user role: {str(e)}"
        )

@router.get("/projects", response_model=List[ProjectResponse])
async def get_all_projects(admin_token: dict = Depends(verify_admin_role)):
    """Get all projects (admin only)"""
    try:
        supabase = get_supabase()
        result = supabase.table("projects").select("*, client:users!client_id(*), assigned_employee:users!assigned_employee_id(*)").execute()
        return [ProjectResponse(**project) for project in result.data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get projects: {str(e)}"
        )

@router.post("/projects", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    admin_token: dict = Depends(verify_admin_role)
):
    """Create new project (admin only)"""
    try:
        supabase = get_supabase()
        result = supabase.table("projects").insert(project.dict()).execute()
        return ProjectResponse(**result.data[0])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}"
        )

@router.get("/analytics", response_model=Dict[str, Any])
async def get_analytics(admin_token: dict = Depends(verify_admin_role)):
    """Get performance analytics (admin only)"""
    try:
        supabase = get_supabase()
        
        # Get project statistics
        projects_result = supabase.table("projects").select("status, created_at").execute()
        projects = projects_result.data
        
        # Get user statistics
        users_result = supabase.table("users").select("role, created_at").execute()
        users = users_result.data
        
        # Calculate metrics
        total_projects = len(projects)
        completed_projects = len([p for p in projects if p["status"] == "completed"])
        active_projects = len([p for p in projects if p["status"] in ["inquiry", "design", "review"]])
        
        total_users = len(users)
        admin_users = len([u for u in users if u["role"] == "admin"])
        employee_users = len([u for u in users if u["role"] == "employee"])
        client_users = len([u for u in users if u["role"] == "client"])
        
        return {
            "projects": {
                "total": total_projects,
                "completed": completed_projects,
                "active": active_projects,
                "completion_rate": completed_projects / total_projects if total_projects > 0 else 0
            },
            "users": {
                "total": total_users,
                "admins": admin_users,
                "employees": employee_users,
                "clients": client_users
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get analytics: {str(e)}"
        )

