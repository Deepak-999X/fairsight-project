/**
 * FairSight AI — Results Dashboard
 * Metrics grid + group table + AI report + export actions.
 * Fully wired to real analysis data and Gemini AI report generation.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileText,
  Sparkles,
  BarChart3,
  Shield,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PageShell } from "../components/layout/PageShell";
import { useUploadStore } from "../store/uploadStore";
import apiClient from "../lib/api";
import type { GroupStats } from "../types";

// Recharts imports
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const SEVERITY_COLORS = {
  PASS: "#10B981",
  WARN: "#F59E0B",
  FAIL: "#EF4444",
};

const GRADE_COLORS: Record<string, string> = {
  A: "#10B981",
  B: "#34D399",
  C: "#F59E0B",
  D: "#F97316",
  F: "#EF4444",
};

const BAR_COLORS = ["#2563EB", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899"];

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === "PASS") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (severity === "WARN") return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  return <XCircle className="w-4 h-4 text-red-500" />;
}

export function ResultsPage() {
  const navigate = useNavigate();
  const { analysisResult, auditReport, setAuditReport, setGeneratingReport, isGeneratingReport } = useUploadStore();
  const [sortField, setSortField] = useState<keyof GroupStats>("group_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [reportError, setReportError] = useState<string | null>(null);

  const hasResults = !!analysisResult;

  const handleGenerateReport = async () => {
    if (!analysisResult) return;

    setGeneratingReport(true);
    setReportError(null);

    try {
      const response = await apiClient.generateReport({
        audit_id: analysisResult.audit_id,
        metrics_json: JSON.stringify(analysisResult.metrics),
        group_stats_json: JSON.stringify(analysisResult.group_stats),
        dataset_name: analysisResult.dataset_name,
        protected_attribute: analysisResult.protected_attribute,
        task_type: analysisResult.task_type,
      });
      setAuditReport(response.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to generate report";
      setReportError(msg);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleExportCSV = () => {
    if (!analysisResult) return;

    const rows = [
      ["Metric", "Abbreviation", "Value", "Severity", "Threshold"],
      ...analysisResult.metrics.map(m => [m.name, m.abbreviation, m.value.toString(), m.severity, m.threshold_pass]),
      [],
      ["Group", "Size", "Positive Rate", "Accuracy", "TPR", "FPR"],
      ...analysisResult.group_stats.map(g => [
        g.group_name, g.group_size.toString(), g.positive_rate.toString(),
        g.accuracy?.toString() || "", g.true_positive_rate?.toString() || "", g.false_positive_rate?.toString() || "",
      ]),
    ];

    const csvContent = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fairsight-audit-${analysisResult.audit_id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sort group stats
  const sortedGroups = analysisResult
    ? [...analysisResult.group_stats].sort((a, b) => {
        const aVal = a[sortField] ?? 0;
        const bVal = b[sortField] ?? 0;
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      })
    : [];

  const handleSort = (field: keyof GroupStats) => {
    if (sortField === field) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // Chart data for group positive rates
  const chartData = analysisResult
    ? analysisResult.group_stats.map(g => ({
        name: g.group_name,
        positive_rate: +(g.positive_rate * 100).toFixed(1),
        accuracy: +((g.accuracy || 0) * 100).toFixed(1),
        size: g.group_size,
      }))
    : [];

  return (
    <PageShell showSidebar>
      <div className="page-enter">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <button
              onClick={() => navigate("/configure")}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-blue transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Configure
            </button>
            <h1 className="text-display text-brand-dark">
              Audit Results
            </h1>
            {analysisResult && (
              <p className="text-body text-text-secondary mt-1">
                {analysisResult.dataset_name} · {analysisResult.total_rows.toLocaleString()} rows · {analysisResult.num_groups} groups
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              disabled={!hasResults}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-text-secondary hover:bg-surface-gray transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              disabled={!hasResults}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-text-secondary hover:bg-surface-gray transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </motion.div>

        {!hasResults ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-brand-light rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-brand-blue" />
            </div>
            <h2 className="text-heading-2 text-text-primary mb-2">
              No Analysis Results Yet
            </h2>
            <p className="text-body text-text-secondary mb-6 max-w-md mx-auto">
              Upload a dataset and configure your analysis to see bias metrics, 
              group statistics, and AI-generated insights here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue/90 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Start New Audit
            </button>
          </motion.div>
        ) : (
          /* Results Grid */
          <div className="space-y-8">
            {/* Overall Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-data-label text-text-secondary uppercase tracking-wide mb-1">
                    Overall Fairness Score
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-extrabold text-brand-dark">
                      {analysisResult.fairness_score}
                    </span>
                    <span className="text-3xl font-bold text-brand-blue">
                      / 100
                    </span>
                    <span
                      className="text-2xl font-bold ml-2"
                      style={{ color: GRADE_COLORS[analysisResult.letter_grade] || "#6B7280" }}
                    >
                      Grade: {analysisResult.letter_grade}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">
                    Analyzing <strong>{analysisResult.protected_attribute}</strong> across {analysisResult.num_groups} demographic groups
                  </p>
                </div>
                <div className="hidden sm:block">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold text-white"
                    style={{ backgroundColor: GRADE_COLORS[analysisResult.letter_grade] || "#6B7280" }}
                  >
                    {analysisResult.letter_grade}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {analysisResult.metrics.map((metric, i) => (
                <motion.div
                  key={metric.abbreviation}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <SeverityIcon severity={metric.severity} />
                      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        {metric.abbreviation}
                      </p>
                    </div>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: SEVERITY_COLORS[metric.severity] }}
                    >
                      {metric.severity}
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-text-primary mb-1">
                    {metric.value.toFixed(4)}
                  </p>
                  <p className="text-sm font-medium text-text-primary mb-2">
                    {metric.name}
                  </p>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {metric.description}
                  </p>
                  <p className="text-xs text-text-muted mt-2">
                    Pass threshold: {metric.threshold_pass}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Bias Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-5 h-5 text-brand-blue" />
                <h2 className="text-heading-2 text-text-primary">
                  Group Positive Prediction Rates
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value}%`, name === "positive_rate" ? "Positive Rate" : "Accuracy"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB" }}
                  />
                  <Bar dataKey="positive_rate" name="Positive Rate" radius={[0, 4, 4, 0]} barSize={24}>
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Group Statistics Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-5 h-5 text-brand-blue" />
                <h2 className="text-heading-2 text-text-primary">
                  Group Statistics
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {[
                        { key: "group_name" as keyof GroupStats, label: "Group" },
                        { key: "group_size" as keyof GroupStats, label: "Size" },
                        { key: "positive_rate" as keyof GroupStats, label: "Positive Rate" },
                        { key: "accuracy" as keyof GroupStats, label: "Accuracy" },
                        { key: "true_positive_rate" as keyof GroupStats, label: "TPR" },
                        { key: "false_positive_rate" as keyof GroupStats, label: "FPR" },
                      ].map(({ key, label }) => (
                        <th
                          key={key}
                          onClick={() => handleSort(key)}
                          className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-brand-blue transition-colors"
                        >
                          <span className="flex items-center gap-1">
                            {label}
                            {sortField === key && (
                              sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedGroups.map((group, i) => (
                      <tr key={group.group_name} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                        <td className="px-4 py-3 font-medium text-text-primary">{group.group_name}</td>
                        <td className="px-4 py-3 text-text-secondary">{group.group_size.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono">{(group.positive_rate * 100).toFixed(1)}%</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono">{group.accuracy ? (group.accuracy * 100).toFixed(1) + "%" : "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono">{group.true_positive_rate != null ? (group.true_positive_rate * 100).toFixed(1) + "%" : "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono">{group.false_positive_rate != null ? (group.false_positive_rate * 100).toFixed(1) + "%" : "—"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* AI Report Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="ai-report-panel"
            >
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-accent-purple" />
                <h2 className="text-heading-2 text-accent-purple">
                  AI Audit Report
                </h2>
                <span className="text-xs font-medium text-accent-purple bg-white/60 px-2 py-1 rounded-full">
                  Powered by Gemini
                </span>
              </div>

              {auditReport ? (
                <div className="prose prose-sm max-w-none">
                  <div className="bg-white/60 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-accent-purple mb-1">Executive Summary</p>
                    <p className="text-sm text-text-primary">{auditReport.executive_summary}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4 whitespace-pre-wrap text-sm text-text-primary leading-relaxed">
                    {auditReport.report_text}
                  </div>
                  {auditReport.status === "fallback" && (
                    <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Template report (Gemini API unavailable)
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-body text-text-secondary">
                    Generate an AI-powered analysis with plain-English explanations 
                    and remediation recommendations.
                  </p>
                  {reportError && (
                    <p className="text-sm text-red-500 mt-2">{reportError}</p>
                  )}
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-purple text-white text-sm font-semibold hover:bg-accent-purple/90 transition-colors disabled:opacity-50"
                  >
                    {isGeneratingReport ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate AI Report
                      </>
                    )}
                  </button>
                </>
              )}
            </motion.div>

            {/* New Audit button */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  useUploadStore.getState().reset();
                  navigate("/");
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-sm font-medium text-text-secondary hover:bg-surface-gray transition-colors"
              >
                <Shield className="w-4 h-4" />
                Start New Audit
              </button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
