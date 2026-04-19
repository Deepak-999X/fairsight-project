"""
FairSight AI — Health Check Router
GET /api/v1/health — uptime monitoring for Railway.
"""

from datetime import datetime, timezone
from fastapi import APIRouter
from app.schemas.health import HealthResponse
from app.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for uptime monitoring."""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        environment=settings.APP_ENV,
        timestamp=datetime.now(timezone.utc),
    )
