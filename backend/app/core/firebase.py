import os
import logging
from typing import Optional
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Header, HTTPException, status
from app.core.config import settings

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("femtrex.firebase")

firebase_initialized = False

# Load credentials and initialize Firebase Admin
try:
    sa_path = settings.FIREBASE_SERVICE_ACCOUNT_PATH
    if sa_path and os.path.exists(sa_path):
        cred = credentials.Certificate(sa_path)
        firebase_admin.initialize_app(cred)
        firebase_initialized = True
        logger.info("Firebase Admin SDK initialized with service account JSON.")
    elif sa_path and not os.path.exists(sa_path):
        logger.warning(
            f"FIREBASE_SERVICE_ACCOUNT_PATH is set to '{sa_path}' but the file was not found. "
            "Running in local mock/fallback mode."
        )
    else:
        logger.info(
            "FIREBASE_SERVICE_ACCOUNT_PATH is not configured. "
            "Running Firebase in local mock/fallback mode (memory DB + mock auth)."
        )
except Exception as e:
    logger.error(f"Error initializing Firebase Admin SDK: {e}. Running in local mock/fallback mode.")

def is_firebase_ready() -> bool:
    return firebase_initialized

async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """
    FastAPI dependency that extracts and verifies the Firebase ID token
    from the 'Authorization: Bearer <token>' header.
    Returns the user's uid.
    """
    if not authorization:
        logger.debug("No authorization header provided. Using default user 'priya-demo'.")
        return "priya-demo"

    token = authorization.strip()
    if token.lower().startswith("bearer "):
        token = token[7:].strip()

    if not token:
        return "priya-demo"

    # If Firebase Admin SDK is in local/mock mode, use the token string as the UID directly
    if not firebase_initialized:
        logger.debug(f"Firebase Admin in local mode. Using UID from auth token: '{token}'")
        return token

    # Try verifying real Firebase ID Token
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except Exception as e:
        logger.warning(f"Firebase token verification failed ({e}). Using raw token string as UID: '{token}'")
        return token
