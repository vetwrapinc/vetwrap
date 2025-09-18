from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from routes import auth, admin, employee, client, projects, ai
from config.database import init_db
from config.settings import get_settings

settings = get_settings()

app = FastAPI(
    title="VetWraps Studios API",
    description="AI-enhanced SaaS platform for creative agency management",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(employee.router, prefix="/api/employee", tags=["Employee"])
app.include_router(client.router, prefix="/api/client", tags=["Client"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])

@app.get("/")
async def root():
    return {"message": "VetWraps Studios API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    await init_db()

# Vercel handler
def handler(request):
    return app(request.scope, request.receive, request.send)

