/**
 * FairSight AI — useAnalysis Hook
 * React Query wrapper for the /analyze endpoint.
 */

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { useUploadStore } from "../store/uploadStore";
import type { AnalysisResult } from "../types";

export function useAnalysis() {
  const { setAnalysisResult, setAnalyzing, setAnalysisError } = useUploadStore();

  return useMutation({
    mutationFn: async (data: {
      protected_attribute: string;
      outcome_column: string;
      task_type: string;
      dataset_id?: string;
      sample_dataset?: string;
    }) => {
      setAnalyzing(true);
      setAnalysisError(null);
      const response = await apiClient.analyze(data);
      return response.data as AnalysisResult;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setAnalyzing(false);
    },
    onError: (error: Error) => {
      setAnalysisError(error.message);
      setAnalyzing(false);
    },
  });
}
