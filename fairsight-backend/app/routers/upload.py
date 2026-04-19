"""
FairSight AI — Upload Router
POST /api/v1/upload — CSV dataset upload with column auto-detection.
Files are persisted in uploads/ directory for later analysis.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import uuid
import shutil
from app.services.dataset_service import dataset_service
from app.schemas.upload import UploadResponse

router = APIRouter(tags=["Upload"])

# Upload directory (relative to backend root)
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    """
    Upload a CSV dataset.
    Returns column names, data types, sample rows, and row count.
    File is persisted with a unique dataset_id for later analysis.
    """
    # Validate file type
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    # Generate unique dataset ID
    dataset_id = str(uuid.uuid4())[:8]

    try:
        # Save file persistently
        file_path = os.path.join(UPLOAD_DIR, f"{dataset_id}.csv")
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # Get file size
        file_size_bytes = os.path.getsize(file_path)

        # Parse with dataset_service
        df = dataset_service.parse_csv(file_path)

        # Get metadata
        columns = dataset_service.detect_columns(df)
        sample_rows = dataset_service.get_sample_rows(df, n=5)

        return UploadResponse(
            filename=file.filename,
            dataset_id=dataset_id,
            row_count=len(df),
            column_count=len(df.columns),
            columns=columns,
            sample_rows=sample_rows,
            file_size_bytes=file_size_bytes,
        )

    except Exception as e:
        # Clean up on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to process CSV file: {str(e)}")
