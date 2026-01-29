import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UploadProgress {
  percent: number;
  uploadedBytes: number;
  totalBytes: number;
  speed: string;
  remainingTime: string;
}

interface UseChunkedUploadReturn {
  uploadFile: (
    file: File,
    folder: string,
    onProgress?: (progress: UploadProgress) => void
  ) => Promise<string>;
  isUploading: boolean;
  progress: UploadProgress | null;
  cancelUpload: () => void;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export const useChunkedUpload = (): UseChunkedUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const formatSpeed = (bytesPerSecond: number): string => {
    if (bytesPerSecond === 0) return "0 B/s";
    const k = 1024;
    const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds <= 0) return "calculating...";
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.ceil(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const uploadFile = useCallback(
    async (
      file: File,
      folder: string,
      onProgress?: (progress: UploadProgress) => void
    ): Promise<string> => {
      setIsUploading(true);
      const controller = new AbortController();
      setAbortController(controller);

      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        setIsUploading(false);
        throw new Error("No authentication token available");
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const totalSize = file.size;
      
      // For smaller files (< 50MB), use direct upload with XHR for progress
      if (totalSize < 50 * 1024 * 1024) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const url = `${supabaseUrl}/storage/v1/object/media/${fileName}`;
          const startTime = Date.now();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              const elapsedTime = (Date.now() - startTime) / 1000;
              const bytesPerSecond = event.loaded / elapsedTime;
              const remainingBytes = event.total - event.loaded;
              const remainingSeconds = remainingBytes / bytesPerSecond;

              const progressData: UploadProgress = {
                percent,
                uploadedBytes: event.loaded,
                totalBytes: event.total,
                speed: formatSpeed(bytesPerSecond),
                remainingTime: formatTime(remainingSeconds),
              };

              setProgress(progressData);
              onProgress?.(progressData);
            }
          });

          xhr.addEventListener("load", () => {
            setIsUploading(false);
            setProgress(null);
            if (xhr.status >= 200 && xhr.status < 300) {
              const { data } = supabase.storage.from("media").getPublicUrl(fileName);
              resolve(data.publicUrl);
            } else {
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          });

          xhr.addEventListener("error", () => {
            setIsUploading(false);
            setProgress(null);
            reject(new Error("Upload failed"));
          });

          xhr.addEventListener("abort", () => {
            setIsUploading(false);
            setProgress(null);
            reject(new Error("Upload cancelled"));
          });

          controller.signal.addEventListener("abort", () => {
            xhr.abort();
          });

          xhr.open("POST", url);
          xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
          xhr.setRequestHeader("x-upsert", "true");
          xhr.send(file);
        });
      }

      // For larger files, use chunked upload simulation with progress tracking
      try {
        const startTime = Date.now();
        let uploadedBytes = 0;
        const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
        
        // Upload the entire file but track progress in chunks
        const xhr = new XMLHttpRequest();
        const url = `${supabaseUrl}/storage/v1/object/media/${fileName}`;

        return new Promise((resolve, reject) => {
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              uploadedBytes = event.loaded;
              const percent = Math.round((uploadedBytes / totalSize) * 100);
              const elapsedTime = (Date.now() - startTime) / 1000;
              const bytesPerSecond = uploadedBytes / elapsedTime;
              const remainingBytes = totalSize - uploadedBytes;
              const remainingSeconds = remainingBytes / bytesPerSecond;

              const progressData: UploadProgress = {
                percent,
                uploadedBytes,
                totalBytes: totalSize,
                speed: formatSpeed(bytesPerSecond),
                remainingTime: formatTime(remainingSeconds),
              };

              setProgress(progressData);
              onProgress?.(progressData);
            }
          });

          xhr.addEventListener("load", () => {
            setIsUploading(false);
            setProgress(null);
            if (xhr.status >= 200 && xhr.status < 300) {
              const { data } = supabase.storage.from("media").getPublicUrl(fileName);
              resolve(data.publicUrl);
            } else {
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          });

          xhr.addEventListener("error", () => {
            setIsUploading(false);
            setProgress(null);
            reject(new Error("Upload failed"));
          });

          xhr.addEventListener("abort", () => {
            setIsUploading(false);
            setProgress(null);
            reject(new Error("Upload cancelled"));
          });

          controller.signal.addEventListener("abort", () => {
            xhr.abort();
          });

          xhr.open("POST", url);
          xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
          xhr.setRequestHeader("x-upsert", "true");
          xhr.send(file);
        });
      } catch (error) {
        setIsUploading(false);
        setProgress(null);
        throw error;
      }
    },
    []
  );

  const cancelUpload = useCallback(() => {
    abortController?.abort();
    setAbortController(null);
    setIsUploading(false);
    setProgress(null);
  }, [abortController]);

  return {
    uploadFile,
    isUploading,
    progress,
    cancelUpload,
  };
};
