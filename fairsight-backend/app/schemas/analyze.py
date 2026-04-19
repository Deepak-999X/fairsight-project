"""
FairSight AI — Analysis Schemas
Request/response models for bias analysis.
"""

from pydantic import BaseModel
from typing import Any, Optional


class MetricResult(BaseModel):
    """Result for a single bias metric."""
    name: str                    # e.g., "Demographic Parity Difference"
    abbreviation: str            # e.g., "DPD"
    value: float                 # The computed metric value
    severity: str                # "PASS" | "WARN" | "FAIL"
    threshold_pass: str          # e.g., "|x| < 0.1"
    description: str             # One-sentence plain-language explanation
    details: Optional[str] = None


class GroupStats(BaseModel):
    """Statistics for a single demographic group."""
    group_name: str
    group_size: int
    positive_rate: float
    accuracy: Optional[float] = None
    true_positive_rate: Optional[float] = None
    false_positive_rate: Optional[float] = None


class AnalyzeRequest(BaseModel):
    """Request to run bias analysis on uploaded data."""
    dataset_id: Optional[str] = None     # ID from upload, or None for sample datasets
    sample_dataset: Optional[str] = None # Name of preloaded sample dataset
    protected_attribute: str             # Column name (e.g., "sex")
    outcome_column: str                  # Column name (e.g., "income")
    task_type: str = "classification"    # "classification" | "regression"


class AnalyzeResponse(BaseModel):
    """Full bias analysis results."""
    audit_id: int
    dataset_name: str
    protected_attribute: str
    outcome_column: str
    task_type: str
    fairness_score: float           # 0-100
    letter_grade: str               # A-F
    metrics: list[MetricResult]
    group_stats: list[GroupStats]
    total_rows: int
    num_groups: int
