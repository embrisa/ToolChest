"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Card, CardHeader, CardContent } from "./Card";
import { Button } from "./Button";
import { FileUpload } from "./FileUpload";
import { Alert, AlertList } from "./Alert";
import { cn } from "@/utils";

export type ImportMode = "text" | "file";

export type ImportPanelProps = {
  mode: ImportMode;
  onModeChange: (mode: ImportMode) => void;
  textValue: string;
  onTextChange: (value: string) => void;
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  largeHintThresholdMB?: number;
  placeholder?: string;
  title?: string;
  description?: string;
  showPasteButton?: boolean;
  className?: string;
  textareaRows?: number;
  disabled?: boolean;
  onAnnounce?: (msg: string, kind?: "polite" | "assertive") => void;
  modes?: ImportMode[]; // limit visible modes; default ['text','file']
  onValidationChange?: (errors: { code: string; message: string }[]) => void;
  labels?: Partial<{
    textMode: string;
    fileMode: string;
    pasteFromClipboard: string;
    clearText: string;
    characters: string;
    validationErrors: string;
    filePasteTip: string;
  }>;
  fileSubtitle?: string;
};

export function ImportPanel({
  mode,
  onModeChange,
  textValue,
  onTextChange,
  onFileSelect,
  accept,
  maxSizeMB = 10,
  largeHintThresholdMB = 5,
  placeholder = "Paste or type here...",
  title = "Input",
  description,
  showPasteButton = true,
  className,
  textareaRows = 8,
  disabled = false,
  onAnnounce,
  modes = ["text", "file"],
  onValidationChange,
  labels,
  fileSubtitle,
}: ImportPanelProps) {
  const generatedId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [validationErrors, setValidationErrors] = useState<
    { code: string; message: string }[]
  >([]);
  const [largeHint, setLargeHint] = useState<string | null>(null);
  const [lastFileInfo, setLastFileInfo] = useState<{ name: string; sizeMB: number } | null>(
    null,
  );

  const maxBytes = Math.max(0, maxSizeMB) * 1024 * 1024;
  const largeThresholdBytes = Math.max(0, largeHintThresholdMB) * 1024 * 1024;

  useEffect(() => {
    onValidationChange?.(validationErrors);
  }, [validationErrors, onValidationChange]);

  // Validate text size and set large-input hint
  useEffect(() => {
    if (mode !== "text") return;
    try {
      const bytes = new Blob([textValue || ""]).size;
      const errs: { code: string; message: string }[] = [];
      if (bytes > maxBytes) {
        const mb = (bytes / (1024 * 1024)).toFixed(2);
        errs.push({
          code: "text-too-large",
          message: `Text input too large: ${mb} MB (max ${maxSizeMB} MB)`,
        });
        onAnnounce?.("Text exceeds maximum size", "assertive");
      }
      setValidationErrors(errs);
      if (bytes >= largeThresholdBytes && bytes <= maxBytes) {
        const mb = (bytes / (1024 * 1024)).toFixed(2);
        setLargeHint(`Large input (~${mb} MB). Processing may take a moment.`);
      } else {
        setLargeHint(null);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textValue, mode, maxBytes, largeThresholdBytes, maxSizeMB]);

  const handleFileSelected = useCallback(
    (file: File) => {
      if (!file) return;
      const sizeMB = file.size / (1024 * 1024);
      setLastFileInfo({ name: file.name, sizeMB });
      if (file.size > maxBytes) {
        const msg = `File too large: ${sizeMB.toFixed(2)} MB (max ${maxSizeMB} MB)`;
        setValidationErrors([{ code: "file-too-large", message: msg }]);
        onAnnounce?.("File too large", "assertive");
        return; // Do not propagate oversize files
      }
      setValidationErrors([]);
      if (file.size >= largeThresholdBytes) {
        setLargeHint(
          `Large file detected (~${sizeMB.toFixed(2)} MB). Reading may take a moment...`,
        );
      } else {
        setLargeHint(null);
      }
      onFileSelect(file);
    },
    [maxBytes, largeThresholdBytes, maxSizeMB, onAnnounce, onFileSelect],
  );

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          onTextChange(text);
          onModeChange("text");
          onAnnounce?.("Pasted from clipboard", "polite");
          textareaRef.current?.focus();
        } else {
          onAnnounce?.("Clipboard is empty", "assertive");
        }
      } else {
        onAnnounce?.("Clipboard API unavailable", "assertive");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Paste failed";
      onAnnounce?.(`Paste failed: ${msg}`, "assertive");
    }
  }, [onTextChange, onModeChange, onAnnounce]);

  const handleAreaPaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement | HTMLDivElement>) => {
      if (mode !== "file") return; // only intercept in file mode when pasting files
      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;
      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFileSelected(file);
            onAnnounce?.(`Pasted file: ${file.name}`, "polite");
            return;
          }
        }
      }
    },
    [mode, handleFileSelected, onAnnounce],
  );

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-title text-xl font-semibold text-foreground">
              {title}
            </h2>
            {description && (
              <p className="text-body text-foreground-secondary mt-1">
                {description}
              </p>
            )}
          </div>
          {modes.length > 1 && (
            <div className="flex gap-2">
              {modes.includes("text") && (
              <Button
                variant={mode === "text" ? "primary" : "secondary"}
                size="sm"
                onClick={() => onModeChange("text")}
                aria-pressed={mode === "text"}
              >
                {labels?.textMode ?? "Text"}
              </Button>
              )}
              {modes.includes("file") && (
              <Button
                variant={mode === "file" ? "primary" : "secondary"}
                size="sm"
                onClick={() => onModeChange("file")}
                aria-pressed={mode === "file"}
              >
                {labels?.fileMode ?? "File"}
              </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {mode === "text" ? (
          <div className="space-y-3">
            <textarea
              id={`import-textarea-${generatedId}`}
              ref={textareaRef}
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder={placeholder}
              rows={textareaRows}
              className={cn(
                "input-field resize-vertical text-code bg-background-tertiary",
              )}
              aria-label={labels?.textMode ? `${labels.textMode} input` : "Text input"}
              disabled={disabled}
            />
            <div className="flex gap-3 justify-between flex-wrap">
              <div className="flex gap-3">
                {showPasteButton && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePasteFromClipboard}
                    disabled={disabled}
                  >
                    {labels?.pasteFromClipboard ?? "Paste from clipboard"}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onTextChange("")}
                  disabled={disabled || textValue.length === 0}
                >
                  {labels?.clearText ?? "Clear"}
                </Button>
              </div>
              <div className="text-sm text-foreground-tertiary">
                {textValue.length} {labels?.characters ?? "characters"}
              </div>
            </div>
            {largeHint && validationErrors.length === 0 && (
              <p className="text-sm text-foreground-tertiary">{largeHint}</p>
            )}
            {validationErrors.length > 0 && (
              <Alert variant="error" title={labels?.validationErrors ?? "Validation Errors"}>
                <AlertList items={validationErrors.map((e) => e.message)} />
              </Alert>
            )}
          </div>
        ) : (
          <div onPaste={handleAreaPaste}>
            <FileUpload
              onFileSelect={handleFileSelected}
              accept={accept}
              maxSize={maxSizeMB}
              disabled={disabled}
              subtitle={fileSubtitle ?? `Supported: ${accept || "any"} • Max ${maxSizeMB}MB`}
            />
            <p className="mt-3 text-sm text-foreground-tertiary">
              {labels?.filePasteTip ?? "Tip: You can also paste a file here."}
            </p>
            <p className="text-sm text-foreground-tertiary">
              {`Max ${maxSizeMB}MB. Files over ${largeHintThresholdMB}MB show progress while reading.`}
            </p>
            {lastFileInfo && lastFileInfo.sizeMB * 1024 * 1024 >= largeThresholdBytes &&
              lastFileInfo.sizeMB * 1024 * 1024 <= maxBytes && (
                <p className="mt-2 text-sm text-foreground-tertiary">
                  {`Large file detected (~${lastFileInfo.sizeMB.toFixed(2)} MB). Reading may take a moment...`}
                </p>
              )}
            {validationErrors.length > 0 && (
              <div className="mt-3">
                <Alert variant="error" title={labels?.validationErrors ?? "Validation Errors"}>
                  <AlertList items={validationErrors.map((e) => e.message)} />
                </Alert>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
