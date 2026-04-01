import uuid
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Request
from fastapi.responses import JSONResponse
import boto3
from botocore.exceptions import ClientError
from pydantic import BaseModel
from typing import Optional
import os
import shutil
import datetime
import aiofiles
from backend.app.services.video_service import VideoService
from backend.app.services.ai_service import AIService
from backend.app.core.config import settings

router = APIRouter()

# S3 configuration (use environment variables for credentials and bucket)
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET = os.getenv("S3_BUCKET_NAME")

def create_presigned_url(bucket_name, object_name, expiration=3600):
    """Generate a presigned URL to allow upload to S3"""
    s3_client = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )
    try:
        response = s3_client.generate_presigned_url('put_object',
                                                    Params={'Bucket': bucket_name, 'Key': object_name},
                                                    ExpiresIn=expiration)
    except ClientError as e:
        return None
    return response

# Endpoint to get a presigned S3 upload URL
@router.post("/s3-presigned-url")
async def get_presigned_url(filename: str):
    if not S3_BUCKET:
        return JSONResponse(status_code=500, content={"error": "S3_BUCKET_NAME not configured"})
    object_name = f"uploads/{filename}"
    url = create_presigned_url(S3_BUCKET, object_name)
    if not url:
        return JSONResponse(status_code=500, content={"error": "Could not generate presigned URL"})
    return {"url": url, "key": object_name}

class URLRequest(BaseModel):
    url: str

@router.post("/upload")
async def upload_video(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    job_id = str(uuid.uuid4())
    file_path = os.path.join(settings.UPLOAD_DIR, f"{job_id}_{file.filename}")
    
    # Use aiofiles to save the file without blocking the event loop
    async with aiofiles.open(file_path, "wb") as buffer:
        while content := await file.read(1048576): # 1MB chunks
            await buffer.write(content)
    
    # Initialize status in DB
    db = request.app.mongodb
    await db.jobs.insert_one({
        "job_id": job_id,
        "status": "processing",
        "progress": 0,
        "filename": file.filename,
        "type": "file",
        "created_at": datetime.datetime.utcnow()
    })
    
    # Start background processing
    background_tasks.add_task(
        process_video_task, 
        job_id, 
        file_path, 
        db
    )
    
    return {"job_id": job_id, "status": "started"}

@router.post("/url")
async def process_url(
    request: Request,
    background_tasks: BackgroundTasks,
    payload: URLRequest
):
    job_id = str(uuid.uuid4())
    url = payload.url
    
    # Initialize status in DB
    db = request.app.mongodb
    await db.jobs.insert_one({
        "job_id": job_id,
        "status": "processing",
        "progress": 0,
        "url": url,
        "type": "url",
        "created_at": datetime.datetime.utcnow()
    })
    
    # Start background processing
    background_tasks.add_task(
        process_url_task, 
        job_id, 
        url, 
        db
    )
    
    return {"job_id": job_id, "status": "started"}

@router.get("/status/{job_id}")
async def get_status(request: Request, job_id: str):
    db = request.app.mongodb
    job = await db.jobs.find_one({"job_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Remove _id for JSON serialization
    job.pop("_id", None)
    return job

@router.get("/result/{job_id}")
async def get_result(request: Request, job_id: str):
    db = request.app.mongodb
    job = await db.jobs.find_one({"job_id": job_id, "status": "completed"})
    if not job:
        raise HTTPException(status_code=404, detail="Result not ready or job not found")
    
    job.pop("_id", None)
    return job

@router.get("/history")
async def get_history(request: Request):
    db = request.app.mongodb
    cursor = db.jobs.find({"status": "completed"}).sort("created_at", -1)
    history = await cursor.to_list(length=100)
    for h in history:
        h.pop("_id", None)
    return history

# Task implementations
async def process_video_task(job_id, file_path, db):
    try:
        # Step 1: Update progress
        await db.jobs.update_one({"job_id": job_id}, {"$set": {"progress": 20, "message": "Extracting audio..."}})
        video_service = VideoService()
        audio_path = await video_service.extract_audio(file_path, job_id)
        
        # Step 2: Transcribe
        await db.jobs.update_one({"job_id": job_id}, {"$set": {"progress": 40, "message": "Transcribing speech..."}})
        ai_service = AIService()
        transcript_data = await ai_service.transcribe(audio_path)
        
        # Step 3: Analyze performance
        await db.jobs.update_one({"job_id": job_id}, {"$set": {"progress": 70, "message": "Analyzing performance..."}})
        analysis = await ai_service.analyze_performance(transcript_data["text"])
        
        # Step 4: Finalize
        await db.jobs.update_one({"job_id": job_id}, {
            "$set": {
                "status": "completed",
                "progress": 100,
                "message": "Analysis finished",
                "transcript": transcript_data["text"],
                "analysis": analysis
            }
        })
        
    except Exception as e:
        print(f"Error in task: {e}")
        await db.jobs.update_one({"job_id": job_id}, {"$set": {"status": "failed", "error": str(e)}})

async def process_url_task(job_id, url, db):
    # Similar to process_video_task, but first download the video
    try:
        await db.jobs.update_one({"job_id": job_id}, {"$set": {"progress": 10, "message": "Downloading video..."}})
        video_service = VideoService()
        file_path = await video_service.download_from_url(url, job_id)
        await process_video_task(job_id, file_path, db)
    except Exception as e:
        print(f"Error in task: {e}")
        await db.jobs.update_one({"job_id": job_id}, {"$set": {"status": "failed", "error": str(e)}})
