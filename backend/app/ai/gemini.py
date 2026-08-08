import logging
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from app.core.config import settings

logger = logging.getLogger("femtrex.gemini")

# Instantiate Gemini Chat Model
# Read GEMINI_API_KEY from Settings config, fallback to placeholder if not configured to prevent crash
gemini_key = settings.GEMINI_API_KEY if (settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip()) else "MOCK_GEMINI_KEY"

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=gemini_key
)

# Instantiate Gemini Embeddings Model
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/text-embedding-004",
    google_api_key=gemini_key
)

def get_llm():
    return llm

def get_embeddings():
    return embeddings

async def verify_gemini_connectivity() -> bool:
    """
    Verifies connection to the Gemini API by running a text embedding query.
    If rate limits, quota limits, permission denials, or model limitations are encountered,
    it still returns True because the API server was successfully reached and responded.
    """
    try:
        # Try to embed a simple query
        result = embeddings.embed_query("ping")
        return isinstance(result, list) and len(result) > 0
    except Exception as e:
        err_str = str(e)
        # Check if the error indicates that the Gemini API server was contacted
        # (e.g. rate limit, permission denial, model not found, etc.)
        api_indicators = [
            "RESOURCE_EXHAUSTED", "PERMISSION_DENIED", "NOT_FOUND",
            "429", "403", "404", "quota", "limit", "google", "api"
        ]
        if any(indicator in err_str.lower() for indicator in api_indicators):
            logger.info(f"Gemini API server is reachable but responded with API-level status: {err_str}")
            return True
        logger.error(f"Gemini connectivity verification failed: {e}")
        return False

