"use client";

import { Button } from "./Button";
import { ProgressIndicator } from "./ProgressIndicator";
import type { FileReadProgress } from "@/hooks/useCancelableFileReader";
import { cn } from "@/utils";

type FileReadProgressProps = {
  progress: FileReadProgress;
  label?: string;
  note?: string;
  onCancel?: () => void;
  cancelLabel?: string;
  className?: string;
};

export function FileReadProgress({
  progress,
  label = "Processing file",
  note,
  onCancel,
  cancelLabel = "Cancel",
  className,
}: FileReadProgressProps) {
  const percent =
    progress.total > 0
      ? Math.min(100, Math.round((progress.loaded / progress.total) * 100))
      : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <ProgressIndicator
        progress={{
          stage: "reading",
          progress: percent,
          bytesProcessed: progress.loaded,
          totalBytes: progress.total,
        }}
        label={label}
        className="w-full"
      />
      <div className="flex items-center justify-between gap-3 text-sm text-foreground-tertiary flex-wrap">
        <span>
          {note ??
            `${label}${
              progress.total > 0
                ? ` (${(progress.total / (1024 * 1024)).toFixed(2)} MB)`
                : ""
            }`}
        </span>
        {onCancel && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onCancel}
            aria-label={cancelLabel}
          >
            {cancelLabel}
          </Button>
        )}
      </div>
    </div>
  );
}


