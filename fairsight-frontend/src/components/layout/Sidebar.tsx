/**
 * FairSight AI — Sidebar Component
 * Collapsible left sidebar (240px) for audit history.
 */

import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  FileText 
} from "lucide-react";
import type { AuditSummary } from "../../types";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  audits?: AuditSummary[];
}

export function Sidebar({ isOpen, onToggle, audits = [] }: SidebarProps) {
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed left-0 top-20 z-40 bg-white border border-l-0 border-gray-200 rounded-r-lg p-2 shadow-sm hover:shadow-md transition-all"
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4 text-text-secondary" />
        ) : (
          <ChevronRight className="w-4 h-4 text-text-secondary" />
        )}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -240, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -240, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-16 bottom-0 w-60 bg-white border-r border-gray-200 z-30 overflow-y-auto"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-brand-blue" />
                <h2 className="text-sm font-semibold text-text-primary">
                  Audit History
                </h2>
              </div>

              {/* Audit List */}
              {audits.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-text-muted mx-auto mb-2" />
                  <p className="text-caption text-text-secondary">
                    No audits yet
                  </p>
                  <p className="text-caption text-text-muted mt-1">
                    Upload a dataset to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {audits.map((audit) => (
                    <button
                      key={audit.audit_id}
                      className="w-full text-left p-3 rounded-lg hover:bg-surface-gray transition-colors group"
                    >
                      <p className="text-sm font-medium text-text-primary truncate group-hover:text-brand-blue transition-colors">
                        {audit.dataset_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-text-muted" />
                        <span className="text-caption text-text-muted">
                          Score: {audit.fairness_score ?? "—"}
                        </span>
                        {audit.letter_grade && (
                          <span
                            className={`text-caption font-bold ${
                              audit.letter_grade === "A"
                                ? "text-success"
                                : audit.letter_grade === "F"
                                ? "text-danger"
                                : "text-warning"
                            }`}
                          >
                            {audit.letter_grade}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
