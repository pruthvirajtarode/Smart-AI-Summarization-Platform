import os
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
        # Truncate if too long
        max_chars = 60000
        if len(content) > max_chars:
            content = content[:max_chars] + "\n... [content truncated]"

        prompt = f"""Analyze the following {source_type} content:
---
{content}
---
Provide a structured JSON response with these keys:
1. "summary": Concise professional summary (200-300 words).
2. "detailed_summary": Comprehensive breakdown (500-800 words).
3. "key_points": List of 5-8 key bullet points.
4. "topics": List of top 5 topics covered.
5. "sentiment": Brief sentiment description (Positive/Neutral/Negative with explanation).
6. "keywords": List of 10-15 important keywords.
7. "actionable_insights": List of 5-8 actionable takeaways.

Response MUST be valid JSON only."""

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert content analyst. Respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )

        return json.loads(response.choices[0].message.content)

    @staticmethod
    async def chat_about_content(content: str, summary: str, user_message: str) -> str:
        """Chat about the analyzed content."""
        # Truncate content for context
        max_chars = 30000
        if len(content) > max_chars:
            content = content[:max_chars] + "\n...[truncated]"

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"""You are a helpful AI assistant. The user has uploaded a document and the following is its summary:

{summary}

Here is the full content for reference:
{content}

Answer the user's questions about this document accurately and concisely. If you don't know something from the content, say so."""},
                {"role": "user", "content": user_message}
            ],
            temperature=0.4,
            max_tokens=1000,
        )

        return response.choices[0].message.content

ai_service = AIService()
