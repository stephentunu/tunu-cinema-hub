import { useState } from "react";
import { Link, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FileDropZone } from "./FileDropZone";
import { cn } from "@/lib/utils";

interface VideoInputProps {
  id: string;
  label: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  url: string;
  onUrlChange: (url: string) => void;
  existingUrl?: string | null;
}

export const VideoInput = ({
  id,
  label,
  file,
  onFileSelect,
  url,
  onUrlChange,
  existingUrl,
}: VideoInputProps) => {
  const [mode, setMode] = useState<"file" | "url">(url ? "url" : "file");

  const handleModeSwitch = (newMode: "file" | "url") => {
    if (newMode === "file") {
      onUrlChange("");
    } else {
      onFileSelect(null);
    }
    setMode(newMode);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex rounded-lg border border-muted-foreground/25 overflow-hidden">
          <button
            type="button"
            onClick={() => handleModeSwitch("file")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 text-xs font-medium transition-colors",
              mode === "file"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Upload className="w-3 h-3" />
            File
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("url")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 text-xs font-medium transition-colors",
              mode === "url"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Link className="w-3 h-3" />
            URL
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <FileDropZone
          id={id}
          label=""
          type="video"
          accept=".mp4,.mkv,.avi,.mov,.wmv,.flv,.webm,.m4v,.mpeg,.mpg,.3gp,.ts,video/*"
          file={file}
          onFileSelect={onFileSelect}
          existingUrl={existingUrl}
        />
      ) : (
        <Input
          placeholder="https://example.com/video.mp4"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
        />
      )}
    </div>
  );
};
