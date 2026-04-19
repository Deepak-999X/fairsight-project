/**
 * FairSight AI — Upload Zone Component
 * Drag-and-drop file upload with file preview.
 */

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, X, CheckCircle2 } from "lucide-react";
import { useUploadStore } from "../../store/uploadStore";
import apiClient from "../../lib/api";

export function UploadZone() {
  const navigate = useNavigate();
  const { file, setFile, isUploading, setUploading, setUploadResponse, setUploadError, uploadError } = useUploadStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setUploading(true);
        setUploadError(null);

        try {
          const response = await apiClient.uploadDataset(selectedFile);
          setUploadResponse(response.data);
          navigate("/configure");
        } catch (error: any) {
          console.error("Upload failed:", error);
          setUploadError(error.response?.data?.detail || "Failed to upload file");
          setFile(null);
        } finally {
          setUploading(false);
        }
      }
    },
    [setFile, setUploading, setUploadResponse, setUploadError, navigate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/octet-stream": [".pkl"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <div>
      {uploadError && (
        <div className="mb-4 p-3 bg-danger-light border border-danger/20 text-danger text-sm rounded-lg flex items-center gap-2">
          <X className="w-4 h-4 flex-shrink-0" />
          <p>{uploadError}</p>
        </div>
      )}
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? "upload-zone-active" : ""} ${
          isUploading ? "pointer-events-none border-brand-blue bg-brand-light/30" : ""
        }`}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-brand-light rounded-xl flex items-center justify-center mb-3">
              <Upload className="w-7 h-7 text-brand-blue animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-brand-blue">
              Uploading dataset...
            </p>
            <p className="text-caption text-brand-blue/70 mt-1">
              Please wait while we parse the file
            </p>
          </div>
        ) : file ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-14 h-14 bg-success-light rounded-xl flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7 text-success" />
            </div>
            <p className="text-sm font-semibold text-text-primary">
              {file.name}
            </p>
            <p className="text-caption text-text-secondary mt-1">
              {(file.size / 1024).toFixed(1)} KB
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setUploadError(null);
              }}
              className="mt-3 flex items-center gap-1 text-xs text-danger hover:text-danger/80 transition-colors"
            >
              <X className="w-3 h-3" />
              Remove
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-brand-light rounded-xl flex items-center justify-center mb-3">
              {isDragActive ? (
                <FileSpreadsheet className="w-7 h-7 text-brand-blue animate-bounce" />
              ) : (
                <Upload className="w-7 h-7 text-brand-blue" />
              )}
            </div>
            <p className="text-sm font-semibold text-text-primary">
              {isDragActive ? "Drop your file here" : "Drag & drop your CSV file"}
            </p>
            <p className="text-caption text-text-secondary mt-1">
              or click to browse • CSV up to 50MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
