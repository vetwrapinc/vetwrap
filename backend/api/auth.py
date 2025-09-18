from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import httpx
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import get_settings
from config.database import get_supabase
from models.user import UserCreate, UserResponse, UserUpdate

router = APIRouter()
security = HTTPBearer()
settings = get_settings()

async def verify_clerk_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Clerk JWT token"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.clerk.dev/v1/sessions/{credentials.credentials}/verify",
                headers={"Authorization": f"Bearer {settings.CLERK_SECRET_KEY}"}
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed"
        )

@router.post("/webhook", response_model=dict)
async def clerk_webhook(payload: dict):
    """Handle Clerk webhook events for user creation/updates"""
    try:
        event_type = payload.get("type")
        
        if event_type == "user.created":
            user_data = payload.get("data")
            user_create = UserCreate(
                clerk_id=user_data["id"],
                email=user_data["email_addresses"][0]["email_address"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                role="client"  # Default role, can be updated by admin
            )
            
            supabase = get_supabase()
            result = supabase.table("users").insert(user_create.dict()).execute()
            
            return {"status": "success", "user_id": result.data[0]["id"]}
        
        return {"status": "ignored"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook processing failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user(token_data: dict = Depends(verify_clerk_token)):
    """Get current user information"""
    try:
        clerk_id = token_data["user_id"]
        supabase = get_supabase()
        
        result = supabase.table("users").select("*").eq("clerk_id", clerk_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(**result.data[0])
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user: {str(e)}"
        )

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    token_data: dict = Depends(verify_clerk_token)
):
    """Update current user information"""
    try:
        clerk_id = token_data["user_id"]
        supabase = get_supabase()
        
        # Update user
        result = supabase.table("users").update(
            user_update.dict(exclude_unset=True)
        ).eq("clerk_id", clerk_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(**result.data[0])
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )

