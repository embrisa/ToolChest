import React from "react";
import { cn } from "@/utils";
import { Card, CardContent } from "./Card";

export interface ProgressInfo {
  progress: number;
  stage?: string;
  message?: string;
  estimatedTimeRemaining?: number;
}

export interface ProgressCardProps {
  progress: ProgressInfo;
  title?: string;
  className?: string;
  showTimeRemaining?: boolean;
  stageMessages?: Record<string, string>;
}

const defaultStageMessages: Record<string, string> = {
  reading: "Reading file...",
  processing: "Processing...",
  encoding: "Encoding...",
  decoding: "Decoding...",
  converting: "Converting...",
  compressing: "Compressing...",
  generating: "Generating...",
  validating: "Validating...",
  complete: "Complete!",
};

export function ProgressCard({
  progress,
  title,
  className,
  showTimeRemaining = true,
  stageMessages = defaultStageMessages,
}: ProgressCardProps) {
  const getStageMessage = () => {
    if (progress.message) {
      return progress.message;
    }

    if (progress.stage && stageMessages[progress.stage]) {
      return stageMessages[progress.stage];
    }

    return "Processing...";
  };

  const showETA =
    showTimeRemaining &&
    progress.estimatedTimeRemaining &&
    progress.estimatedTimeRemaining > 1;

  return (
    <Card variant="elevated" className={cn("animate-fade-in-up", className)}>
      <CardContent className="p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-body font-medium text-foreground">
              {getStageMessage()}
            </span>
            <span className="text-body text-foreground-secondary">
              {Math.round(progress.progress)}%
            </span>
          </div>

          {/* Generic Progress Bar */}
          <div className="space-y-2">
            <div
              className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 overflow-hidden"
              role="progressbar"
              aria-valuenow={progress.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={title || "Operation progress"}
            >
              <div
                className="bg-gradient-to-r from-brand-500 to-brand-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(0, progress.progress))}%`,
                }}
              />
            </div>

            {/* Screen reader announcement */}
            <div className="sr-only" role="status" aria-live="polite">
              {title || "Progress"}: {Math.round(progress.progress)}% complete.{" "}
              {getStageMessage()}.
              {showETA
                ? ` Estimated time remaining: ${progress.estimatedTimeRemaining} seconds.`
                : ""}
            </div>
          </div>

          {showETA && (
            <p className="text-sm text-foreground-secondary">
              Estimated time remaining: {progress.estimatedTimeRemaining}s
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
