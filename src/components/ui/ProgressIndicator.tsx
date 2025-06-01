"use client";

import { Base64Progress } from "@/types/tools/base64";
import { cn } from "@/utils";

interface ProgressIndicatorProps {
  progress: Base64Progress;
  label?: string;
  className?: string;
}

export function ProgressIndicator({
  progress,
  label = "Processing",
  className = "",
}: ProgressIndicatorProps) {
  const {
    stage,
    progress: percent,
    bytesProcessed,
    totalBytes,
    estimatedTimeRemaining,
  } = progress;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStageLabel = (stage: string): string => {
    switch (stage) {
      case "reading":
        return "Reading file";
      case "processing":
        return "Processing data";
      case "complete":
        return "Complete";
      default:
        return "Processing";
    }
  };

  const formatTimeRemaining = (seconds?: number): string => {
    if (!seconds || seconds <= 0) return "";
    if (seconds < 60) return `${Math.round(seconds)}s remaining`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s remaining`;
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Screen reader friendly progress announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {label}: {percent}% complete. {getStageLabel(stage)}.
        {estimatedTimeRemaining
          ? ` ${formatTimeRemaining(estimatedTimeRemaining)}`
          : ""}
      </div>

      {/* Visual progress bar */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-primary font-medium">
            {getStageLabel(stage)}
          </span>
          <span className="text-secondary font-medium">
            {Math.round(percent)}%
          </span>
        </div>

        <div className="relative">
          <div
            className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label} progress`}
          >
            <div
              className="bg-gradient-to-r from-brand-500 to-brand-600 h-3 rounded-full transition-all duration-300 ease-out shadow-sm"
              style={{ width: `${percent}%` }}
            />
          </div>
          {/* Glow effect for enhanced visual appeal */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-brand-600/20 rounded-full blur-sm -z-10"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Progress details */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-secondary">
            {formatBytes(bytesProcessed)} / {formatBytes(totalBytes)}
          </span>
          {estimatedTimeRemaining && estimatedTimeRemaining > 1 && (
            <span className="text-secondary">
              {formatTimeRemaining(estimatedTimeRemaining)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
