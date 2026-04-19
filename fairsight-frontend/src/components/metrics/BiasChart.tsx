
/**
 * FairSight AI — Bias Chart Component
 * Horizontal bar chart showing prediction rates per demographic group.
 * Shows DPD, DIR, EOD, CE, GAP metrics side-by-side for quick visual comparison.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Legend,
} from "recharts";

interface Metric {
  name: string;
  abbreviation: string;
  value: number;
  severity: "PASS" | "WARN" | "FAIL";
  threshold_pass: string;
  description: string;
}

interface GroupStat {
  group_name: string;
  group_size: number;
  positive_rate: number;
  accuracy: number;
  true_positive_rate: number | null;
  false_positive_rate: number | null;
}

interface BiasChartProps {
  metrics: Metric[];
  groupStats: GroupStat[];
}

const SEVERITY_COLORS: Record<string, string> = {
  PASS: "#10B981",
  WARN: "#F59E0B",
  FAIL: "#EF4444",
};

const GROUP_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: GROUP_COLORS[i % GROUP_COLORS.length] }}>
            {entry.name}: {(entry.value * 100).toFixed(1)}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function BiasChart({ metrics, groupStats }: BiasChartProps) {
  // ── Chart 1: Metric severity bar chart ──────────────────────────────────
  const metricChartData = metrics.map((m) => ({
    name: m.abbreviation,
    value: Math.abs(m.value),
    severity: m.severity,
    fullName: m.name,
    threshold: m.threshold_pass,
  }));

  // ── Chart 2: Positive rate per group ────────────────────────────────────
  const groupChartData = groupStats.map((g) => ({
    group: g.group_name,
    "Positive Rate": g.positive_rate,
    Accuracy: g.accuracy,
    TPR: g.true_positive_rate ?? 0,
    FPR: g.false_positive_rate ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* ── Metric Values Bar Chart ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Bias Metric Values
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Absolute metric values — colour indicates PASS / WARN / FAIL
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={metricChartData}
            margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number | string) => Number(v).toFixed(2)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const d = metricChartData.find((x) => x.name === label);
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm max-w-xs">
                      <p className="font-semibold text-gray-800">{d?.fullName}</p>
                      <p className="text-gray-600">
                        Value: <span className="font-medium">{Number(payload[0].value).toFixed(4)}</span>
                      </p>
                      <p className="text-gray-500 text-xs">Threshold: {d?.threshold}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {metricChartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={SEVERITY_COLORS[entry.severity] ?? "#6B7280"}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 justify-center">
          {(["PASS", "WARN", "FAIL"] as const).map((s) => (
            <span key={s} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ background: SEVERITY_COLORS[s] }}
              />
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ── Per-Group Rates Bar Chart ───────────────────────────────────── */}
      {groupStats.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Outcome Rates by Group
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Positive prediction rate and model accuracy per demographic group
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={groupChartData}
              margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="group"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                //tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                tickFormatter={(v: number | string) => `${(Number(v) * 100).toFixed(0)}%`}
                domain={[0, 1]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="square"
                iconSize={10}
              />
              <ReferenceLine y={1} stroke="#E5E7EB" strokeDasharray="4 2" />
              <Bar
                dataKey="Positive Rate"
                fill="#2563EB"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
                fillOpacity={0.85}
              />
              <Bar
                dataKey="Accuracy"
                fill="#7C3AED"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
                fillOpacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}