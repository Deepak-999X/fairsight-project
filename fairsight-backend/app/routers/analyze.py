"""
FairSight AI — Analysis Router
POST /api/v1/analyze — Run full bias audit with 5 fairness metrics.
"""

import os
import numpy as np
from fastapi import APIRouter, HTTPException
from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse
from app.services.bias_engine import bias_engine
from app.services.dataset_service import dataset_service
from app.services.sample_data import SAMPLE_DATASETS
from app.routers.report import store_audit_result
from app.routers.history import add_to_history

router = APIRouter(tags=["Analysis"])

# Upload directory path
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")

# Simple in-memory audit counter (replace with DB in production)
_audit_counter = 0


@router.post("/analyze", response_model=AnalyzeResponse)
async def run_analysis(request: AnalyzeRequest):
    """
    Run full bias audit on an uploaded dataset or sample dataset.
    Computes 5 metrics: DPD, DIR, EOD, Calibration Error, Group Accuracy Gap.
    Returns metrics, group stats, fairness score, and letter grade.
    """
    global _audit_counter

    try:
        # Load data — from sample dataset or uploaded file
        if request.sample_dataset and request.sample_dataset in SAMPLE_DATASETS:
            sample = SAMPLE_DATASETS[request.sample_dataset]
            df = sample["loader"]()
            dataset_name = sample["name"]
            
            # Use default columns from sample data config
            protected_attr = request.protected_attribute or sample["protected_attr"]
            outcome_col = request.outcome_column or sample["outcome_col"]
            ground_truth_col = sample.get("ground_truth_col", outcome_col)
            
        elif request.dataset_id:
            # Load from uploads directory
            file_path = os.path.join(UPLOAD_DIR, f"{request.dataset_id}.csv")
            if not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail=f"Dataset '{request.dataset_id}' not found. Please re-upload.")
            
            df = dataset_service.parse_csv(file_path)
            dataset_name = f"Upload-{request.dataset_id}"
            protected_attr = request.protected_attribute
            outcome_col = request.outcome_column
            ground_truth_col = outcome_col  # For user uploads, outcome IS the ground truth
        else:
            raise HTTPException(status_code=400, detail="Either dataset_id or sample_dataset must be provided")

        # Validate columns exist
        validation = dataset_service.validate_dataset(df, protected_attr, outcome_col)
        if not validation["is_valid"]:
            raise HTTPException(status_code=400, detail=f"Validation failed: {'; '.join(validation['errors'])}")

        # Drop NaN rows for the relevant columns
        relevant_cols = [protected_attr, outcome_col]
        if ground_truth_col != outcome_col:
            relevant_cols.append(ground_truth_col)
        df_clean = df.dropna(subset=relevant_cols)

        # Extract arrays
        sensitive_features = df_clean[protected_attr].values
        y_pred = df_clean[outcome_col].values.astype(int)
        
        if ground_truth_col != outcome_col:
            y_true = df_clean[ground_truth_col].values.astype(int)
        else:
            # If user provides only one column, use it as both ground truth and prediction
            # This is a common scenario when analyzing a dataset with a single outcome
            y_true = y_pred.copy()

        # Run bias engine
        results = bias_engine.compute_all_metrics(y_true, y_pred, sensitive_features)

        # Increment audit counter
        _audit_counter += 1

        response = AnalyzeResponse(
            audit_id=_audit_counter,
            dataset_name=dataset_name,
            protected_attribute=protected_attr,
            outcome_column=outcome_col,
            task_type=request.task_type,
            fairness_score=results["fairness_score"],
            letter_grade=results["letter_grade"],
            metrics=results["metrics"],
            group_stats=results["group_stats"],
            total_rows=len(df_clean),
            num_groups=len(results["group_stats"]),
        )

        # Store for report generation and history
        response_dict = response.model_dump()
        store_audit_result(_audit_counter, response_dict)
        add_to_history(response_dict)

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
