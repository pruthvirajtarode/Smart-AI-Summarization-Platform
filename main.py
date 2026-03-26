from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from core.config import settings
from core.database import connect_to_mongo, close_mongo_connection, db
from services.video_service import video_service
from services.doc_service import doc_service
from services.ai_service import ai_service
from services.report_service import report_service
import os
import io
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

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/api/v1/process/video")
async def process_video(
    video_file: UploadFile = File(None),
    video_url: str = Form(None)
):
    if not video_file and not video_url:
        raise HTTPException(status_code=400, detail="Either video_file or video_url is required")
        
    process_id = str(uuid.uuid4())
    video_path = None
    
    if video_file:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        safe_name = f"{process_id}_{video_file.filename}"
        video_path = os.path.join(settings.UPLOAD_DIR, safe_name)
        with open(video_path, "wb") as f:
            f.write(await video_file.read())
    
    await db.db.uploads.insert_one({
        "process_id": process_id,
        "type": "video",
        "video_url": video_url,
        "filename": video_file.filename if video_file else None,
        "status": "processing",
        "created_at": datetime.datetime.now()
    })

    # Await processing directly because Vercel Serverless kills BackgroundTasks
    await handle_video_processing(process_id, video_path, video_url)
    return {"process_id": process_id, "message": "Video processing completed"}

@app.post("/api/v1/process/document")
async def process_document(
    doc_file: UploadFile = File(...)
):
    process_id = str(uuid.uuid4())
    
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_name = f"{process_id}_{doc_file.filename}"
    save_path = os.path.join(settings.UPLOAD_DIR, safe_name)
    with open(save_path, "wb") as f:
        f.write(await doc_file.read())
        
    await db.db.uploads.insert_one({
        "process_id": process_id,
        "type": "document",
        "filename": doc_file.filename,
        "status": "processing",
        "created_at": datetime.datetime.now()
    })

    # Await processing directly because Vercel Serverless kills BackgroundTasks
    await handle_doc_processing(process_id, save_path)
    return {"process_id": process_id, "message": "Document processing completed"}

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

async def handle_video_processing(process_id, video_path=None, video_url=None):
    try:
        media_path = ""
        if video_url:
            # For direct URLs (S3, CDN), download the file
            media_path = video_service.download_video_from_url(video_url)
        else:
            # Whisper API supports video files directly (mp4, mov, mkv, webm)
            media_path = video_service.extract_audio_from_video(video_path)
            
        transcript = await ai_service.transcribe_audio(media_path)
        analysis = await ai_service.analyze_content(transcript, "video transcript")
        
        await db.db.uploads.update_one(
            {"process_id": process_id},
            {"$set": {
                "status": "completed",
                "transcript": transcript,
                "analysis": analysis,
                "updated_at": datetime.datetime.now()
            }}
        )
        if media_path and os.path.exists(media_path):
            os.remove(media_path)
            
    except Exception as e:
        print(f"Error processing video {process_id}: {e}")
        await db.db.uploads.update_one(
            {"process_id": process_id},
            {"$set": {"status": "failed", "error": str(e)}}
        )

async def handle_doc_processing(process_id, filepath):
    try:
        content = doc_service.extract_text_from_file(filepath)
        analysis = await ai_service.analyze_content(content, "document")
        
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
    
    filename = record.get("filename") or "Content Analysis"
    # Generate PDF as bytes in memory (no filesystem needed)
    pdf_bytes = report_service.generate_pdf_bytes(record["analysis"], filename, process_id)
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type='application/pdf',
        headers={"Content-Disposition": f'attachment; filename="Analysis_Report_{process_id}.pdf"'}
    )

# --- Chat with AI ---
class ChatRequest(BaseModel):
    message: str

@app.post("/api/v1/chat/{process_id}")
async def chat_with_ai(process_id: str, req: ChatRequest):
    record = await db.db.uploads.find_one({"process_id": process_id})
    if not record or record.get("status") != "completed":
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Build context from the document content and analysis
    doc_content = record.get("content") or record.get("transcript") or ""
    analysis = record.get("analysis", {})
    summary = analysis.get("summary", "")
    
    answer = await ai_service.chat_about_content(doc_content, summary, req.message)
    return {"reply": answer}
