/**
 * FairSight AI — Column Mapper Component
 * Displays detected columns with data types from the uploaded CSV.
 * Allows user to confirm or override auto-detected column roles.
 */

import { Tag, Hash, AlignLeft, ToggleLeft } from "lucide-react";

interface ColumnInfo {
  name: string;
  dtype: string;
  sample_values: (string | number)[];
  unique_count: number;
  null_count: number;
}

interface ColumnMapperProps {
  columns: ColumnInfo[];
  selectedProtected?: string;
  selectedOutcome?: string;
  onSelectProtected?: (col: string) => void;
  onSelectOutcome?: (col: string) => void;
}

const DTYPE_ICON: Record<string, React.ReactNode> = {
  int64: <Hash className="w-3 h-3" />,
  float64: <Hash className="w-3 h-3" />,
  object: <AlignLeft className="w-3 h-3" />,
  bool: <ToggleLeft className="w-3 h-3" />,
  category: <Tag className="w-3 h-3" />,
};

const DTYPE_COLOR: Record<string, string> = {
  int64: "bg-blue-100 text-blue-700",
  float64: "bg-cyan-100 text-cyan-700",
  object: "bg-orange-100 text-orange-700",
  bool: "bg-green-100 text-green-700",
  category: "bg-purple-100 text-purple-700",
};

function getRole(
  col: string,
  selectedProtected?: string,
  selectedOutcome?: string
): string | null {
  if (col === selectedProtected) return "protected";
  if (col === selectedOutcome) return "outcome";
  return null;
}

export function ColumnMapper({
  columns,
  selectedProtected,
  selectedOutcome,
  onSelectProtected,
  onSelectOutcome,
}: ColumnMapperProps) {
  if (!columns || columns.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-400">
        No columns detected. Please upload a CSV first.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Detected Columns
        </h3>
        <span className="text-xs text-gray-400">{columns.length} columns</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-left">
              <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Column
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Type
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Uniques
              </th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Sample values
              </th>
              {(onSelectProtected || onSelectOutcome) && (
                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Role
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {columns.map((col, i) => {
              const role = getRole(col.name, selectedProtected, selectedOutcome);
              const dtypeKey = col.dtype.replace("64", "64").split("[")[0];
              return (
                <tr
                  key={col.name}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"
                    } ${role ? "ring-1 ring-inset " + (role === "protected" ? "ring-blue-200 bg-blue-50/30" : "ring-purple-200 bg-purple-50/30") : ""}`}
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-800 font-medium">
                    {col.name}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${DTYPE_COLOR[dtypeKey] ?? "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {DTYPE_ICON[dtypeKey] ?? <Tag className="w-3 h-3" />}
                      {col.dtype}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">
                    {col.unique_count}
                    {col.null_count > 0 && (
                      <span className="ml-1 text-orange-400">
                        · {col.null_count} null
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[200px] truncate">
                    {col.sample_values
                      .slice(0, 4)
                      .map(String)
                      .join(", ")}
                  </td>
                  {(onSelectProtected || onSelectOutcome) && (
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1.5">
                        {onSelectProtected && (
                          <button
                            onClick={() => onSelectProtected(col.name)}
                            className={`text-xs px-2 py-0.5 rounded border transition-colors ${role === "protected"
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
                              }`}
                          >
                            Protected
                          </button>
                        )}
                        {onSelectOutcome && (
                          <button
                            onClick={() => onSelectOutcome(col.name)}
                            className={`text-xs px-2 py-0.5 rounded border transition-colors ${role === "outcome"
                              ? "bg-purple-600 text-white border-purple-600"
                              : "border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600"
                              }`}
                          >
                            Outcome
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}