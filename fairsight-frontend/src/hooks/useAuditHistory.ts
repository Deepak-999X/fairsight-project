/**
 * FairSight AI — useAuditHistory Hook
 * React Query wrapper for the /history endpoint.
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import type { AuditSummary } from "../types";

export function useAuditHistory() {
  return useQuery({
    queryKey: ["auditHistory"],
    queryFn: async () => {
      const response = await apiClient.getHistory();
      return response.data.audits as AuditSummary[];
    },
    enabled: false, // Only fetch when explicitly triggered
    retry: 1,
  });
}
