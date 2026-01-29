import { Loader2, X, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface UploadProgressBarProps {
  fileName: string;
  percent: number;
  speed?: string;
  remainingTime?: string;
  uploadedBytes?: number;
  totalBytes?: number;
  chunksCompleted?: number;
  totalChunks?: number;
  onCancel?: () => void;
}

export const UploadProgressBar = ({
  fileName,
  percent,
  speed,
  remainingTime,
  uploadedBytes,
  totalBytes,
  chunksCompleted,
  totalChunks,
  onCancel,
}: UploadProgressBarProps) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
          <span className="text-sm font-medium truncate">{fileName}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-bold text-primary">{percent}%</span>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onCancel}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      <Progress value={percent} className="h-2" />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {uploadedBytes !== undefined && totalBytes !== undefined && (
            <span>
              {formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}
            </span>
          )}
          {speed && (
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary" />
              {speed}
            </span>
          )}
          {chunksCompleted !== undefined && totalChunks !== undefined && totalChunks > 1 && (
            <span className="text-muted-foreground/70">
              Chunk {chunksCompleted}/{totalChunks}
            </span>
          )}
        </div>
        {remainingTime && <span>{remainingTime} remaining</span>}
      </div>
    </div>
  );
};
