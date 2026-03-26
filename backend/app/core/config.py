import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Smart Content Analyzer"
    API_V1_STR: str = "/api/v1"
    
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "blogx") # User's requested DB
    
    # Environment detection for Vercel (or other serverless)
    IS_SERVERLESS: bool = os.getenv("VERCEL", "0") == "1"
    
    UPLOAD_DIR: str = "/tmp/uploads" if IS_SERVERLESS else os.getenv("UPLOAD_DIR", "uploads")
    TEMP_DIR: str = "/tmp/temp_audio" if IS_SERVERLESS else os.getenv("TEMP_DIR", "temp_audio")
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "mysupersecretkey")
    PORT: int = int(os.getenv("PORT", "4000"))
    
    # Ensure directories exist
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(TEMP_DIR, exist_ok=True)

settings = Settings()
