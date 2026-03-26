import os
import yt_dlp
from moviepy.editor import VideoFileClip
from ..core.config import settings

class VideoService:
    @staticmethod
    def download_youtube_audio(url: str) -> str:
        output_tmpl = os.path.join(settings.TEMP_DIR, "%(id)s.%(ext)s")
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': output_tmpl,
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'quiet': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            video_id = info['id']
            # After extraction, it will be .mp3
            return os.path.join(settings.TEMP_DIR, f"{video_id}.mp3")

    @staticmethod
    def extract_audio_from_video(video_path: str) -> str:
        filename = os.path.basename(video_path)
        audio_name = os.path.splitext(filename)[0] + ".mp3"
        audio_path = os.path.join(settings.TEMP_DIR, audio_name)
        
        video = VideoFileClip(video_path)
        video.audio.write_audiofile(audio_path, verbose=False, logger=None)
        video.close()
        
        return audio_path

video_service = VideoService()
