"""
FairSight AI — History Router
GET /api/v1/history — List past audits.
GET /api/v1/history/{id} — Get specific audit details.
"""

from fastapi import APIRouter, HTTPException
from app.routers.report import _audit_cache

router = APIRouter(tags=["History"])

# In-memory history (simple approach for hackathon)
_audit_history: list[dict] = []


def add_to_history(audit_data: dict):
    """Store an audit result in history."""
    _audit_history.append(audit_data)


@router.get("/history")
async def list_audits():
    """List all past audit results."""
    summaries = []
    for audit in reversed(_audit_history):  # Most recent first
        summaries.append({
            "audit_id": audit.get("audit_id"),
            "dataset_name": audit.get("dataset_name"),
            "protected_attribute": audit.get("protected_attribute"),
            "fairness_score": audit.get("fairness_score"),
            "letter_grade": audit.get("letter_grade"),
            "task_type": audit.get("task_type"),
            "total_rows": audit.get("total_rows"),
            "num_groups": audit.get("num_groups"),
        })
    return {"audits": summaries, "total": len(summaries)}


@router.get("/history/{audit_id}")
async def get_audit(audit_id: int):
    """Get detailed results for a specific audit."""
    for audit in _audit_history:
        if audit.get("audit_id") == audit_id:
            return audit
    raise HTTPException(status_code=404, detail=f"Audit {audit_id} not found")
