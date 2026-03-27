import os
import requests
from .config import settings

class VideoService:
    """
    Lightweight video service compatible with Vercel serverless.
    No FFmpeg or yt-dlp required.
    - Uploaded video files: Sent directly to Whisper API (supports mp4, mov, mkv, webm)
    - Direct URL videos (S3, CDN): Downloaded via requests
    - YouTube: User must upload the video file directly
    """

    @staticmethod
    def download_youtube_audio(url: str) -> str:
        """Download video from a direct URL (not YouTube)."""
        output_path = os.path.join(settings.TEMP_DIR, "video_download.mp4")
        os.makedirs(settings.TEMP_DIR, exist_ok=True)
        try:
            # Prepend https:// if no scheme is provided
            if url and not url.startswith(('http://', 'https://')):
                url = 'https://' + url
                
            headers = {"User-Agent": "Mozilla/5.0"}
            with requests.get(url, stream=True, timeout=120, headers=headers) as r:
                r.raise_for_status()
                with open(output_path, "wb") as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
            return output_path
        except Exception as e:
            raise ValueError(
                f"Could not download video from URL. "
                f"For YouTube links, please download and upload the video file directly. "
                f"Error: {str(e)}"
            )

    @staticmethod
    def extract_audio_from_video(video_path: str) -> str:
        """
        Whisper API natively supports mp4, mov, mkv, webm, avi.
        No audio extraction needed — pass the video file directly.
        """
        return video_path

video_service = VideoService()
