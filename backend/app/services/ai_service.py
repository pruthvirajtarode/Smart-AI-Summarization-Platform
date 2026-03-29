import json
from openai import AsyncOpenAI
import os
from typing import Dict, Any
from backend.app.core.config import settings

class AIService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        if not self.api_key:
            raise ValueError("OpenAI API Key is missing in environment variables.")
        self.client = AsyncOpenAI(api_key=self.api_key)

    async def transcribe(self, audio_path: str) -> Dict[str, Any]:
        with open(audio_path, "rb") as audio_file:
            response = await self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
            # Response is text, not JSON
            return {"text": response}

    async def analyze_performance(self, transcript: str) -> Dict[str, Any]:
        prompt = f"""
        You are a senior pedagogical expert. Analyze the following teaching transcript and provide a highly detailed assessment.
        Your response MUST be in JSON format.
        
        Transcript: 
        \"\"\"{transcript}\"\"\"

        JSON Schema:
        {{
            "metrics": {{
                "clarity": 0-10,
                "engagement": 0-10,
                "depth": 0-10,
                "communication": 0-10,
                "overall": 0-100
            }},
            "style": {{
                "type": "Lecture" | "Interactive" | "Storytelling",
                "confidence": "High" | "Medium" | "Low",
                "speed": "Fast" | "Slow" | "Perfect"
            }},
            "strengths": ["list of 3 strengths"],
            "weaknesses": ["list of 3 weaknesses"],
            "suggestions": ["list of actionable suggestions"],
            "summary": "Brief summary of the teaching performance"
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a senior pedagogical expert."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            analysis_data = json.loads(response.choices[0].message.content)
            return analysis_data
        except Exception as e:
            print(f"Error in AI analysis: {e}")
            raise Exception(f"AI analysis failed: {str(e)}")
