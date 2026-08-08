import os
import logging
import chromadb
from app.core.config import settings

logger = logging.getLogger("femtrex.chroma")

chroma_client = None

try:
    persist_dir = settings.chroma_dir
    os.makedirs(persist_dir, exist_ok=True)
    chroma_client = chromadb.PersistentClient(
        path=persist_dir,
        settings=chromadb.Settings(anonymized_telemetry=False)
    )
    logger.info(f"ChromaDB PersistentClient initialized at: {persist_dir}")
except Exception as e:
    logger.error(f"Failed to initialize Persistent ChromaDB: {e}. Falling back to EphemeralClient.")
    try:
        chroma_client = chromadb.EphemeralClient(
            settings=chromadb.Settings(anonymized_telemetry=False)
        )
    except Exception as inner_e:
        logger.critical(f"Failed to initialize Ephemeral ChromaDB as well: {inner_e}")

def get_chroma_client():
    return chroma_client

def get_or_create_collection(name: str):
    """
    Get or create a ChromaDB collection.
    """
    client = get_chroma_client()
    if not client:
        raise RuntimeError("ChromaDB client is not initialized.")
    return client.get_or_create_collection(name)

def verify_chroma_connectivity() -> bool:
    """
    Checks the status of ChromaDB by hitting heartbeat.
    """
    client = get_chroma_client()
    if not client:
        return False
    try:
        # heartbeat returns timestamp if active, or raises exception
        heartbeat_val = client.heartbeat()
        return heartbeat_val is not None
    except Exception as e:
        logger.error(f"ChromaDB heartbeat verification failed: {e}")
        return False
