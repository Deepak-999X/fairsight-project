"""
FairSight AI — Report Schemas
Request/response models for AI-generated audit reports.
"""

from pydantic import BaseModel
from typing import Optional


class ReportRequest(BaseModel):
    """Request to generate an AI audit report."""
    audit_id: Optional[int] = None
    # Inline data (alternative to audit_id)
    metrics_json: Optional[str] = None
    group_stats_json: Optional[str] = None
    dataset_name: Optional[str] = None
    protected_attribute: Optional[str] = None
    task_type: Optional[str] = "classification"


class ReportResponse(BaseModel):
    """AI-generated audit report response."""
    report_text: str
    executive_summary: str
    model_used: str
    status: str  # "success" or "fallback"
