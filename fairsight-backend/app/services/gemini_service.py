"""
FairSight AI — Gemini AI Service
Generates plain-English audit reports using Google Gemini API.
Uses free Google API credits with gemini-2.0-flash model.
"""

import json
from app.config import settings

# Prompt template from Section 6.3, adapted for Gemini
SYSTEM_PROMPT = """You are a bias auditing expert. You explain AI fairness
findings to non-technical audiences. Be specific, use numbers,
and always provide a concrete next step. Keep each metric
explanation under 80 words. Use plain language."""

USER_PROMPT_TEMPLATE = """Here are the bias audit results for a {task_type} model
analyzing the "{dataset_name}" dataset. The protected attribute is "{attr}".

Metrics:
{json_metrics}

Group statistics:
{json_group_stats}

Please provide a structured response in this EXACT format:

## Executive Summary
(2-3 sentence overview of overall fairness)

## Metric Analysis

### [Metric Name] — [PASS/WARN/FAIL]
(For each FAIL or WARN metric: what it means in plain English, why it matters, and one concrete remediation step)

## Remediation Recommendations
(3-5 numbered concrete action items, ranked by impact)

## Overall Assessment
(Final 2-sentence verdict with recommended priority action)"""


class GeminiService:
    """
    Wrapper around Google Gemini API for generating AI audit reports.
    Uses gemini-2.0-flash model with free Google credits.
    """

    def __init__(self):
        self.model_name = settings.GEMINI_MODEL
        self.max_tokens = settings.GEMINI_MAX_TOKENS
        self._model = None

    def _get_model(self):
        """Lazy-initialize the Gemini model."""
        if self._model is None:
            import google.generativeai as genai
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            self._model = genai.GenerativeModel(
                self.model_name,
                system_instruction=SYSTEM_PROMPT,
            )
        return self._model

    async def generate_report(
        self,
        task_type: str,
        dataset_name: str,
        protected_attr: str,
        metrics_json: str,
        group_stats_json: str,
    ) -> dict:
        """
        Generate a plain-English audit report using Gemini.

        Args:
            task_type: "classification" or "regression"
            dataset_name: Name of the analyzed dataset
            protected_attr: Protected attribute column name
            metrics_json: JSON string of computed metrics
            group_stats_json: JSON string of group statistics

        Returns:
            Dict with report_text, executive_summary
        """
        prompt = USER_PROMPT_TEMPLATE.format(
            task_type=task_type,
            dataset_name=dataset_name,
            attr=protected_attr,
            json_metrics=metrics_json,
            json_group_stats=group_stats_json,
        )

        try:
            model = self._get_model()
            response = model.generate_content(
                prompt,
                generation_config={
                    "max_output_tokens": self.max_tokens,
                    "temperature": 0.3,
                },
            )

            report_text = response.text

            # Extract executive summary (first section)
            executive_summary = ""
            if "## Executive Summary" in report_text:
                parts = report_text.split("## Executive Summary")
                if len(parts) > 1:
                    summary_section = parts[1].split("##")[0].strip()
                    executive_summary = summary_section

            return {
                "report_text": report_text,
                "executive_summary": executive_summary,
                "model_used": self.model_name,
                "status": "success",
            }

        except Exception as e:
            # Graceful fallback with a mock report
            return {
                "report_text": self._generate_fallback_report(
                    task_type, dataset_name, protected_attr, metrics_json, group_stats_json
                ),
                "executive_summary": f"AI report generation encountered an issue: {str(e)}. Showing a template report instead.",
                "model_used": "fallback",
                "status": "fallback",
                "error": str(e),
            }

    def _generate_fallback_report(
        self, task_type, dataset_name, protected_attr, metrics_json, group_stats_json
    ) -> str:
        """Generate a template-based fallback report when Gemini is unavailable."""
        try:
            metrics = json.loads(metrics_json)
        except Exception:
            metrics = []

        fail_metrics = [m for m in metrics if m.get("severity") == "FAIL"]
        warn_metrics = [m for m in metrics if m.get("severity") == "WARN"]
        pass_metrics = [m for m in metrics if m.get("severity") == "PASS"]

        report = f"""## Executive Summary
This {task_type} model analyzing the "{dataset_name}" dataset shows """

        if not fail_metrics and not warn_metrics:
            report += "excellent fairness across all measured dimensions. All 5 bias metrics pass the recommended thresholds."
        elif fail_metrics:
            report += f"**significant fairness concerns** with {len(fail_metrics)} metric(s) failing thresholds when analyzing the '{protected_attr}' attribute."
        else:
            report += f"**moderate fairness concerns** with {len(warn_metrics)} metric(s) showing warning-level values for the '{protected_attr}' attribute."

        report += "\n\n## Metric Analysis\n"

        for m in metrics:
            if m.get("severity") in ("FAIL", "WARN"):
                report += f"\n### {m['name']} ({m['abbreviation']}) — {m['severity']}\n"
                report += f"Value: {m['value']:.4f} (threshold: {m.get('threshold_pass', 'N/A')})\n"
                report += f"{m.get('description', '')}\n"

        report += "\n## Remediation Recommendations\n"
        report += "1. Review the data collection process for representation bias\n"
        report += "2. Consider resampling techniques to balance demographic groups\n"
        report += "3. Apply post-processing fairness constraints to model outputs\n"
        report += "4. Consult with domain experts and affected communities\n"
        report += "5. Implement ongoing monitoring for bias drift\n"

        report += "\n## Overall Assessment\n"
        report += f"The model requires {'immediate attention' if fail_metrics else 'monitoring'} "
        report += f"regarding fairness for the '{protected_attr}' attribute. "
        report += "Regular auditing and iterative improvements are recommended."

        return report


# Singleton instance
gemini_service = GeminiService()
