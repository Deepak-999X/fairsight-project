"""
FairSight AI — Sample Datasets
Embedded sample datasets for demo mode. Small subsets of common fairness benchmarks.
"""

import pandas as pd
import numpy as np


def get_compas_sample() -> pd.DataFrame:
    """COMPAS Recidivism dataset — 300 rows, testing racial bias in recidivism prediction."""
    np.random.seed(42)
    n = 300
    
    race = np.random.choice(["African-American", "Caucasian", "Hispanic"], n, p=[0.45, 0.40, 0.15])
    age = np.random.randint(18, 65, n)
    priors = np.random.poisson(2, n)
    
    # Simulate biased predictions
    base_prob = 0.3
    recidivism_prob = np.full(n, base_prob)
    recidivism_prob[race == "African-American"] += 0.20
    recidivism_prob[race == "Caucasian"] -= 0.05
    recidivism_prob[age < 25] += 0.10
    recidivism_prob += priors * 0.03
    recidivism_prob = np.clip(recidivism_prob, 0, 1)
    
    actual_recidivism = (np.random.random(n) < (recidivism_prob * 0.8 + 0.1)).astype(int)
    predicted_recidivism = (np.random.random(n) < recidivism_prob).astype(int)
    
    return pd.DataFrame({
        "race": race,
        "age": age,
        "prior_convictions": priors,
        "actual_recidivism": actual_recidivism,
        "predicted_recidivism": predicted_recidivism,
    })


def get_german_credit_sample() -> pd.DataFrame:
    """German Credit dataset — 250 rows, testing gender bias in credit scoring."""
    np.random.seed(123)
    n = 250
    
    gender = np.random.choice(["Male", "Female"], n, p=[0.6, 0.4])
    age = np.random.randint(20, 70, n)
    income = np.random.normal(45000, 15000, n).astype(int)
    income = np.clip(income, 15000, 100000)
    credit_history = np.random.choice(["Good", "Fair", "Poor"], n, p=[0.5, 0.35, 0.15])
    
    # Simulate biased predictions
    approval_prob = np.full(n, 0.6)
    approval_prob[gender == "Female"] -= 0.12
    approval_prob[credit_history == "Good"] += 0.15
    approval_prob[credit_history == "Poor"] -= 0.20
    approval_prob[income > 50000] += 0.10
    approval_prob = np.clip(approval_prob, 0, 1)
    
    actual_approved = (np.random.random(n) < (approval_prob * 0.9 + 0.05)).astype(int)
    predicted_approved = (np.random.random(n) < approval_prob).astype(int)
    
    return pd.DataFrame({
        "gender": gender,
        "age": age,
        "income": income,
        "credit_history": credit_history,
        "actual_approved": actual_approved,
        "predicted_approved": predicted_approved,
    })


def get_adult_income_sample() -> pd.DataFrame:
    """Adult Income dataset — 400 rows, testing race/gender bias in income prediction."""
    np.random.seed(456)
    n = 400
    
    gender = np.random.choice(["Male", "Female"], n, p=[0.55, 0.45])
    race = np.random.choice(["White", "Black", "Asian", "Other"], n, p=[0.6, 0.2, 0.12, 0.08])
    education = np.random.choice(["HS-grad", "Bachelors", "Masters", "Doctorate"], n, p=[0.35, 0.35, 0.20, 0.10])
    hours_per_week = np.random.normal(40, 10, n).astype(int)
    hours_per_week = np.clip(hours_per_week, 10, 80)
    
    # Simulate biased predictions
    high_income_prob = np.full(n, 0.25)
    high_income_prob[gender == "Male"] += 0.10
    high_income_prob[race == "White"] += 0.08
    high_income_prob[race == "Asian"] += 0.05
    high_income_prob[education == "Bachelors"] += 0.15
    high_income_prob[education == "Masters"] += 0.25
    high_income_prob[education == "Doctorate"] += 0.30
    high_income_prob[hours_per_week > 45] += 0.05
    high_income_prob = np.clip(high_income_prob, 0, 1)
    
    actual_income = (np.random.random(n) < (high_income_prob * 0.85 + 0.05)).astype(int)
    predicted_income = (np.random.random(n) < high_income_prob).astype(int)
    
    return pd.DataFrame({
        "gender": gender,
        "race": race,
        "education": education,
        "hours_per_week": hours_per_week,
        "actual_high_income": actual_income,
        "predicted_high_income": predicted_income,
    })


# Registry of available sample datasets
SAMPLE_DATASETS = {
    "compas": {
        "name": "COMPAS Recidivism",
        "description": "Criminal recidivism prediction — tests for racial bias",
        "loader": get_compas_sample,
        "protected_attr": "race",
        "outcome_col": "predicted_recidivism",
        "ground_truth_col": "actual_recidivism",
        "task_type": "classification",
    },
    "german_credit": {
        "name": "German Credit",
        "description": "Credit approval prediction — tests for gender bias",
        "loader": get_german_credit_sample,
        "protected_attr": "gender",
        "outcome_col": "predicted_approved",
        "ground_truth_col": "actual_approved",
        "task_type": "classification",
    },
    "adult_income": {
        "name": "Adult Income",
        "description": "Income level prediction — tests for race/gender bias",
        "loader": get_adult_income_sample,
        "protected_attr": "race",
        "outcome_col": "predicted_high_income",
        "ground_truth_col": "actual_high_income",
        "task_type": "classification",
    },
}
