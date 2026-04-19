/**
 * FairSight AI — Group Statistics Table
 * Sortable table showing per-group prediction rates, accuracy, TPR, FPR.
 * Highlights the group with the highest positive rate for quick spotting.
 */

import { useState } from "react";
import { ChevronUp, ChevronDown, Users } from "lucide-react";

interface GroupStat {
  group_name: string;
  group_size: number;
  positive_rate: number;
  accuracy: number;
  true_positive_rate: number | null;
  false_positive_rate: number | null;
}

interface GroupTableProps {
  groupStats: GroupStat[];
}

type SortKey = keyof GroupStat;

const fmt = (v: number | null, pct = true) => {
  if (v === null || v === undefined) return "—";
  return pct ? `${(v * 100).toFixed(1)}%` : v.toLocaleString();
};

const getRateBg = (rate: number, maxRate: number) => {
  const normalized = maxRate > 0 ? rate / maxRate : 0;
  if (normalized >= 0.9) return "bg-green-100 text-green-800";
  if (normalized >= 0.7) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

export function GroupTable({ groupStats }: GroupTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("positive_rate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  if (!groupStats || groupStats.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center gap-2 text-gray-400">
        <Users className="w-4 h-4" />
        <span className="text-sm">No group statistics available.</span>
      </div>
    );
  }

  const maxPositiveRate = Math.max(...groupStats.map((g) => g.positive_rate));

  const sorted = [...groupStats].sort((a, b) => {
    const av = a[sortKey] ?? 0;
    const bv = b[sortKey] ?? 0;
    if (typeof av === "string" && typeof bv === "string") {
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    const an = Number(av);
    const bn = Number(bv);
    return sortDir === "asc" ? an - bn : bn - an;
  });

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortKey }) =>
    sortKey === field ? (
      sortDir === "asc" ? (
        <ChevronUp className="w-3 h-3 inline ml-0.5" />
      ) : (
        <ChevronDown className="w-3 h-3 inline ml-0.5" />
      )
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-0.5 opacity-30" />
    );

  const columns: { key: SortKey; label: string }[] = [
    { key: "group_name", label: "Group" },
    { key: "group_size", label: "Count" },
    { key: "positive_rate", label: "Positive Rate" },
    { key: "accuracy", label: "Accuracy" },
    { key: "true_positive_rate", label: "TPR" },
    { key: "false_positive_rate", label: "FPR" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="text-base font-semibold text-gray-900">
          Per-Group Statistics
        </h3>
        <span className="ml-auto text-xs text-gray-400">
          {groupStats.length} group{groupStats.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-800 select-none transition-colors"
                >
                  {col.label}
                  <SortIcon field={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((g, i) => {
              const isHighest = g.positive_rate === maxPositiveRate && maxPositiveRate > 0;
              return (
                <tr
                  key={g.group_name}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-2">
                    {isHighest && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" title="Highest positive rate" />
                    )}
                    {!isHighest && <span className="w-2 h-2 flex-shrink-0" />}
                    {g.group_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {g.group_size.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getRateBg(
                        g.positive_rate,
                        maxPositiveRate
                      )}`}
                    >
                      {fmt(g.positive_rate)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{fmt(g.accuracy)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {fmt(g.true_positive_rate)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {fmt(g.false_positive_rate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1 align-middle" />
          Highest positive rate group &nbsp;·&nbsp; TPR = True Positive Rate &nbsp;·&nbsp; FPR = False Positive Rate
        </p>
      </div>
    </div>
  );
}