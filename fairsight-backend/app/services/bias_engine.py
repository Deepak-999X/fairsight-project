"""
FairSight AI — Bias Engine Service
Core service for computing all 5 bias metrics using fairlearn + numpy.

Metrics computed:
1. Demographic Parity Difference (DPD)
2. Disparate Impact Ratio (DIR)
3. Equalized Odds Difference (EOD)
4. Calibration Error (CE)
5. Group Accuracy Gap (GAP)
"""

import pandas as pd
import numpy as np
from typing import Any
from fairlearn.metrics import (
    demographic_parity_difference,
    equalized_odds_difference,
    MetricFrame,
)
from sklearn.metrics import accuracy_score


class BiasEngine:
    """
    Computes bias metrics for a given dataset and model predictions.
    Uses fairlearn library under the hood.
    """

    # Severity thresholds from Section 6.2
    THRESHOLDS = {
        "DPD": {"pass": 0.1, "warn": 0.2},
        "DIR": {"pass_low": 0.8, "pass_high": 1.25, "warn_low": 0.7, "warn_high": 1.4},
        "EOD": {"pass": 0.1, "warn": 0.15},
        "CE": {"pass": 0.05, "warn": 0.1},
        "GAP": {"pass": 0.05, "warn": 0.1},
    }

    METRIC_INFO = {
        "DPD": {
            "name": "Demographic Parity Difference",
            "threshold_pass": "|x| < 0.1",
            "description": "Measures whether different groups receive positive outcomes at similar rates.",
        },
        "DIR": {
            "name": "Disparate Impact Ratio",
            "threshold_pass": "0.8 ≤ x ≤ 1.25",
            "description": "Ratio of positive outcome rates between groups. 1.0 = perfect parity.",
        },
        "EOD": {
            "name": "Equalized Odds Difference",
            "threshold_pass": "|x| < 0.1",
            "description": "Measures whether true/false positive rates are equal across groups.",
        },
        "CE": {
            "name": "Calibration Error",
            "threshold_pass": "|x| < 0.05",
            "description": "How well predicted probabilities match actual outcomes across groups.",
        },
        "GAP": {
            "name": "Group Accuracy Gap",
            "threshold_pass": "|x| < 0.05",
            "description": "Maximum difference in accuracy between any two demographic groups.",
        },
    }

    def compute_all_metrics(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        sensitive_features: np.ndarray,
    ) -> dict[str, Any]:
        """
        Compute all 5 bias metrics.

        Args:
            y_true: Ground truth labels (binary 0/1)
            y_pred: Model predictions (binary 0/1)
            sensitive_features: Protected attribute values

        Returns:
            Dict with metrics, group_stats, fairness_score, letter_grade
        """
        metrics = []

        # 1. Demographic Parity Difference
        dpd_val = self.compute_demographic_parity(y_pred, sensitive_features)
        metrics.append(self._build_metric("DPD", dpd_val))

        # 2. Disparate Impact Ratio
        dir_val = self.compute_disparate_impact(y_pred, sensitive_features)
        metrics.append(self._build_metric("DIR", dir_val))

        # 3. Equalized Odds Difference
        eod_val = self.compute_equalized_odds(y_true, y_pred, sensitive_features)
        metrics.append(self._build_metric("EOD", eod_val))

        # 4. Calibration Error
        ce_val = self.compute_calibration_error(y_true, y_pred, sensitive_features)
        metrics.append(self._build_metric("CE", ce_val))

        # 5. Group Accuracy Gap
        gap_val = self.compute_group_accuracy_gap(y_true, y_pred, sensitive_features)
        metrics.append(self._build_metric("GAP", gap_val))

        # Group statistics
        group_stats = self.compute_group_stats(y_true, y_pred, sensitive_features)

        # Overall fairness score and letter grade
        fairness_score, letter_grade = self.compute_fairness_score(metrics)

        return {
            "metrics": metrics,
            "group_stats": group_stats,
            "fairness_score": fairness_score,
            "letter_grade": letter_grade,
        }

    def _build_metric(self, abbreviation: str, value: float) -> dict:
        """Build a metric result dict with severity assessment."""
        info = self.METRIC_INFO[abbreviation]
        severity = self.get_severity(abbreviation, value)
        return {
            "name": info["name"],
            "abbreviation": abbreviation,
            "value": round(value, 6),
            "severity": severity,
            "threshold_pass": info["threshold_pass"],
            "description": info["description"],
        }

    def compute_demographic_parity(
        self, y_pred: np.ndarray, sensitive_features: np.ndarray
    ) -> float:
        """Compute Demographic Parity Difference using fairlearn."""
        try:
            return abs(demographic_parity_difference(
                y_true=y_pred,  # For DPD we only look at predictions
                y_pred=y_pred,
                sensitive_features=sensitive_features,
            ))
        except Exception:
            # Manual fallback
            groups = pd.Series(sensitive_features)
            preds = pd.Series(y_pred)
            rates = preds.groupby(groups).mean()
            return float(rates.max() - rates.min())

    def compute_disparate_impact(
        self, y_pred: np.ndarray, sensitive_features: np.ndarray
    ) -> float:
        """Compute Disparate Impact Ratio — min(group_rate) / max(group_rate)."""
        groups = pd.Series(sensitive_features)
        preds = pd.Series(y_pred)
        rates = preds.groupby(groups).mean()

        max_rate = rates.max()
        min_rate = rates.min()

        if max_rate == 0:
            return 1.0  # No positive predictions for any group
        return float(min_rate / max_rate)

    def compute_equalized_odds(
        self, y_true: np.ndarray, y_pred: np.ndarray, sensitive_features: np.ndarray
    ) -> float:
        """Compute Equalized Odds Difference using fairlearn."""
        try:
            return abs(equalized_odds_difference(
                y_true=y_true,
                y_pred=y_pred,
                sensitive_features=sensitive_features,
            ))
        except Exception:
            # Manual fallback: max diff in TPR or FPR across groups
            groups = pd.Series(sensitive_features)
            unique_groups = groups.unique()
            tpr_list = []
            fpr_list = []
            for g in unique_groups:
                mask = groups == g
                yt = np.array(y_true)[mask]
                yp = np.array(y_pred)[mask]
                pos = yt == 1
                neg = yt == 0
                tpr = yp[pos].mean() if pos.sum() > 0 else 0
                fpr = yp[neg].mean() if neg.sum() > 0 else 0
                tpr_list.append(tpr)
                fpr_list.append(fpr)
            tpr_diff = max(tpr_list) - min(tpr_list) if tpr_list else 0
            fpr_diff = max(fpr_list) - min(fpr_list) if fpr_list else 0
            return float(max(tpr_diff, fpr_diff))

    def compute_calibration_error(
        self, y_true: np.ndarray, y_pred: np.ndarray, sensitive_features: np.ndarray
    ) -> float:
        """Compute group-wise Calibration Error."""
        groups = pd.Series(sensitive_features)
        unique_groups = groups.unique()
        errors = []

        for g in unique_groups:
            mask = groups == g
            yt = np.array(y_true)[mask]
            yp = np.array(y_pred)[mask]
            if len(yt) > 0:
                # For binary classification, calibration = |mean(pred) - mean(actual)|
                errors.append(abs(float(yp.mean()) - float(yt.mean())))

        if len(errors) < 2:
            return 0.0
        return float(max(errors) - min(errors))

    def compute_group_accuracy_gap(
        self, y_true: np.ndarray, y_pred: np.ndarray, sensitive_features: np.ndarray
    ) -> float:
        """Compute Group Accuracy Gap — max accuracy difference between groups."""
        groups = pd.Series(sensitive_features)
        unique_groups = groups.unique()
        accuracies = []

        for g in unique_groups:
            mask = groups == g
            yt = np.array(y_true)[mask]
            yp = np.array(y_pred)[mask]
            if len(yt) > 0:
                acc = accuracy_score(yt, yp)
                accuracies.append(acc)

        if len(accuracies) < 2:
            return 0.0
        return float(max(accuracies) - min(accuracies))

    def get_severity(self, metric_name: str, value: float) -> str:
        """Determine PASS/WARN/FAIL severity for a metric value."""
        thresholds = self.THRESHOLDS.get(metric_name, {})

        if metric_name == "DIR":
            # DIR uses a range-based threshold
            if thresholds["pass_low"] <= value <= thresholds["pass_high"]:
                return "PASS"
            elif thresholds["warn_low"] <= value <= thresholds["warn_high"]:
                return "WARN"
            else:
                return "FAIL"
        else:
            # All other metrics use absolute value thresholds
            abs_val = abs(value)
            if abs_val <= thresholds.get("pass", 0.1):
                return "PASS"
            elif abs_val <= thresholds.get("warn", 0.2):
                return "WARN"
            else:
                return "FAIL"

    def compute_group_stats(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        sensitive_features: np.ndarray,
    ) -> list[dict]:
        """Compute per-group statistics."""
        groups = pd.Series(sensitive_features)
        unique_groups = sorted(groups.unique())
        stats = []

        for g in unique_groups:
            mask = groups == g
            yt = np.array(y_true)[mask]
            yp = np.array(y_pred)[mask]
            group_size = int(mask.sum())
            positive_rate = float(yp.mean()) if group_size > 0 else 0.0
            accuracy = float(accuracy_score(yt, yp)) if group_size > 0 else 0.0

            # TPR and FPR
            pos = yt == 1
            neg = yt == 0
            tpr = float(yp[pos].mean()) if pos.sum() > 0 else None
            fpr = float(yp[neg].mean()) if neg.sum() > 0 else None

            stats.append({
                "group_name": str(g),
                "group_size": group_size,
                "positive_rate": round(positive_rate, 4),
                "accuracy": round(accuracy, 4),
                "true_positive_rate": round(tpr, 4) if tpr is not None else None,
                "false_positive_rate": round(fpr, 4) if fpr is not None else None,
            })

        return stats

    def compute_fairness_score(self, metrics: list[dict]) -> tuple[float, str]:
        """
        Compute overall fairness score (0-100) and letter grade (A-F).

        Scoring: Each metric contributes 20 points.
        PASS = 20 pts, WARN = 10 pts, FAIL = 0 pts.

        Returns:
            Tuple of (score, letter_grade)
        """
        total = 0
        for m in metrics:
            if m["severity"] == "PASS":
                total += 20
            elif m["severity"] == "WARN":
                total += 10
            # FAIL = 0

        # Letter grade
        if total >= 90:
            grade = "A"
        elif total >= 70:
            grade = "B"
        elif total >= 50:
            grade = "C"
        elif total >= 30:
            grade = "D"
        else:
            grade = "F"

        return float(total), grade


# Singleton instance
bias_engine = BiasEngine()
