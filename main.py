import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import motor.motor_asyncio

# Ensure local imports work correctly in both root and subdirectories
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.app.api.api import api_router
from backend.app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Database connection
@app.on_event("startup")
async def startup_db_client():
    # Load env vars first
    mongodb_url = os.getenv("MONGODB_URL", settings.MONGODB_URL)
    database_name = os.getenv("DATABASE_NAME", settings.DATABASE_NAME)
    
    app.mongodb_client = motor.motor_asyncio.AsyncIOMotorClient(mongodb_url)
    app.mongodb = app.mongodb_client[database_name]
    
    # Ensure upload directory exists
    if not os.path.exists(settings.UPLOAD_DIR):
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()
