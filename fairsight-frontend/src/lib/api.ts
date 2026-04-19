/**
 * FairSight AI — API Client
 * Axios instance configured with base URL and interceptors.
 */

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 60000, // 60s for AI report generation
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized — redirecting to login");
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiClient = {
  /** Upload a CSV dataset */
  uploadDataset: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** Run bias analysis */
  analyze: (data: {
    protected_attribute: string;
    outcome_column: string;
    task_type: string;
    dataset_id?: string;
    sample_dataset?: string;
  }) => api.post("/analyze", data),

  /** Generate AI audit report */
  generateReport: (data: {
    audit_id?: number;
    metrics_json?: string;
    group_stats_json?: string;
    dataset_name?: string;
    protected_attribute?: string;
    task_type?: string;
  }) => api.post("/report", data),

  /** Get audit history */
  getHistory: () => api.get("/history"),

  /** Get specific audit */
  getAudit: (id: number) => api.get(`/history/${id}`),

  /** Get sample datasets */
  getSampleDatasets: () => api.get("/datasets/samples"),

  /** Health check */
  healthCheck: () => api.get("/health"),
};

export default apiClient;
