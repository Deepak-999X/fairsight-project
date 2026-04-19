"""
FairSight AI — Main Application
FastAPI app initialization, CORS, and router mounting.

Bias Detection & AI Fairness Auditing Platform
Solution Challenge 2026 — Unbiased AI Decision Track
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.utils.logger import logger

# Import routers
from app.routers import health, upload, analyze, report, history, datasets


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — runs on startup and shutdown."""
    logger.info("[START] FairSight AI starting up...")
    logger.info(f"   Environment: {settings.APP_ENV}")
    logger.info(f"   Database: {settings.DATABASE_URL.split('://')[0]}")
    logger.info(f"   AI Model: {settings.GEMINI_MODEL}")

    # Create database tables in development
    if settings.APP_ENV == "development":
        await init_db()
        logger.info("   Database tables created (dev mode)")

    logger.info("[OK] FairSight AI ready!")
    yield
    logger.info("[STOP] FairSight AI shutting down...")


# Create FastAPI application
app = FastAPI(
    title="FairSight AI",
    description=(
        "Bias Detection & AI Fairness Auditing Platform. "
        "Upload datasets, compute fairness metrics, and generate "
        "AI-powered audit reports with remediation recommendations."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fairsight-project.vercel.app",
                "https://fairsight-project-94ex01bev-sai-deepak-s-projects.vercel.app"

    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers under /api/v1/
API_PREFIX = "/api/v1"
app.include_router(health.router, prefix=API_PREFIX)
app.include_router(upload.router, prefix=API_PREFIX)
app.include_router(analyze.router, prefix=API_PREFIX)
app.include_router(report.router, prefix=API_PREFIX)
app.include_router(history.router, prefix=API_PREFIX)
app.include_router(datasets.router, prefix=API_PREFIX)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint — redirects to API docs."""
    return {
        "name": "FairSight AI",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
