import json
from openai import AsyncOpenAI
from core.config import settings

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
        # Aggressive truncation for speed
        if len(content) > 15000:
            content = content[:15000] + "\n...[truncated]"

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Analyze content. Return JSON only."},
                {"role": "user", "content": f"""Analyze this {source_type}:

{content}

Return JSON with: "summary" (150 words), "detailed_summary" (300 words), "key_points" (5 items), "topics" (5 items), "sentiment" (one line), "keywords" (10 items), "actionable_insights" (5 items). JSON only."""}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=2000,
        )

        return json.loads(response.choices[0].message.content)

    @staticmethod
    async def chat_about_content(content: str, summary: str, user_message: str) -> str:
        if len(content) > 10000:
            content = content[:10000] + "\n...[truncated]"

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"You are a helpful assistant. Answer questions about this document.\n\nSummary: {summary}\n\nContent: {content}"},
                {"role": "user", "content": user_message}
            ],
            temperature=0.3,
            max_tokens=500,
        )

        return response.choices[0].message.content

ai_service = AIService()
