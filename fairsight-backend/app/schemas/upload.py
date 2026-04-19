"""
FairSight AI — Upload Schemas
Request/response models for dataset upload.
"""

from pydantic import BaseModel
from typing import Any, Optional


class UploadResponse(BaseModel):
    """Response after uploading a CSV dataset."""
    filename: str
    dataset_id: str                      # Unique ID to reference this dataset in analysis
    row_count: int
    column_count: int
    columns: list[dict[str, str]]        # [{name, dtype, original_type}]
    sample_rows: list[dict[str, Any]]    # First 5 rows for preview
    file_size_bytes: Optional[int] = None
