import logging
from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.firestore import seed_database, verify_firestore_connectivity
from app.db.chroma import verify_chroma_connectivity
from app.ai.gemini import verify_gemini_connectivity

from app.routers import schemes, passport, mentors, micro_mentorship, copilot

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("femtrex.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Femtrex FastAPI Backend...")
    # Seed mock data into Firestore or memory on startup
    await seed_database()
    yield
    logger.info("Stopping Femtrex FastAPI Backend...")

app = FastAPI(
    title="Femtrex Backend Services",
    description="FastAPI Service Architecture for Femtrex AI Co-founder Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Vite dev server (localhost:5173), Next.js dev (localhost:3000) & prod origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers (Flat prefixes)
app.include_router(schemes.router)
app.include_router(passport.router)
app.include_router(mentors.router)

# Include API Routers (/api prefixes for compatibility)
app.include_router(schemes.router, prefix="/api")
app.include_router(passport.router, prefix="/api")
app.include_router(mentors.router, prefix="/api")
app.include_router(micro_mentorship.router)
app.include_router(copilot.router)

@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint — redirects to the interactive API docs."""
    return RedirectResponse(url="/docs")


@app.get("/health")
async def health_check():
    """
    GET /health - Verifies Firestore, ChromaDB, and Gemini API are reachable
    and returns {"status": "ok"}.
    """
    firestore_ok = await verify_firestore_connectivity()
    chroma_ok = verify_chroma_connectivity()
    gemini_ok = await verify_gemini_connectivity()

    services_status = {
        "firestore": "reachable" if firestore_ok else "unreachable",
        "chromadb": "reachable" if chroma_ok else "unreachable",
        "gemini": "reachable" if gemini_ok else "unreachable"
    }

    if not (firestore_ok and chroma_ok and gemini_ok):
        logger.error(f"Health check failed: {services_status}")
        raise HTTPException(
            status_code=503,
            detail={
                "status": "unhealthy",
                "services": services_status
            }
        )

    return {
        "status": "ok",
        "services": services_status
    }
