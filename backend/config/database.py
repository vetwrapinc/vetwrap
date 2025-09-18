from supabase import create_client, Client
from config.settings import get_settings
import asyncio

settings = get_settings()

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

async def init_db():
    """Initialize database connection and create tables if needed"""
    try:
        # Test connection
        result = supabase.table("users").select("id").limit(1).execute()
        print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise

def get_supabase():
    """Get Supabase client instance"""
    return supabase

def get_supabase_admin():
    """Get Supabase admin client with service role key"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
