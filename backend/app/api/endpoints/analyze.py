import uuid
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import os
import shutil
import datetime
from backend.app.services.video_service import VideoService
from backend.app.services.ai_service import AIService
from backend.app.core.config import settings

router = APIRouter()

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
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
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
