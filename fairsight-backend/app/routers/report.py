"""
FairSight AI — Report Router
POST /api/v1/report — Generate AI audit report via Google Gemini.
"""

import json
from fastapi import APIRouter, HTTPException
from app.schemas.report import ReportRequest, ReportResponse
from app.services.gemini_service import gemini_service

router = APIRouter(tags=["Report"])

# In-memory audit results cache (simple approach for hackathon)
# In production, this would read from the database
_audit_cache: dict[int, dict] = {}


def store_audit_result(audit_id: int, result: dict):
    """Store audit result for later report generation."""
    _audit_cache[audit_id] = result


def get_audit_result(audit_id: int) -> dict | None:
    """Retrieve stored audit result."""
    return _audit_cache.get(audit_id)


@router.post("/report", response_model=ReportResponse)
async def generate_report(request: ReportRequest):
    """
    Generate a plain-English AI audit report using Google Gemini.
    Accepts either audit_id (to use cached results) or inline metrics data.
    """
    try:
        # Get metrics data
        if request.metrics_json and request.group_stats_json:
            # Use inline data provided directly
            metrics_json = request.metrics_json
            group_stats_json = request.group_stats_json
            dataset_name = request.dataset_name or "Unknown Dataset"
            protected_attr = request.protected_attribute or "unknown"
            task_type = request.task_type or "classification"
        elif request.audit_id and request.audit_id in _audit_cache:
            # Use cached audit result
            cached = _audit_cache[request.audit_id]
            metrics_json = json.dumps(cached.get("metrics", []))
            group_stats_json = json.dumps(cached.get("group_stats", []))
            dataset_name = cached.get("dataset_name", "Unknown")
            protected_attr = cached.get("protected_attribute", "unknown")
            task_type = cached.get("task_type", "classification")
        else:
            raise HTTPException(
                status_code=400,
                detail="Please provide either metrics_json + group_stats_json, or a valid audit_id"
            )

        # Generate report via Gemini
        result = await gemini_service.generate_report(
            task_type=task_type,
            dataset_name=dataset_name,
            protected_attr=protected_attr,
            metrics_json=metrics_json,
            group_stats_json=group_stats_json,
        )

        return ReportResponse(
            report_text=result["report_text"],
            executive_summary=result["executive_summary"],
            model_used=result["model_used"],
            status=result["status"],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")
