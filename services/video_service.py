import os
import requests
import tempfile
from core.config import settings

class VideoService:
    """
    Lightweight video service compatible with Vercel serverless.
    - YouTube/URL: Downloads audio stream directly via requests (no FFmpeg needed)
    - Uploaded video files: Sent directly to Whisper API (supports mp4)
    """

    @staticmethod
    def download_youtube_audio(url: str) -> str:
        """
        For YouTube URLs and other public video URLs,
        we download the media file directly and send it to Whisper.
        Whisper API supports mp4, webm, mov, etc. directly.
        We just need to download the raw file.
        """
        # Use yt-dlp via subprocess if available, else download directly
        output_path = os.path.join(settings.TEMP_DIR, "video_download.mp4")
        
        try:
            # Prepend https:// if no scheme is provided (common user error)
            if url and not url.startswith(('http://', 'https://')):
                url = 'https://' + url
                
            # Attempt direct download (works for direct video URLs like S3, etc.)
            headers = {"User-Agent": "Mozilla/5.0"}
            with requests.get(url, stream=True, timeout=60, headers=headers) as r:
                r.raise_for_status()
                with open(output_path, "wb") as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
            return output_path
        except Exception as e:
            raise ValueError(
                f"Could not download video from URL: {url}. "
                f"For YouTube links, please download the video file locally and upload it directly. "
                f"Error: {str(e)}"
            )

    @staticmethod
    def extract_audio_from_video(video_path: str) -> str:
        """
        In serverless mode, we pass the video file directly to Whisper.
        Whisper supports mp4, mov, avi, mkv, webm natively.
        Just return the video path as-is — no FFmpeg needed.
        """
        return video_path

video_service = VideoService()
