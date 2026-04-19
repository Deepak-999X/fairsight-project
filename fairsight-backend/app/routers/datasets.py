"""
FairSight AI — Datasets Router
GET /api/v1/datasets/samples — List preloaded sample datasets with metadata.
"""

from fastapi import APIRouter
from app.services.sample_data import SAMPLE_DATASETS

router = APIRouter(tags=["Datasets"])


@router.get("/datasets/samples")
async def list_sample_datasets():
    """
    List available preloaded sample datasets for demo mode.
    Returns dataset names, descriptions, and default column configurations.
    """
    samples = []
    for key, config in SAMPLE_DATASETS.items():
        samples.append({
            "id": key,
            "name": config["name"],
            "description": config["description"],
            "protected_attribute": config["protected_attr"],
            "outcome_column": config["outcome_col"],
            "task_type": config["task_type"],
        })
    return {"datasets": samples}
