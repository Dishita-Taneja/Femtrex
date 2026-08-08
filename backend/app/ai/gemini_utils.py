"""
Shared Gemini & Grok invocation utilities with retry + JSON-mode + graceful fallback.
"""
import time
import json
import logging
import urllib.request
import ssl
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger("femtrex.gemini_utils")

# Configure Gemini if key is provided
if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to configure Google GenAI: {e}")

# Model preference order for Gemini
_MODEL_CANDIDATES = [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
]

def _call_grok_json(prompt: str) -> dict | list | None:
    """Calls xAI Grok API with JSON response format using urllib.request."""
    key = settings.GROK_API_KEY
    if not key or not key.strip() or key.startswith("YOUR_"):
        return None

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    # Try standard Grok models
    models = ["grok-2-latest", "grok-2", "grok-beta"]
    for model in models:
        try:
            logger.info(f"Attempting Grok JSON call with model={model}")
            req = urllib.request.Request(
                "https://api.x.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json"
                },
                data=json.dumps({
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.0,
                    "response_format": {"type": "json_object"}
                }).encode("utf-8"),
                method="POST"
            )
            with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                content = body["choices"][0]["message"]["content"]
                return json.loads(content)
        except Exception as e:
            err_str = str(e)
            if hasattr(e, 'read'):
                try:
                    err_str = e.read().decode('utf-8')
                except Exception:
                    pass
            logger.warning(f"Grok JSON API call failed for model {model}: {err_str}")
            # If it's a credits or authorization issue, don't waste time on other models
            if "credits" in err_str or "balance" in err_str or "permission-denied" in err_str or "Forbidden" in err_str or "Unauthorized" in err_str:
                break
    return None

def _call_grok_text(prompt: str) -> str | None:
    """Calls xAI Grok API for text completion using urllib.request."""
    key = settings.GROK_API_KEY
    if not key or not key.strip() or key.startswith("YOUR_"):
        return None

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    models = ["grok-2-latest", "grok-2", "grok-beta"]
    for model in models:
        try:
            logger.info(f"Attempting Grok text call with model={model}")
            req = urllib.request.Request(
                "https://api.x.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json"
                },
                data=json.dumps({
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.0
                }).encode("utf-8"),
                method="POST"
            )
            with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                return body["choices"][0]["message"]["content"]
        except Exception as e:
            err_str = str(e)
            if hasattr(e, 'read'):
                try:
                    err_str = e.read().decode('utf-8')
                except Exception:
                    pass
            logger.warning(f"Grok text API call failed for model {model}: {err_str}")
            if "credits" in err_str or "balance" in err_str or "permission-denied" in err_str or "Forbidden" in err_str or "Unauthorized" in err_str:
                break
    return None

def _call_gemini_json(prompt: str, retries: int = 1, delay: int = 2) -> dict | list | None:
    """
    Calls the Gemini API with response_mime_type='application/json'.
    Falls back to Grok if Gemini is not configured or fails.
    Returns parsed dict/list, or None if all attempts fail.
    """
    if settings.GEMINI_API_KEY:
        for model_name in _MODEL_CANDIDATES:
            for attempt in range(retries + 1):
                try:
                    logger.info(f"Attempting Gemini JSON call with model={model_name}")
                    model = genai.GenerativeModel(
                        model_name,
                        generation_config={"response_mime_type": "application/json"}
                    )
                    response = model.generate_content(prompt)
                    return json.loads(response.text)
                except Exception as e:
                    err = str(e)
                    logger.warning(f"Gemini JSON error on {model_name}: {err}")
                    if "429" in err or "RESOURCE_EXHAUSTED" in err:
                        if attempt < retries:
                            time.sleep(delay)
                        continue
                    break

    # Fallback to Grok if Gemini key is missing or fails
    grok_res = _call_grok_json(prompt)
    if grok_res:
        return grok_res

    return None

def _call_gemini_text(prompt: str, retries: int = 1, delay: int = 2) -> str | None:
    """
    Calls Gemini for plain text output.
    Falls back to Grok if Gemini is not configured or fails.
    """
    if settings.GEMINI_API_KEY:
        for model_name in _MODEL_CANDIDATES:
            for attempt in range(retries + 1):
                try:
                    logger.info(f"Attempting Gemini text call with model={model_name}")
                    model = genai.GenerativeModel(model_name)
                    response = model.generate_content(prompt)
                    return response.text
                except Exception as e:
                    err = str(e)
                    logger.warning(f"Gemini text error on {model_name}: {err}")
                    if "429" in err or "RESOURCE_EXHAUSTED" in err:
                        if attempt < retries:
                            time.sleep(delay)
                        continue
                    break

    # Fallback to Grok if Gemini key is missing or fails
    grok_res = _call_grok_text(prompt)
    if grok_res:
        return grok_res

    return None
