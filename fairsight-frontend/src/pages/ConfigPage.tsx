/**
 * FairSight AI — Configuration Page
 * Column mapping + protected attribute selection + task type.
 * Wired to POST /api/v1/analyze for real bias analysis.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Settings, 
  ArrowLeft, 
  ArrowRight, 
  ShieldAlert, 
  Target, 
  Cog,
  Info,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { PageShell } from "../components/layout/PageShell";
import { useUploadStore } from "../store/uploadStore";
import apiClient from "../lib/api";

export function ConfigPage() {
  const navigate = useNavigate();
  const { columns, config, setConfig, uploadResponse, setAnalysisResult, setAnalyzing } = useUploadStore();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    if (!config.protectedAttribute || !config.outcomeColumn) return;

    setIsRunning(true);
    setError(null);
    setAnalyzing(true);

    try {
      const payload: Record<string, string | undefined> = {
        protected_attribute: config.protectedAttribute,
        outcome_column: config.outcomeColumn,
        task_type: config.taskType,
      };

      // Include dataset reference
      if (config.datasetId) {
        payload.dataset_id = config.datasetId;
      } else if (config.sampleDataset) {
        payload.sample_dataset = config.sampleDataset;
      }

      const response = await apiClient.analyze(payload as {
        protected_attribute: string;
        outcome_column: string;
        task_type: string;
        dataset_id?: string;
        sample_dataset?: string;
      });

      setAnalysisResult(response.data);
      navigate("/results");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Analysis failed. Please try again.";
      setError(errorMsg);
    } finally {
      setIsRunning(false);
      setAnalyzing(false);
    }
  };

  return (
    <PageShell>
      <div className="page-enter max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-blue transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Upload
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h1 className="text-display text-brand-dark">
                Configure Analysis
              </h1>
              <p className="text-body text-text-secondary">
                Select which columns to analyze for bias
              </p>
            </div>
          </div>
        </motion.div>

        {/* Dataset Info */}
        {uploadResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-brand-light/50 border border-brand-blue/20 rounded-xl p-4 mb-6"
          >
            <p className="text-sm text-brand-dark">
              <span className="font-semibold">{uploadResponse.filename}</span>
              {" — "}
              {uploadResponse.row_count.toLocaleString()} rows,{" "}
              {uploadResponse.column_count} columns
            </p>
          </motion.div>
        )}

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Analysis Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Configuration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Protected Attribute */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="w-5 h-5 text-danger" />
              <div>
                <h3 className="text-heading-3 text-text-primary">
                  Protected Attribute
                </h3>
                <p className="text-caption text-text-secondary">
                  The demographic column to test for bias (e.g., gender, race, age)
                </p>
              </div>
            </div>
            <select
              value={config.protectedAttribute}
              onChange={(e) =>
                setConfig({ protectedAttribute: e.target.value })
              }
              className="w-full px-4 py-3 bg-surface-gray border border-gray-200 rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
            >
              <option value="">Select a column...</option>
              {columns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name} ({col.dtype})
                </option>
              ))}
            </select>
          </div>

          {/* Outcome Column */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-brand-blue" />
              <div>
                <h3 className="text-heading-3 text-text-primary">
                  Outcome Column
                </h3>
                <p className="text-caption text-text-secondary">
                  The prediction target (e.g., hired, approved, income)
                </p>
              </div>
            </div>
            <select
              value={config.outcomeColumn}
              onChange={(e) =>
                setConfig({ outcomeColumn: e.target.value })
              }
              className="w-full px-4 py-3 bg-surface-gray border border-gray-200 rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
            >
              <option value="">Select a column...</option>
              {columns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name} ({col.dtype})
                </option>
              ))}
            </select>
          </div>

          {/* Task Type */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Cog className="w-5 h-5 text-accent-purple" />
              <div>
                <h3 className="text-heading-3 text-text-primary">
                  Task Type
                </h3>
                <p className="text-caption text-text-secondary">
                  What type of ML task does this model perform?
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {["classification", "regression"].map((type) => (
                <button
                  key={type}
                  onClick={() => setConfig({ taskType: type as "classification" | "regression" })}
                  className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium capitalize transition-all ${
                    config.taskType === type
                      ? "border-brand-blue bg-brand-light text-brand-blue"
                      : "border-gray-200 text-text-secondary hover:border-gray-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-3 bg-accent-purple-light/50 border border-accent-purple/10 rounded-xl p-4">
            <Info className="w-5 h-5 text-accent-purple flex-shrink-0 mt-0.5" />
            <p className="text-sm text-text-secondary">
              FairSight AI will compute <strong>5 bias metrics</strong>: 
              Demographic Parity, Disparate Impact, Equalized Odds, 
              Calibration Error, and Group Accuracy Gap.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-lg border border-gray-200 text-text-secondary text-sm font-medium hover:bg-surface-gray transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleRunAnalysis}
              disabled={!config.protectedAttribute || !config.outcomeColumn || isRunning}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-brand-blue to-brand-blue/90 text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Run Analysis
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}
