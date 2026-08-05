// src/lib/uploadApi.ts
//
// File-upload calls need upload progress, which plain fetch() can't report -
// so these use XMLHttpRequest directly instead of going through apiFetch.
// Error shape is kept consistent with apiClient's ApiError so callers can
// use the same notifyError() helper either way.
import { API_BASE_URL, ApiError } from "./apiClient";

function uploadWithProgress<T = any>(
  path: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}${path}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let data: any = null;
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        data = xhr.responseText;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as T);
      } else {
        const message =
          typeof data === "string"
            ? data
            : data?.message || `Upload failed with status ${xhr.status}`;
        reject(new ApiError(message, xhr.status));
      }
    };

    xhr.onerror = () => {
      reject(new ApiError(`Could not reach the server at ${API_BASE_URL}. Is the backend running?`, 0));
    };

    xhr.send(formData);
  });
}

export type CarImageUploadResponse = { urls: string[] };

export const uploadCarImages = async (
  files: File[],
  onProgress?: (percent: number) => void
): Promise<CarImageUploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return uploadWithProgress<CarImageUploadResponse>("/api/Upload/car-images", formData, onProgress);
};

export type NewCarImportRowResult = {
  rowNumber: number;
  success: boolean;
  error?: string | null;
  car?: Record<string, any> | null;
};

export type NewCarImportResult = {
  importBatchId: string;
  totalRows: number;
  successCount: number;
  failureCount: number;
  rows: NewCarImportRowResult[];
};

export const previewNewCarsDataset = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<NewCarImportResult> => {
  const formData = new FormData();
  formData.append("file", file);
  return uploadWithProgress<NewCarImportResult>("/api/NewCars/preview", formData, onProgress);
};

export const uploadNewCarsDataset = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<NewCarImportResult> => {
  const formData = new FormData();
  formData.append("file", file);
  return uploadWithProgress<NewCarImportResult>("/api/NewCars/upload", formData, onProgress);
};
