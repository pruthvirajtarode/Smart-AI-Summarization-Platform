import os
import subprocess
import yt_dlp
from typing import Optional

class VideoService:
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = upload_dir
        if not os.path.exists(self.upload_dir):
            os.makedirs(self.upload_dir)

    async def download_from_url(self, url: str, job_id: str) -> str:
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'outtmpl': os.path.join(self.upload_dir, f"{job_id}_video.%(ext)s"),
            'quiet': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            return filename

    async def extract_audio(self, video_path: str, job_id: str) -> str:
        audio_path = os.path.join(self.upload_dir, f"{job_id}_audio.mp3")
        
        # Use ffmpeg via subprocess for more control and reliability
        command = [
            "ffmpeg",
            "-i", video_path,
            "-vn",          # Extract audio only
            "-ar", "16000", # Audio sample rate
            "-ac", "1",     # Mono
            "-ab", "128k",  # Bitrate
            "-y",           # Overwrite if exists
            audio_path
        ]
        
        try:
            process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout, stderr = process.communicate()
            
            if process.returncode != 0:
                print(f"FFmpeg error: {stderr.decode()}")
                # If FFmpeg fails, try moviepy as fallback
                try:
                    from moviepy.editor import VideoFileClip
                    video = VideoFileClip(video_path)
                    video.audio.write_audiofile(audio_path, bitrate="128k")
                    return audio_path
                except Exception as e:
                    raise Exception(f"Failed to extract audio using FFmpeg and MoviePy: {e}")
            
            return audio_path
        except Exception as e:
            raise Exception(f"Failed to extract audio: {e}")
