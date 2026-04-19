/**
 * FairSight AI — Landing Page
 * Hero section + drag-drop upload zone + sample dataset buttons.
 * Sample datasets are wired to directly run analysis via the backend.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Shield, 
  Upload, 
  BarChart3, 
  Sparkles,
  ArrowRight,
  Database,
  Loader2,
} from "lucide-react";
import { PageShell } from "../components/layout/PageShell";
import { UploadZone } from "../components/upload/UploadZone";
import { useUploadStore } from "../store/uploadStore";
import apiClient from "../lib/api";

const features = [
  {
    icon: Upload,
    title: "Upload Dataset",
    description: "Drag & drop any CSV dataset with model predictions",
  },
  {
    icon: BarChart3,
    title: "5 Bias Metrics",
    description: "Demographic Parity, Disparate Impact, Equalized Odds & more",
  },
  {
    icon: Sparkles,
    title: "AI Audit Report",
    description: "Gemini AI generates plain-English explanations & fixes",
  },
];

const sampleDatasets = [
  { name: "compas", label: "COMPAS Recidivism", badge: "Racial Bias" },
  { name: "german_credit", label: "German Credit", badge: "Gender Bias" },
  { name: "adult_income", label: "Adult Income", badge: "Race Bias" },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { setAnalysisResult, setDemoMode } = useUploadStore();
  const [loadingDataset, setLoadingDataset] = useState<string | null>(null);
  const [sampleError, setSampleError] = useState<string | null>(null);

  const handleSampleDataset = async (datasetName: string) => {
    setLoadingDataset(datasetName);
    setSampleError(null);
    setDemoMode(true, datasetName);

    try {
      // Directly run analysis on sample dataset
      const response = await apiClient.analyze({
        sample_dataset: datasetName,
        protected_attribute: "",  // Will use defaults from backend
        outcome_column: "",       // Will use defaults from backend
        task_type: "classification",
      });

      setAnalysisResult(response.data);
      navigate("/results");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to load sample dataset";
      setSampleError(msg);
    } finally {
      setLoadingDataset(null);
    }
  };

  return (
    <PageShell>
      <div className="page-enter">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-brand-light text-brand-blue text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Shield className="w-3.5 h-3.5" />
            Solution Challenge 2026 — Unbiased AI Decision
          </div>

          <h1 className="text-display text-brand-dark mb-4 max-w-3xl mx-auto leading-tight">
            Detect & Fix{" "}
            <span className="bg-gradient-to-r from-brand-blue to-accent-purple bg-clip-text text-transparent">
              AI Bias
            </span>{" "}
            Before It Causes Harm
          </h1>

          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Upload your dataset, run 5 industry-standard fairness metrics, and get an 
            AI-generated audit report with actionable remediation steps — in under 60 seconds.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-brand-blue/30 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5 text-brand-blue group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-heading-3 text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-body text-text-secondary">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-heading-2 text-brand-blue mb-2 text-center">
              Start Your Audit
            </h2>
            <p className="text-body text-text-secondary text-center mb-6">
              Upload a CSV dataset to begin bias analysis
            </p>

            <UploadZone />

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-caption text-text-muted uppercase tracking-wider">
                or try a sample
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Sample Datasets */}
            {sampleError && (
              <p className="text-sm text-red-500 text-center mb-3">{sampleError}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sampleDatasets.map((dataset) => (
                <button
                  key={dataset.name}
                  onClick={() => handleSampleDataset(dataset.name)}
                  disabled={loadingDataset !== null}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-brand-blue hover:bg-brand-light/30 transition-all duration-200 group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingDataset === dataset.name ? (
                    <Loader2 className="w-8 h-8 text-brand-blue animate-spin flex-shrink-0" />
                  ) : (
                    <Database className="w-8 h-8 text-brand-blue/60 group-hover:text-brand-blue transition-colors flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-text-primary group-hover:text-brand-blue transition-colors">
                      {dataset.label}
                    </p>
                    <span className="text-[10px] font-medium text-warning bg-warning-light px-2 py-0.5 rounded-full">
                      {dataset.badge}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <h2 className="text-heading-2 text-brand-dark mb-8">
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {[
              { step: "1", label: "Upload CSV", desc: "Drag & drop your dataset" },
              { step: "2", label: "Configure", desc: "Select protected attributes" },
              { step: "3", label: "Analyze", desc: "Get 5 bias metrics instantly" },
              { step: "4", label: "Report", desc: "AI explains findings in plain English" },
            ].map((item, i) => (
              <div key={item.step} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-accent-purple rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {item.step}
                  </div>
                  <p className="text-sm font-semibold text-text-primary mt-2">
                    {item.label}
                  </p>
                  <p className="text-caption text-text-secondary">
                    {item.desc}
                  </p>
                </div>
                {i < 3 && (
                  <ArrowRight className="hidden md:block w-5 h-5 text-text-muted mt-[-20px]" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}
