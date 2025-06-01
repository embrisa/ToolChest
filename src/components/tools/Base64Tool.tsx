"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  ProgressIndicator,
  AriaLiveRegion,
  useAccessibilityAnnouncements,
  Alert,
  AlertList,
  Loading,
  TextareaLoadingWrapper,
} from "@/components/ui";
import { Base64Service } from "@/services/tools/base64Service";
import {
  Base64State,
  Base64Result,
  A11yAnnouncement,
  ClipboardResult,
} from "@/types/tools/base64";
import { cn } from "@/utils";

export function Base64Tool() {
  const [state, setState] = useState<Base64State>({
    mode: "encode",
    variant: "standard",
    inputType: "text",
    textInput: "",
    fileInput: null,
    result: null,
    isProcessing: false,
    progress: null,
    error: null,
    warnings: [],
    validationErrors: [],
  });

  const [dragActive, setDragActive] = useState(false);
  const [copySuccess, setCopySuccess] = useState<ClipboardResult | null>(null);
  const [announcement, setAnnouncement] = useState<A11yAnnouncement | null>(
    null,
  );

  const { announceToScreenReader } = useAccessibilityAnnouncements();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef(state);
  const lastProcessedInputRef = useRef<{ inputType: string; textInput: string; fileInput: File | null }>({
    inputType: "",
    textInput: "",
    fileInput: null,
  });

  // Keep stateRef current
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Process Base64 operation with enhanced error handling and progress
  const processBase64 = useCallback(async (shouldTrackUsage = true) => {
    // Get current state values to avoid stale closures
    const currentState = stateRef.current;

    if (currentState.inputType === "text" && !currentState.textInput.trim()) {
      setState((prev) => ({
        ...prev,
        result: null,
        error: null,
        progress: null,
        warnings: [],
        validationErrors: [],
      }));
      return;
    }

    if (currentState.inputType === "file" && !currentState.fileInput) {
      setState((prev) => ({
        ...prev,
        result: null,
        error: null,
        progress: null,
        warnings: [],
        validationErrors: [],
      }));
      return;
    }

    // Validate input before processing
    if (currentState.inputType === "file" && currentState.fileInput) {
      const validation = Base64Service.validateFile(currentState.fileInput);
      if (!validation.isValid) {
        setState((prev) => ({
          ...prev,
          error: validation.error || "File validation failed",
          validationErrors: validation.validationErrors || [],
          warnings: validation.warnings || [],
        }));

        setAnnouncement(
          announceToScreenReader(
            `File validation failed: ${validation.error}`,
            "assertive",
          ),
        );
        return;
      }
    }

    setState((prev) => ({
      ...prev,
      isProcessing: true,
      error: null,
      progress: null,
      validationErrors: [],
    }));

    // Announce start of processing to screen readers
    setAnnouncement(
      announceToScreenReader(`Starting ${currentState.mode} operation`, "polite"),
    );

    try {
      const input =
        currentState.inputType === "text" ? currentState.textInput : currentState.fileInput!;
      const inputSize =
        currentState.inputType === "text"
          ? currentState.textInput.length
          : currentState.fileInput!.size;

      const result: Base64Result = await Base64Service[currentState.mode]({
        mode: currentState.mode,
        variant: currentState.variant,
        inputType: currentState.inputType,
        input,
        onProgress: (progress) => {
          setState((prev) => ({ ...prev, progress }));
        },
      });

      setState((prev) => ({
        ...prev,
        result,
        error: result.success ? null : result.error || "Operation failed",
        warnings: result.warnings || [],
        isProcessing: false,
        progress: null,
      }));

      // Track usage analytics only when explicitly requested (privacy-compliant)
      if (shouldTrackUsage && result.success && inputSize > 0) {
        Base64Service.trackUsage({
          operation: currentState.mode,
          inputType: currentState.inputType,
          variant: currentState.variant,
          inputSize,
          outputSize: result.success ? result.data?.length || 0 : 0,
          processingTime: result.processingTime || 0,
          success: result.success,
          clientSide: !result.serverSide,
          error: result.success ? undefined : result.error,
        });
      }

      // Announce completion
      if (result.success) {
        setAnnouncement(
          announceToScreenReader(
            `${currentState.mode} operation completed successfully`,
            "polite",
          ),
        );
      } else {
        setAnnouncement(
          announceToScreenReader(
            `${currentState.mode} operation failed: ${result.error}`,
            "assertive",
          ),
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Operation failed";
      setState((prev) => ({
        ...prev,
        result: null,
        error: errorMessage,
        isProcessing: false,
        progress: null,
      }));

      setAnnouncement(
        announceToScreenReader(
          `Operation failed: ${errorMessage}`,
          "assertive",
        ),
      );
    }
  }, [
    // Use a ref for state to avoid recreating this function on every state change
    // This prevents the infinite loop since the callback won't change
    announceToScreenReader,
  ]);

  // Manual processing function for explicit user actions
  const manualProcess = useCallback(() => {
    // Clear the last processed input to allow reprocessing
    lastProcessedInputRef.current = {
      inputType: "",
      textInput: "",
      fileInput: null,
    };
    processBase64(true); // Track usage for manual processing
  }, [processBase64]);

  // Clear last processed input when mode or variant changes
  useEffect(() => {
    lastProcessedInputRef.current = {
      inputType: "",
      textInput: "",
      fileInput: null,
    };
  }, [state.mode, state.variant]);

  // Auto-process when inputs change (with debouncing for text)
  useEffect(() => {
    // Check if input has actually changed and we're not already processing
    const currentInput = {
      inputType: state.inputType,
      textInput: state.textInput,
      fileInput: state.fileInput,
    };

    const lastProcessed = lastProcessedInputRef.current;
    const hasInputChanged =
      currentInput.inputType !== lastProcessed.inputType ||
      currentInput.textInput !== lastProcessed.textInput ||
      currentInput.fileInput !== lastProcessed.fileInput;

    // Don't process if input hasn't changed or if already processing
    if (!hasInputChanged || state.isProcessing) {
      return;
    }

    if (state.inputType === "text" && state.textInput.trim()) {
      // Process immediately for instant feedback
      lastProcessedInputRef.current = { ...currentInput };
      processBase64(false); // Don't track usage for auto-processing
    } else if (state.inputType === "file" && state.fileInput) {
      // Process immediately for files, but update the ref first
      lastProcessedInputRef.current = { ...currentInput };
      processBase64(false); // Don't track usage for auto-processing
    }
  }, [
    // Only depend on the actual input values, not the processing function
    state.inputType,
    state.textInput,
    state.fileInput,
    state.isProcessing, // Include this to prevent processing when already processing
  ]);

  // Enhanced file selection with validation
  const handleFileSelect = useCallback(
    (file: File) => {
      const validation = Base64Service.validateFile(file);

      setState((prev) => ({
        ...prev,
        fileInput: file,
        error: validation.isValid ? null : validation.error || "Invalid file",
        warnings: validation.warnings || [],
        validationErrors: validation.validationErrors || [],
        result: null,
      }));

      if (!validation.isValid) {
        setAnnouncement(
          announceToScreenReader(
            `File validation failed: ${validation.error}`,
            "assertive",
          ),
        );
      } else {
        const warnings = validation.warnings?.join(". ") || "";
        setAnnouncement(
          announceToScreenReader(
            `File selected: ${file.name}. ${warnings}`,
            "polite",
          ),
        );
      }
    },
    [announceToScreenReader],
  );

  // Enhanced drag and drop handlers with accessibility
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      } else {
        setAnnouncement(
          announceToScreenReader(
            "No valid file found in drop operation",
            "assertive",
          ),
        );
      }
    },
    [handleFileSelect, announceToScreenReader],
  );

  // Enhanced copy to clipboard with accessibility feedback
  const handleCopy = useCallback(async () => {
    if (!state.result?.data) return;

    const result = await Base64Service.copyToClipboard(state.result.data);
    setCopySuccess(result);

    setAnnouncement(
      announceToScreenReader(
        result.announceToScreenReader || result.message,
        result.success ? "polite" : "assertive",
      ),
    );

    if (result.success) {
      setTimeout(() => setCopySuccess(null), 3000);
    }
  }, [state.result, announceToScreenReader]);

  // Download result with accessibility feedback
  const handleDownload = useCallback(() => {
    if (!state.result?.data) return;

    try {
      const filename = Base64Service.generateFilename(
        state.mode,
        state.result.filename || state.fileInput?.name,
      );

      Base64Service.generateDownload({
        content: state.result.data,
        filename,
        contentType: "text/plain",
      });

      setAnnouncement(
        announceToScreenReader(`Download started for ${filename}`, "polite"),
      );
    } catch {
      setAnnouncement(
        announceToScreenReader(
          "Download failed. Please try again.",
          "assertive",
        ),
      );
    }
  }, [state.result, state.mode, state.fileInput, announceToScreenReader]);

  // Clear file input
  const handleClearFile = useCallback(() => {
    setState((prev) => ({
      ...prev,
      fileInput: null,
      result: null,
      error: null,
      warnings: [],
      validationErrors: [],
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setAnnouncement(announceToScreenReader("File cleared", "polite"));
  }, [announceToScreenReader]);

  return (
    <div className="container-wide space-y-12">
      {/* ARIA live region for screen reader announcements */}
      <AriaLiveRegion announcement={announcement} />

      {/* Mode and Variant Selection */}
      <Card variant="elevated" className="tool-card-base64">
        <CardHeader className="pb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="tool-icon tool-icon-base64 h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30 flex items-center justify-center">
              <span className="text-lg font-bold text-brand-700 dark:text-brand-300">B64</span>
            </div>
            <div>
              <h2 className="text-title text-2xl font-semibold text-foreground mb-2">
                Base64 Operation Settings
              </h2>
              <p className="text-body text-foreground-secondary">
                Choose your encoding/decoding preferences
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mode Selection */}
            <div className="space-y-4">
              <label className="text-body font-medium text-foreground">Operation Mode</label>
              <div className="flex gap-3">
                <Button
                  variant={state.mode === "encode" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      mode: "encode",
                      result: null,
                    }))
                  }
                  aria-pressed={state.mode === "encode"}
                  className="flex-1 h-12"
                >
                  Encode
                </Button>
                <Button
                  variant={state.mode === "decode" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      mode: "decode",
                      result: null,
                    }))
                  }
                  aria-pressed={state.mode === "decode"}
                  className="flex-1 h-12"
                >
                  Decode
                </Button>
              </div>
            </div>

            {/* Input Type Selection */}
            <div className="space-y-4">
              <label className="text-body font-medium text-foreground">Input Type</label>
              <div className="flex gap-3">
                <Button
                  variant={state.inputType === "text" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      inputType: "text",
                      result: null,
                      fileInput: null,
                    }))
                  }
                  aria-pressed={state.inputType === "text"}
                  className="flex-1 h-12"
                >
                  Text
                </Button>
                <Button
                  variant={state.inputType === "file" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      inputType: "file",
                      result: null,
                      textInput: "",
                    }))
                  }
                  aria-pressed={state.inputType === "file"}
                  className="flex-1 h-12"
                >
                  File
                </Button>
              </div>
            </div>

            {/* Variant Selection */}
            <div className="space-y-4">
              <label className="text-body font-medium text-foreground">Base64 Variant</label>
              <div className="flex gap-3">
                <Button
                  variant={
                    state.variant === "standard" ? "primary" : "secondary"
                  }
                  size="sm"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      variant: "standard",
                      result: null,
                    }))
                  }
                  aria-pressed={state.variant === "standard"}
                  className="flex-1 h-12"
                  title="Standard Base64 encoding with +, /, and = characters"
                >
                  Standard
                </Button>
                <Button
                  variant={
                    state.variant === "url-safe" ? "primary" : "secondary"
                  }
                  size="sm"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      variant: "url-safe",
                      result: null,
                    }))
                  }
                  aria-pressed={state.variant === "url-safe"}
                  className="flex-1 h-12"
                  title="URL-safe Base64 encoding with -, _, and no padding"
                >
                  URL-Safe
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card variant="default">
        <CardHeader className="pb-8">
          <h2 className="text-title text-xl font-semibold text-foreground mb-2">
            {state.mode === "encode"
              ? "Input to Encode"
              : "Base64 Data to Decode"}
          </h2>
          <p className="text-body text-foreground-secondary">
            {state.inputType === "text"
              ? `Enter ${state.mode === "encode" ? "text" : "Base64 data"} below`
              : `Upload a file to ${state.mode}`}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {state.inputType === "text" ? (
            <div className="space-y-6">
              <textarea
                value={state.textInput}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    textInput: e.target.value,
                    result: null,
                  }))
                }
                placeholder={
                  state.mode === "encode"
                    ? "Enter text to encode..."
                    : "Enter Base64 data to decode..."
                }
                className={cn(
                  "input-field h-40 resize-vertical text-code",
                  "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                  state.isProcessing && "opacity-50 cursor-not-allowed",
                )}
                aria-label={
                  state.mode === "encode"
                    ? "Text input for encoding"
                    : "Base64 input for decoding"
                }
                disabled={state.isProcessing}
              />
              {state.textInput && (
                <div className="text-sm text-foreground-secondary">
                  Input length: {state.textInput.length.toLocaleString()}{" "}
                  characters
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* File Upload Area */}
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-2xl p-12 text-center",
                  "transition-all duration-300 group",
                  dragActive
                    ? "border-brand-400 bg-brand-50 dark:border-brand-500 dark:bg-brand-950/20"
                    : "border-neutral-300 dark:border-neutral-600 hover:border-brand-300 dark:hover:border-brand-600",
                  state.isProcessing && "opacity-50 pointer-events-none",
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFileSelect(e.target.files[0])
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="File upload input"
                  disabled={state.isProcessing}
                />

                <div className="space-y-6">
                  <div
                    className={cn(
                      "mx-auto h-20 w-20 rounded-full flex items-center justify-center",
                      "bg-gradient-to-br from-brand-100 to-brand-200",
                      "dark:from-brand-900/30 dark:to-brand-800/30",
                      "transition-transform duration-200 group-hover:scale-110",
                    )}
                  >
                    <svg
                      className="h-10 w-10 text-brand-600 dark:text-brand-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-body text-foreground-secondary mb-2">
                      <span className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 cursor-pointer">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-sm text-foreground-tertiary">
                      Maximum file size: 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected File Info */}
              {state.fileInput && (
                <div
                  className={cn("bg-background-tertiary rounded-2xl p-6 animate-fade-in-up border border-border-secondary")}
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
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-body font-medium text-foreground truncate mb-1">
                          {state.fileInput.name}
                        </p>
                        <p className="text-sm text-foreground-secondary">
                          {(state.fileInput.size / 1024).toFixed(1)} KB
                          {state.fileInput.type && ` • ${state.fileInput.type}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleClearFile}
                      aria-label="Remove selected file"
                      disabled={state.isProcessing}
                      className="h-10"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Validation Errors */}
          {state.validationErrors.length > 0 && (
            <Alert
              variant="error"
              title={`Validation Error${state.validationErrors.length > 1 ? "s" : ""}`}
              className="mt-8"
            >
              <AlertList items={state.validationErrors.map(error => error.message)} />
            </Alert>
          )}

          {/* Warnings */}
          {state.warnings.length > 0 && (
            <Alert
              variant="warning"
              title={`Warning${state.warnings.length > 1 ? "s" : ""}`}
              className="mt-8"
            >
              <AlertList items={state.warnings} />
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      {state.isProcessing && state.progress && (
        <Card variant="elevated" className="animate-fade-in-up">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-body font-medium text-foreground">
                  {state.progress.stage === "reading" && "Reading file..."}
                  {state.progress.stage === "processing" &&
                    `${state.mode === "encode" ? "Encoding" : "Decoding"}...`}
                  {state.progress.stage === "complete" && "Complete!"}
                </span>
                <span className="text-body text-foreground-secondary">
                  {state.progress.progress}%
                </span>
              </div>
              <ProgressIndicator
                progress={state.progress}
                label={`${state.mode} operation`}
                className="w-full"
              />
              {state.progress.estimatedTimeRemaining &&
                state.progress.estimatedTimeRemaining > 1 && (
                  <p className="text-sm text-foreground-secondary">
                    Estimated time remaining:{" "}
                    {state.progress.estimatedTimeRemaining}s
                  </p>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {state.error && (
        <Card variant="default" className="animate-fade-in-up">
          <CardContent className="p-8">
            <Alert variant="error" title="Operation Failed">
              {state.error}
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      <Card variant="elevated" className="animate-fade-in-up">
        <CardHeader className="pb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-title text-xl font-semibold text-foreground mb-3">
                {state.mode === "encode"
                  ? "Encoded Result"
                  : "Decoded Result"}
              </h2>
              {state.result?.success && state.result.data ? (
                <div className="flex flex-wrap items-center gap-6 text-sm text-foreground-secondary">
                  {state.result.originalSize && (
                    <span>
                      Input: {state.result.originalSize.toLocaleString()} bytes
                    </span>
                  )}
                  {state.result.outputSize && (
                    <span>
                      Output: {state.result.outputSize.toLocaleString()} bytes
                    </span>
                  )}

                  {state.result.serverSide && (
                    <span
                      className={cn(
                        "inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium",
                        "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200",
                      )}
                    >
                      Server-side
                    </span>
                  )}
                </div>
              ) : state.isProcessing ? (
                <div className="flex items-center gap-3 text-body text-foreground-secondary">
                  <Loading size="sm" variant="dots" />
                  <span>Processing your input...</span>
                </div>
              ) : (
                <p className="text-body text-foreground-secondary">
                  {`Result will appear here after ${state.mode === "encode" ? "encoding" : "decoding"}`}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                disabled={state.isProcessing || !state.result?.success || !state.result.data}
                aria-label="Copy result to clipboard"
                className={cn(
                  "h-10",
                  copySuccess?.success
                    ? "bg-success-100 text-success-800 dark:bg-success-950/40 dark:text-success-200"
                    : ""
                )}
                isLoading={state.isProcessing}
              >
                {copySuccess?.success ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownload}
                disabled={state.isProcessing || !state.result?.success || !state.result.data}
                aria-label="Download result as file"
                className="h-10"
                isLoading={state.isProcessing}
              >
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-6">
            <TextareaLoadingWrapper
              isLoading={state.isProcessing}
              loadingText={`${state.mode === "encode" ? "Encoding" : "Decoding"}...`}
              minDisplayTime={800}
              aria-label={`${state.mode} operation in progress`}
            >
              <textarea
                value={state.result?.success && state.result.data ? state.result.data : ""}
                readOnly
                placeholder={
                  state.mode === "encode"
                    ? "Encoded data will appear here..."
                    : "Decoded data will appear here..."
                }
                className={cn(
                  "input-field h-40 resize-vertical text-code bg-background-tertiary",
                  state.result?.success && state.result.data
                    ? "cursor-text select-all"
                    : "cursor-default",
                  !state.result?.success || !state.result.data
                    ? "placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    : ""
                )}
                aria-label={`${state.mode} result`}
              />
            </TextareaLoadingWrapper>

            {/* Copy Success Feedback */}
            {copySuccess && (
              <Alert
                variant={copySuccess.success ? "success" : "error"}
                className="animate-fade-in"
              >
                {copySuccess.message}
              </Alert>
            )}

            {/* Result Warnings */}
            {state.result?.success && state.result.warnings && state.result.warnings.length > 0 && (
              <Alert variant="warning" title="Processing Notes">
                <AlertList items={state.result.warnings} />
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
