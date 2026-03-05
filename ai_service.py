import json
import os
from typing import Any, Dict

import httpx


DO_BASE_URL = os.getenv("DO_INFERENCE_BASE_URL", "https://inference.do-ai.run/v1")
DO_API_KEY = os.getenv("DIGITALOCEAN_INFERENCE_KEY", "")
DO_MODEL = os.getenv("DO_INFERENCE_MODEL", "meta-llama/Meta-Llama-3.1-8B-Instruct")


class AIServiceError(Exception):
    pass


async def chat_completion(system_prompt: str, user_prompt: str, temperature: float = 0.2) -> Dict[str, Any]:
    if not DO_API_KEY:
        raise AIServiceError("DIGITALOCEAN_INFERENCE_KEY is not set")

    headers = {
        "Authorization": f"Bearer {DO_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": DO_MODEL,
        "temperature": temperature,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }

    url = f"{DO_BASE_URL}/chat/completions"

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, headers=headers, json=payload)

    if response.status_code >= 400:
        raise AIServiceError(f"Inference API error: {response.status_code} - {response.text}")

    data = response.json()
    try:
        content = data["choices"][0]["message"]["content"]
        return json.loads(content)
    except Exception as exc:
        raise AIServiceError(f"Invalid inference response format: {exc}")
