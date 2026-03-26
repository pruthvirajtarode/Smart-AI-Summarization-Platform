from fastapi import FastAPI, BackgroundTasks, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from .core.config import settings
from .core.database import connect_to_mongo, close_mongo_connection, db
from .services.video_service import video_service
from .services.doc_service import doc_service
from .services.ai_service import ai_service
from .services.report_service import report_service
import os
import uuid
import datetime

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/")
async def root():
    return {"message": "Welcome to Smart Content Analyzer API"}

@app.post("/api/v1/process/video")
async def process_video(
    background_tasks: BackgroundTasks,
    video_file: UploadFile = File(None),
    video_url: str = Form(None)
):
    if not video_file and not video_url:
        raise HTTPException(status_code=400, detail="Either video_file or video_url is required")
        
    process_id = str(uuid.uuid4())
    video_path = None
    
    if video_file:
        safe_name = f"{process_id}_{video_file.filename}"
        video_path = os.path.join(settings.UPLOAD_DIR, safe_name)
        with open(video_path, "wb") as f:
            f.write(await video_file.read())
    
    # Store initial record
    await db.db.uploads.insert_one({
        "process_id": process_id,
        "type": "video",
        "video_url": video_url,
        "filename": video_file.filename if video_file else None,
        "status": "processing",
        "created_at": datetime.datetime.now()
    })

    background_tasks.add_task(handle_video_processing, process_id, video_path, video_url)
    return {"process_id": process_id, "message": "Video processing started"}

@app.post("/api/v1/process/document")
async def process_document(
    background_tasks: BackgroundTasks,
    doc_file: UploadFile = File(...)
):
    process_id = str(uuid.uuid4())
    
    # Save file
    safe_name = f"{process_id}_{doc_file.filename}"
    save_path = os.path.join(settings.UPLOAD_DIR, safe_name)
    with open(save_path, "wb") as f:
        f.write(await doc_file.read())
        
    # Store initial record
    await db.db.uploads.insert_one({
        "process_id": process_id,
        "type": "document",
        "filename": doc_file.filename,
        "status": "processing",
        "created_at": datetime.datetime.now()
    })

    background_tasks.add_task(handle_doc_processing, process_id, save_path)
    return {"process_id": process_id, "message": "Document processing started"}

@app.get("/api/v1/uploads")
async def get_history():
    cursor = db.db.uploads.find().sort("created_at", -1).limit(20)
    history = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        history.append(doc)
    return history

@app.get("/api/v1/status/{process_id}")
async def get_status(process_id: str):
    record = await db.db.uploads.find_one({"process_id": process_id})
    if not record:
        raise HTTPException(status_code=404, detail="Process not found")
    record["_id"] = str(record["_id"])
    return record

# Helper background task functions
async def handle_video_processing(process_id, video_path=None, video_url=None):
    try:
        audio_path = ""
        if video_url:
            audio_path = video_service.download_youtube_audio(video_url)
        else:
            # Video was already saved at video_path
            # Extract audio
            audio_path = video_service.extract_audio_from_video(video_path)
            
        # Transcribe
        transcript = await ai_service.transcribe_audio(audio_path)
        
        # Analyze
        analysis = await ai_service.analyze_content(transcript, "video transcript")
        
        # Update DB
        await db.db.uploads.update_one(
            {"process_id": process_id},
            {"$set": {
                "status": "completed",
                "transcript": transcript,
                "analysis": analysis,
                "updated_at": datetime.datetime.now()
            }}
        )
        # Cleanup audio
        if os.path.exists(audio_path):
            os.remove(audio_path)
            
    except Exception as e:
        print(f"Error processing video {process_id}: {e}")
        await db.db.uploads.update_one(
            {"process_id": process_id},
            {"$set": {"status": "failed", "error": str(e)}}
        )

async def handle_doc_processing(process_id, filepath):
    try:
        # Extract text
        content = doc_service.extract_text_from_file(filepath)
        
        # Analyze
        analysis = await ai_service.analyze_content(content, "document")
        
        # Update DB
        await db.db.uploads.update_one(
            {"process_id": process_id},
            {"$set": {
                "status": "completed",
                "content": content,
                "analysis": analysis,
                "updated_at": datetime.datetime.now()
            }}
        )
    except Exception as e:
        print(f"Error processing document {process_id}: {e}")
        await db.db.uploads.update_one(
            {"process_id": process_id},
            {"$set": {"status": "failed", "error": str(e)}}
        )

@app.get("/api/v1/download/{process_id}")
async def download_report(process_id: str):
    record = await db.db.uploads.find_one({"process_id": process_id})
    if not record or record.get("status") != "completed":
        raise HTTPException(status_code=404, detail="Analysis report not ready or not found")
    
    filename = record.get("filename") or (record.get("video_url") if record.get("type") == "video" else "Digital Content")
    
    # Generate PDF
    pdf_path = report_service.generate_pdf_report(record["analysis"], filename, process_id)
    
    return FileResponse(
        path=pdf_path, 
        filename=f"Analysis_Report_{process_id}.pdf",
        media_type='application/pdf'
    )
