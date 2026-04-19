/**
 * FairSight AI — Upload Store (Zustand)
 * Manages file upload state, column configuration, and analysis config.
 */

import { create } from "zustand";
import type { ColumnInfo, AnalysisConfig, UploadResponse, AnalysisResult, AuditReport } from "../types";

interface UploadState {
  // File upload
  file: File | null;
  uploadResponse: UploadResponse | null;
  columns: ColumnInfo[];
  isUploading: boolean;
  uploadError: string | null;

  // Configuration
  config: AnalysisConfig;

  // Analysis results
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  analysisError: string | null;

  // AI Report
  auditReport: AuditReport | null;
  isGeneratingReport: boolean;
  reportError: string | null;

  // Demo mode
  isDemoMode: boolean;
  selectedSampleDataset: string | null;

  // Actions
  setFile: (file: File | null) => void;
  setUploadResponse: (response: UploadResponse) => void;
  setColumns: (columns: ColumnInfo[]) => void;
  setConfig: (config: Partial<AnalysisConfig>) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setAuditReport: (report: AuditReport | null) => void;
  setDemoMode: (isDemoMode: boolean, datasetName?: string) => void;
  setUploading: (isUploading: boolean) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setGeneratingReport: (isGenerating: boolean) => void;
  setUploadError: (error: string | null) => void;
  setAnalysisError: (error: string | null) => void;
  setReportError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  file: null,
  uploadResponse: null,
  columns: [],
  isUploading: false,
  uploadError: null,
  config: {
    protectedAttribute: "",
    outcomeColumn: "",
    taskType: "classification" as const,
    datasetId: undefined as string | undefined,
    sampleDataset: undefined as string | undefined,
  },
  analysisResult: null,
  isAnalyzing: false,
  analysisError: null,
  auditReport: null,
  isGeneratingReport: false,
  reportError: null,
  isDemoMode: false,
  selectedSampleDataset: null,
};

export const useUploadStore = create<UploadState>((set) => ({
  ...initialState,

  setFile: (file) => set({ file, uploadError: null }),
  setUploadResponse: (response) =>
    set({
      uploadResponse: response,
      columns: response.columns,
      config: {
        protectedAttribute: "",
        outcomeColumn: "",
        taskType: "classification",
        datasetId: response.dataset_id,
        sampleDataset: undefined,
      },
    }),
  setColumns: (columns) => set({ columns }),
  setConfig: (config) =>
    set((state) => ({
      config: { ...state.config, ...config },
    })),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setAuditReport: (report) => set({ auditReport: report }),
  setDemoMode: (isDemoMode, datasetName) =>
    set({ isDemoMode, selectedSampleDataset: datasetName || null }),
  setUploading: (isUploading) => set({ isUploading }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setGeneratingReport: (isGenerating) => set({ isGeneratingReport: isGenerating }),
  setUploadError: (error) => set({ uploadError: error }),
  setAnalysisError: (error) => set({ analysisError: error }),
  setReportError: (error) => set({ reportError: error }),
  reset: () => set(initialState),
}));
