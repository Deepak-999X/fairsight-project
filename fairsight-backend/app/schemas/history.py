"""
FairSight AI — History Schemas
Request/response models for audit history.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AuditSummary(BaseModel):
    """Summary of a past audit for the history list."""
    id: int
    dataset_name: str
    protected_attribute: str
    fairness_score: Optional[float]
    letter_grade: Optional[str]
    created_at: datetime


class AuditHistoryResponse(BaseModel):
    """List of past audits."""
    audits: list[AuditSummary]
    total_count: int
