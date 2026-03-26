import os
from openai import AsyncOpenAI
from ..core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

class AIService:
    @staticmethod
    async def transcribe_audio(audio_path: str) -> str:
        with open(audio_path, "rb") as f:
            transcript = await client.audio.transcriptions.create(
                model="whisper-1", 
                file=f
            )
            return transcript.text

    @staticmethod
    async def analyze_content(content: str, source_type: str) -> dict:
        prompt = f"""
        Analyze the following {source_type} content:
        ---
        {content}
        ---
        Please provide a structured response in JSON format including:
        1. "summary": A concise and professional summary (approx 200-300 words).
        2. "detailed_summary": A more comprehensive breakdown (approx 500-1000 words).
        3. "key_points": A list of 5-10 key bullet points.
        4. "topics": A list of top 5 topics covered.
        5. "sentiment": A brief description of the sentiment (Positive, Neutral, Negative with explanation).
        6. "keywords": A list of 10-15 important keywords.
        7. "actionable_insights": A list of 5-10 actionable takeaways or next steps.
        
        Response MUST be valid JSON.
        """
        
        # GPT-4o typically handles long context well. For very long docs, 
        # a more sophisticated approach like map-reduce could be used.
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": "You are an expert content analyst."},
                      {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        import json
        return json.loads(response.choices[0].message.content)

ai_service = AIService()
