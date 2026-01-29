import { useState, useRef, useCallback } from "react";
import { Upload, X, File, Film, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  accept: string;
  onFileSelect: (file: File | null) => void;
  file: File | null;
  existingUrl?: string | null;
  label: string;
  type: "image" | "video";
  id: string;
}

export const FileDropZone = ({
  accept,
  onFileSelect,
  file,
  existingUrl,
  label,
  type,
  id,
}: FileDropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) {
        onFileSelect(droppedFile);
      }
    },
    [onFileSelect]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileSelect(selectedFile);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const getFileIcon = () => {
    if (type === "video") return <Film className="w-8 h-8" />;
    return <Image className="w-8 h-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 cursor-pointer",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragOver
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-muted-foreground/25",
          file && "border-primary/50 bg-primary/5"
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {file ? (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {getFileIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="p-3 rounded-full bg-muted text-muted-foreground">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                Drop {type === "video" ? "video" : "image"} here
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse
              </p>
            </div>
          </div>
        )}

        {!file && existingUrl && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Current: {existingUrl.split("/").pop()}
          </p>
        )}
      </div>
    </div>
  );
};
