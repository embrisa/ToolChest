"use client";

import React from "react";
import { Button } from "./Button";
import { cn } from "@/utils";

export interface FileInfoProps {
  file: File;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
  showSize?: boolean;
  showType?: boolean;
  icon?: React.ReactNode;
}

const defaultFileIcon = (
  <svg
    className="h-8 w-8 text-neutral-600 dark:text-neutral-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const imageFileIcon = (
  <svg
    className="h-8 w-8 text-neutral-600 dark:text-neutral-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

export function FileInfo({
  file,
  onRemove,
  disabled = false,
  className,
  showSize = true,
  showType = true,
  icon,
}: FileInfoProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = () => {
    if (icon) return icon;
    if (file.type.startsWith("image/")) return imageFileIcon;
    return defaultFileIcon;
  };

  return (
    <div
      className={cn(
        "bg-background-tertiary rounded-2xl p-6 animate-fade-in-up border border-border-secondary",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div
              className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center",
                "bg-gradient-to-br from-neutral-100 to-neutral-200",
                "dark:from-neutral-800 dark:to-neutral-700",
              )}
            >
              {getFileIcon()}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-body font-medium text-foreground truncate mb-1">
              {file.name}
            </p>
            <div className="flex items-center gap-3 text-sm text-foreground-secondary">
              {showSize && <span>{formatFileSize(file.size)}</span>}
              {showType && file.type && (
                <>
                  {showSize && <span>•</span>}
                  <span>{file.type}</span>
                </>
              )}
            </div>
          </div>
        </div>
        {onRemove && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRemove}
            aria-label="Remove selected file"
            disabled={disabled}
            className="h-10"
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
