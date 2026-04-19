/**
 * FairSight AI — Shared TypeScript Interfaces
 * All types used across components and API calls.
 */

/** Severity level for bias metrics */
export type Severity = "PASS" | "WARN" | "FAIL";

/** Letter grade for overall fairness score */
export type LetterGrade = "A" | "B" | "C" | "D" | "F";

/** Task type for model analysis */
export type TaskType = "classification" | "regression";

/** Result for a single bias metric */
export interface MetricResult {
  name: string;
  abbreviation: string;
  value: number;
  severity: Severity;
  threshold_pass: string;
  description: string;
  details?: string;
}

/** Statistics for a single demographic group */
export interface GroupStats {
  group_name: string;
  group_size: number;
  positive_rate: number;
  accuracy?: number;
  true_positive_rate?: number;
  false_positive_rate?: number;
}

/** Full bias analysis response */
export interface AnalysisResult {
  audit_id: number;
  dataset_name: string;
  protected_attribute: string;
  outcome_column: string;
  task_type: TaskType;
  fairness_score: number;
  letter_grade: LetterGrade;
  metrics: MetricResult[];
  group_stats: GroupStats[];
  total_rows: number;
  num_groups: number;
}

/** Column info from uploaded dataset */
export interface ColumnInfo {
  name: string;
  dtype: string;
}

/** Response from file upload */
export interface UploadResponse {
  filename: string;
  dataset_id: string;
  row_count: number;
  column_count: number;
  columns: ColumnInfo[];
  sample_rows: Record<string, unknown>[];
  file_size_bytes: number;
}

/** AI-generated audit report */
export interface AuditReport {
  report_text: string;
  executive_summary: string;
  model_used: string;
  status: string;
}

/** Summary of a past audit */
export interface AuditSummary {
  audit_id: number;
  dataset_name: string;
  protected_attribute: string;
  fairness_score: number | null;
  letter_grade: string | null;
  task_type: string;
  total_rows: number;
  num_groups: number;
}

/** Sample dataset info */
export interface SampleDataset {
  id: string;
  name: string;
  description: string;
  protected_attribute: string;
  outcome_column: string;
  task_type: string;
}

/** Configuration state for analysis */
export interface AnalysisConfig {
  protectedAttribute: string;
  outcomeColumn: string;
  taskType: TaskType;
  datasetId?: string;
  sampleDataset?: string;
}
