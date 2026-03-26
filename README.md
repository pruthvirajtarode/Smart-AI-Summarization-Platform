# Smart Content Analyzer 🚀

A high-performance AI-powered platform to extract, transcribe, and analyze content from videos (including YouTube), PDFs, and DOCX documents.

## ✨ Features

- 🎥 **Video Intelligence**: Full transcription using OpenAI Whisper.
- 🔗 **YouTube Extraction**: Support for public video links via `yt-dlp`.
- 📄 **Document Processing**: Deep text extraction from PDF and DOCX.
- 🤖 **AI-Driven Insights**: Powered by GPT-4o for:
  - Concise & Detailed Summaries
  - Key Highlights & Topics
  - Sentiment Analysis & Keywords
  - Actionable Takeaways
- 📊 **Modern Dashboard**: Responsive React UI with Glassmorphism and Framer Motion animations.
- 📜 **History Management**: Keep track of all processed content.
- 🌑 **Premium Dark Mode**: Optimized for high-end visual experience.

## 🛠 Tech Stack

- **Backend**: FastAPI (Python), MongoDB, OpenAI (Whisper & GPT-4o), FFmpeg, yt-dlp.
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Framer Motion.

## 🚀 Quick Start & Deployment

### 💻 Local Development
1. **Backend**:
   - Install dependencies: `pip install -r backend/requirements.txt`.
   - Setup `.env` (already contains your MongoDB Atlas and OpenAI keys).
   - Run: `uvicorn backend.app.main:app --reload`.
2. **Frontend**:
   - `cd frontend && npm install && npm run dev`.

### ☁️ Vercel Deployment (Client Ready)
I have prepared a `vercel.json` for **instant monorepo deployment**.
1. Connect this repository to Vercel.
2. Ensure the following environment variables are set in the Vercel Dashboard:
   - `OPENAI_API_KEY`
   - `MONGODB_URL`
   - `JWT_SECRET`
3. Vercel will automatically build the React frontend and deploy the FastAPI backend as a set of serverless functions.

> [!IMPORTANT]
> **Serverless Limitation**: Vercel functions have a timeout (usually 10s-30s depending on plan). For very long videos, processing might hit this timeout. For production-scale video processing, we recommend a VPS (DigitalOcean, AWS) or a specialized task queue (Celery/Redis).

> [!TIP]
> **Database**: Your provide MongoDB Atlas (`cluster0.tmlhoql.mongodb.net/blogx`) is now the default database for the entire platform. ALL analysis history will be stored there.

## 📐 Architecture
- **Frontend**: Vite + React + Tailwind + Framer Motion.
- **Backend API**: FastAPI.
- **Persistence**: MongoDB Atlas.
- **AI Engines**: OpenAI GPT-4o & Whisper.

The system uses a **decoupled asynchronous architecture**. When a user uploads a file or submits a URL, the FastAPI backend:
1. Validates the input and creates a process record in MongoDB.
2. Spawns a `BackgroundTasks` worker to handle processing (Video/Audio extraction, AI Analysis).
3. The frontend polls the status endpoint to provide real-time feedback.
4. Once completed, the full analysis is stored and displayed.

## 🛡 Security & Best Practices

- **Scalable Storage**: Pre-configured for local file storage, easily portable to AWS S3.
- **Robust Exception Handling**: Graceful error management for large files and API timeouts.
- **Modern UI Patterns**: Uses `framer-motion` for layout transitions and `lucide-react` for semantic icons.

---
*Created with ❤️ by Antigravity*
