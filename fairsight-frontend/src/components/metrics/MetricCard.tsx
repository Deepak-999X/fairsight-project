/**
 * FairSight AI — Metric Score Card Component
 * Displays: large number + label + severity badge + description.
 * TODO: Day 5 — implement with real metric data
 */

import type { Severity } from "../../types";

interface MetricCardProps {
  name: string;
  abbreviation: string;
  value: number;
  severity: Severity;
  threshold: string;
  description: string;
}

export function MetricCard({ name, value, severity, threshold, description }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-data-label text-text-secondary">{name}</p>
        <span className={`badge-${severity.toLowerCase()}`}>{severity}</span>
      </div>
      <p className="text-data-value text-text-primary mb-2">{value.toFixed(4)}</p>
      <p className="text-caption text-text-secondary">{description}</p>
      <p className="text-caption text-text-muted mt-1">Pass: {threshold}</p>
    </div>
  );
}
