"use client";

import React from "react";
import { Button } from "./Button";
import { cn } from "@/utils";
import { useClipboard } from "@/hooks/useClipboard";
import { downloadBlob } from "@/utils/file-processing";

export type CopyExportBarProps = {
  value?: string | null;
  rawValue?: string | null;
  jsonValue?: unknown;
  filename?: string;
  mimeType?: string;
  onDownloadData?: () =>
    | Blob
    | string
    | ArrayBuffer
    | Uint8Array
    | Promise<Blob | string | ArrayBuffer | Uint8Array | null | undefined>
    | null
    | undefined;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  labels?: Partial<{
    copy: string;
    copyRaw: string;
    copyJSON: string;
    download: string;
    copied: string;
  }>;
  onAnnounce?: (msg: string, kind?: "polite" | "assertive") => void;
};

export function CopyExportBar({
  value,
  rawValue,
  jsonValue,
  filename = "result.txt",
  mimeType = "text/plain;charset=utf-8",
  onDownloadData,
  disabled = false,
  compact = false,
  className,
  labels,
  onAnnounce,
}: CopyExportBarProps) {
  const { copyText, copyJSON, copyRaw } = useClipboard();
  const [copiedKind, setCopiedKind] = React.useState<
    null | "copy" | "copyRaw" | "copyJSON"
  >(null);

  const text = (value ?? "").toString();
  const canCopy = Boolean(value && value.length > 0);
  const canCopyRaw = Boolean(rawValue && rawValue.length > 0);
  const canCopyJSON = jsonValue !== undefined && jsonValue !== null;
  const canDownload = Boolean(
    onDownloadData || canCopy || canCopyRaw || canCopyJSON,
  );

  const L = {
    copy: labels?.copy ?? "Copy",
    copyRaw: labels?.copyRaw ?? "Copy raw",
    copyJSON: labels?.copyJSON ?? "Copy JSON",
    download: labels?.download ?? "Download",
    copied: labels?.copied ?? "Copied!",
  } as const;

  const handleCopy = async () => {
    if (!canCopy) return;
    const res = await copyText(text);
    setCopiedKind(res.success ? "copy" : null);
    onAnnounce?.(res.message, res.success ? "polite" : "assertive");
    if (res.success) setTimeout(() => setCopiedKind(null), 1500);
  };

  const handleCopyRaw = async () => {
    if (!canCopyRaw) return;
    const res = await copyRaw(rawValue as string);
    setCopiedKind(res.success ? "copyRaw" : null);
    onAnnounce?.(res.message, res.success ? "polite" : "assertive");
    if (res.success) setTimeout(() => setCopiedKind(null), 1500);
  };

  const handleCopyJSON = async () => {
    if (!canCopyJSON) return;
    const res = await copyJSON(jsonValue, true);
    setCopiedKind(res.success ? "copyJSON" : null);
    onAnnounce?.(res.message, res.success ? "polite" : "assertive");
    if (res.success) setTimeout(() => setCopiedKind(null), 1500);
  };

  const handleDownload = async () => {
    try {
      const maybeData = onDownloadData?.();
      const data = maybeData instanceof Promise ? await maybeData : maybeData;
      let blob: Blob | null = null;
      if (data instanceof Blob) {
        blob = data;
      } else if (data instanceof Uint8Array) {
        blob = new Blob([data], { type: mimeType });
      } else if (data instanceof ArrayBuffer) {
        blob = new Blob([new Uint8Array(data)], { type: mimeType });
      } else if (typeof data === "string") {
        blob = new Blob([data], { type: mimeType });
      } else if (data == null) {
        // Fallback: try value/raw/json
        if (canCopyRaw) blob = new Blob([rawValue as string], { type: mimeType });
        else if (canCopy) blob = new Blob([text], { type: mimeType });
        else if (canCopyJSON)
          blob = new Blob([JSON.stringify(jsonValue, null, 2)], {
            type: "application/json;charset=utf-8",
          });
      }
      if (!blob) {
        onAnnounce?.("No data available to download", "assertive");
        return;
      }
      downloadBlob(blob, filename);
      onAnnounce?.(`Downloaded ${filename}`, "polite");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Download failed";
      onAnnounce?.(`Download failed: ${msg}`, "assertive");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap gap-3 items-center",
        compact ? "justify-end" : "justify-start",
        className,
      )}
    >
      <Button
        variant="secondary"
        size={compact ? "sm" : "md"}
        onClick={handleCopy}
        disabled={disabled || !canCopy}
        className={cn(copiedKind === "copy" && "bg-success-100 text-success-800")}
        aria-label="Copy result"
      >
        {copiedKind === "copy" ? L.copied : L.copy}
      </Button>
      <Button
        variant="secondary"
        size={compact ? "sm" : "md"}
        onClick={handleCopyRaw}
        disabled={disabled || !canCopyRaw}
        className={cn(
          copiedKind === "copyRaw" && "bg-success-100 text-success-800",
        )}
        aria-label="Copy raw result"
      >
        {copiedKind === "copyRaw" ? L.copied : L.copyRaw}
      </Button>
      <Button
        variant="secondary"
        size={compact ? "sm" : "md"}
        onClick={handleCopyJSON}
        disabled={disabled || !canCopyJSON}
        className={cn(
          copiedKind === "copyJSON" && "bg-success-100 text-success-800",
        )}
        aria-label="Copy JSON result"
      >
        {copiedKind === "copyJSON" ? L.copied : L.copyJSON}
      </Button>
      <Button
        variant="primary"
        size={compact ? "sm" : "md"}
        onClick={handleDownload}
        disabled={disabled || !canDownload}
        aria-label="Download result"
      >
        {L.download}
      </Button>
    </div>
  );
}
