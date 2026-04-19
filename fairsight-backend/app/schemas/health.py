"""
FairSight AI — Health Check Schema
"""

from pydantic import BaseModel
from datetime import datetime


class HealthResponse(BaseModel):
    """Response schema for the health check endpoint."""
    status: str = "healthy"
    version: str = "1.0.0"
    environment: str = "development"
    timestamp: datetime
