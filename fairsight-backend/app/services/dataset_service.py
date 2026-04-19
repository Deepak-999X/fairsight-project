"""
FairSight AI — Dataset Service
Handles CSV parsing, validation, and column detection.
"""

import pandas as pd
from typing import Any


class DatasetService:
    """
    Service for processing uploaded CSV datasets.
    Handles parsing, validation, column type detection, and sampling.
    """

    def parse_csv(self, file_path: str) -> pd.DataFrame:
        """
        Parse a CSV file into a pandas DataFrame.
        
        Args:
            file_path: Path to the uploaded CSV file
            
        Returns:
            Parsed DataFrame
        """
        try:
            return pd.read_csv(file_path)
        except Exception as e:
            raise ValueError(f"Failed to parse CSV: {str(e)}")

    def detect_columns(self, df: pd.DataFrame) -> list[dict[str, str]]:
        """
        Detect column names and data types.
        
        Args:
            df: Parsed DataFrame
            
        Returns:
            List of {name, dtype} dicts
        """
        columns = []
        for col in df.columns:
            dtype_str = str(df[col].dtype)
            if "int" in dtype_str or "float" in dtype_str:
                col_type = "numeric"
            elif "bool" in dtype_str:
                col_type = "boolean"
            else:
                col_type = "categorical"
                
            columns.append({
                "name": col,
                "dtype": col_type,
                "original_type": dtype_str
            })
        return columns

    def validate_dataset(
        self,
        df: pd.DataFrame,
        protected_attr: str,
        outcome_col: str,
    ) -> dict[str, Any]:
        """
        Validate that required columns exist and data is suitable for analysis.
        
        Args:
            df: Parsed DataFrame
            protected_attr: Name of the protected attribute column
            outcome_col: Name of the outcome column
            
        Returns:
            Validation result dict with is_valid, errors, warnings
        """
        errors = []
        warnings = []
        
        # Check column existence
        if protected_attr not in df.columns:
            errors.append(f"Protected attribute '{protected_attr}' not found in dataset")
        else:
            # Check for high cardinality
            unique_vals = df[protected_attr].nunique()
            if unique_vals > 10:
                warnings.append(f"Protected attribute has {unique_vals} unique values, which may make analysis complex")
            elif unique_vals < 2:
                errors.append("Protected attribute must have at least 2 unique values to compute bias metrics")
                
        if outcome_col not in df.columns:
            errors.append(f"Outcome column '{outcome_col}' not found in dataset")
        else:
            # For classification, check if binary
            unique_outcomes = df[outcome_col].nunique()
            if unique_outcomes != 2:
                warnings.append(f"Outcome column has {unique_outcomes} values (expected 2 for binary classification)")
                
        # Check for NaNs
        if df.isna().any().any():
            warnings.append("Dataset contains missing values which will be dropped during analysis")
            
        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }

    def get_sample_rows(self, df: pd.DataFrame, n: int = 5) -> list[dict[str, Any]]:
        """Return first n rows as list of dicts for preview."""
        # Replace NaN with None for JSON serialization
        sample_df = df.head(n).where(pd.notna(df.head(n)), None)
        return sample_df.to_dict(orient="records")


# Singleton instance
dataset_service = DatasetService()
