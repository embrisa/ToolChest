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
  ResultsPanel,
  ResultBadge,
} from "@/components/ui";
import { HashGeneratorService } from "@/services/tools/hashGeneratorService";
import {
  HashState,
  HashResult,
  HashAlgorithm,
  ClipboardResult,
  HASH_ALGORITHMS,
  ALGORITHM_INFO,
} from "@/types/tools/hashGenerator";
import { A11yAnnouncement } from "@/types/tools/base64";
import { cn } from "@/utils";

export function HashGeneratorTool() {
  const [state, setState] = useState<HashState>({
    algorithm: "SHA-256",
    inputType: "text",
    textInput: "",
    fileInput: null,
    results: {
      MD5: null,
      "SHA-1": null,
      "SHA-256": null,
      "SHA-512": null,
    },
    isProcessing: false,
    progress: null,
    error: null,
    warnings: [],
    validationErrors: [],
  });

  const [dragActive, setDragActive] = useState(false);
  const [copySuccess, setCopySuccess] = useState<ClipboardResult | null>(null);
  const [announcement, setAnnouncement] = useState<A11yAnnouncement | null>(null);
  const [generateAllHashes, setGenerateAllHashes] = useState(false);

  const { announceToScreenReader } = useAccessibilityAnnouncements();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef(state);
  const lastProcessedInputRef = useRef<{
    inputType: string;
    textInput: string;
    fileInput: File | null;
    generateAllHashes: boolean;
    algorithm: string
  }>({
    inputType: "",
    textInput: "",
    fileInput: null,
    generateAllHashes: false,
    algorithm: "",
  });

  // Keep stateRef current
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Process hash generation with enhanced error handling and progress
  const processHash = useCallback(async (shouldTrackUsage = true) => {
    // Get current state values to avoid stale closures
    const currentState = stateRef.current;

    if (currentState.inputType === "text" && !currentState.textInput.trim()) {
      setState((prev) => ({
        ...prev,
        results: generateAllHashes
          ? { MD5: null, "SHA-1": null, "SHA-256": null, "SHA-512": null }
          : { ...prev.results, [currentState.algorithm]: null },
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
        results: generateAllHashes
          ? { MD5: null, "SHA-1": null, "SHA-256": null, "SHA-512": null }
          : { ...prev.results, [currentState.algorithm]: null },
        error: null,
        progress: null,
        warnings: [],
        validationErrors: [],
      }));
      return;
    }

    // Validate input before processing
    if (currentState.inputType === "file" && currentState.fileInput) {
      const validation = HashGeneratorService.validateFile(currentState.fileInput);
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

    const algorithmsToProcess = generateAllHashes
      ? HASH_ALGORITHMS
      : [currentState.algorithm];

    // Announce start of processing to screen readers
    setAnnouncement(
      announceToScreenReader(
        `Starting hash generation for ${algorithmsToProcess.join(", ")}`,
        "polite",
      ),
    );

    try {
      const input =
        currentState.inputType === "text" ? currentState.textInput : currentState.fileInput!;
      const inputSize =
        currentState.inputType === "text"
          ? currentState.textInput.length
          : currentState.fileInput!.size;

      const results: Partial<Record<HashAlgorithm, HashResult>> = {};
      let allWarnings: string[] = [];

      for (const algo of algorithmsToProcess) {
        const result: HashResult = await HashGeneratorService.generateHash({
          algorithm: algo,
          inputType: currentState.inputType,
          input,
          onProgress: (progress) => {
            setState((prev) => ({ ...prev, progress }));
          },
        });

        results[algo] = result;

        if (result.warnings) {
          allWarnings = [...allWarnings, ...result.warnings];
        }

        // Track usage analytics only when explicitly requested (privacy-compliant)
        if (shouldTrackUsage && result.success && inputSize > 0) {
          HashGeneratorService.trackUsage({
            algorithm: algo,
            inputType: currentState.inputType,
            inputSize,
            processingTime: result.processingTime || 0,
            success: result.success,
            clientSide: !result.serverSide,
            error: result.success ? undefined : result.error,
          });
        }
      }

      setState((prev) => ({
        ...prev,
        results: generateAllHashes
          ? ({ ...results } as Record<HashAlgorithm, HashResult | null>)
          : {
            ...prev.results,
            [currentState.algorithm]:
              results[currentState.algorithm] || null,
          },
        error: null,
        warnings: [...new Set(allWarnings)], // Remove duplicates
        isProcessing: false,
        progress: null,
      }));

      // Announce completion
      const successCount = Object.values(results).filter(
        (r) => r?.success,
      ).length;
      const failureCount = Object.values(results).filter(
        (r) => !r?.success,
      ).length;

      if (failureCount === 0) {
        setAnnouncement(
          announceToScreenReader(
            `Hash generation completed successfully for ${successCount} algorithm${successCount > 1 ? "s" : ""}`,
            "polite",
          ),
        );
      } else {
        setAnnouncement(
          announceToScreenReader(
            `Hash generation completed with ${failureCount} error${failureCount > 1 ? "s" : ""}`,
            "assertive",
          ),
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Hash generation failed";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isProcessing: false,
        progress: null,
      }));

      setAnnouncement(
        announceToScreenReader(
          `Hash generation failed: ${errorMessage}`,
          "assertive",
        ),
      );
    }
  }, [
    // Use a ref for state to avoid recreating this function on every state change
    // This prevents the infinite loop since the callback won't change
    generateAllHashes,
    announceToScreenReader,
  ]);

  // Manual processing function for explicit user actions
  const manualProcess = useCallback(() => {
    // Clear the last processed input to allow reprocessing
    lastProcessedInputRef.current = {
      inputType: "",
      textInput: "",
      fileInput: null,
      generateAllHashes: false,
      algorithm: "",
    };
    processHash(true); // Track usage for manual processing
  }, [processHash]);

  // Clear last processed input when mode or algorithm changes
  useEffect(() => {
    lastProcessedInputRef.current = {
      inputType: "",
      textInput: "",
      fileInput: null,
      generateAllHashes: false,
      algorithm: "",
    };
  }, [generateAllHashes, state.algorithm]);

  // Auto-process when inputs change (with debouncing for text)
  useEffect(() => {
    // Check if input has actually changed and we're not already processing
    const currentInput = {
      inputType: state.inputType,
      textInput: state.textInput,
      fileInput: state.fileInput,
      generateAllHashes,
      algorithm: state.algorithm,
    };

    const lastProcessed = lastProcessedInputRef.current;
    const hasInputChanged =
      currentInput.inputType !== lastProcessed.inputType ||
      currentInput.textInput !== lastProcessed.textInput ||
      currentInput.fileInput !== lastProcessed.fileInput ||
      currentInput.generateAllHashes !== lastProcessed.generateAllHashes ||
      currentInput.algorithm !== lastProcessed.algorithm;

    // Don't process if input hasn't changed or if already processing
    if (!hasInputChanged || state.isProcessing) {
      return;
    }

    if (state.inputType === "text" && state.textInput.trim()) {
      // Debounce text input processing
      const timer = setTimeout(() => {
        lastProcessedInputRef.current = { ...currentInput };
        processHash(false); // Don't track usage for auto-processing
      }, 300);
      return () => clearTimeout(timer);
    } else if (state.inputType === "file" && state.fileInput) {
      // Process file immediately when selected, but update the ref first
      lastProcessedInputRef.current = { ...currentInput };
      processHash(false); // Don't track usage for auto-processing
    } else if (state.inputType === "text" && !state.textInput.trim()) {
      // Clear results immediately when text is empty
      lastProcessedInputRef.current = { ...currentInput };
      setState((prev) => ({
        ...prev,
        results: generateAllHashes
          ? { MD5: null, "SHA-1": null, "SHA-256": null, "SHA-512": null }
          : { ...prev.results, [state.algorithm]: null },
        error: null,
        warnings: [],
        validationErrors: [],
      }));
    }
  }, [
    // Only depend on the actual input values, not the processing function
    state.inputType,
    state.textInput,
    state.fileInput,
    generateAllHashes,
    state.algorithm,
    state.isProcessing, // Include this to prevent processing when already processing
  ]);

  // Enhanced file selection with validation
  const handleFileSelect = useCallback(
    (file: File) => {
      const validation = HashGeneratorService.validateFile(file);

      setState((prev) => ({
        ...prev,
        fileInput: file,
        error: validation.isValid ? null : validation.error || "Invalid file",
        warnings: validation.warnings || [],
        validationErrors: validation.validationErrors || [],
        results: { MD5: null, "SHA-1": null, "SHA-256": null, "SHA-512": null },
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
            `File selected: ${file.name}${warnings ? ". " + warnings : ""}`,
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
    // Get all successful hash results
    const allHashes = HASH_ALGORITHMS
      .filter(algorithm => state.results[algorithm]?.success && state.results[algorithm]?.hash)
      .map(algorithm => {
        const result = state.results[algorithm];
        return `${algorithm}: ${result?.hash}`;
      })
      .join('\n\n');

    if (!allHashes) return;

    const result = await HashGeneratorService.copyToClipboard(allHashes);
    setCopySuccess({
      success: result.success,
      message: result.message,
      timestamp: Date.now(),
    });

    setAnnouncement(
      announceToScreenReader(
        result.message,
        result.success ? "polite" : "assertive",
      ),
    );

    if (result.success) {
      setTimeout(() => setCopySuccess(null), 3000);
    }
  }, [state.results, announceToScreenReader]);

  // Clear file input
  const handleClearFile = useCallback(() => {
    setState((prev) => ({
      ...prev,
      fileInput: null,
      results: { MD5: null, "SHA-1": null, "SHA-256": null, "SHA-512": null },
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

      {/* Hash Algorithm and Input Type Selection */}
      <Card variant="elevated" className="tool-card-hash">
        <CardHeader className="pb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="tool-icon tool-icon-hash h-14 w-14 rounded-2xl bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900/30 dark:to-accent-800/30 flex items-center justify-center">
              <span className="text-lg font-bold text-accent-700 dark:text-accent-300">#</span>
            </div>
            <div>
              <h2 className="text-title text-2xl font-semibold text-foreground mb-2">
                Hash Generation Settings
              </h2>
              <p className="text-body text-foreground-secondary">
                Choose your algorithm and input preferences
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Algorithm Selection */}
            <div className="space-y-4">
              <label className="text-body font-medium text-foreground">Hash Algorithm</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={generateAllHashes}
                      onChange={(e) => setGenerateAllHashes(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        "w-12 h-6 rounded-full border-2 transition-all duration-200",
                        "focus-within:ring-2 focus-within:ring-accent-500/20",
                        generateAllHashes
                          ? "bg-accent-500 border-accent-500"
                          : "bg-neutral-200 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600",
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200",
                          "transform translate-y-0.5",
                          generateAllHashes ? "translate-x-6" : "translate-x-0.5",
                        )}
                      />
                    </div>
                  </div>
                  <span className="text-body font-medium text-foreground">
                    Generate All
                  </span>
                </label>

                {!generateAllHashes && (
                  <select
                    value={state.algorithm}
                    onChange={(e) => setState((prev) => ({
                      ...prev,
                      algorithm: e.target.value as HashAlgorithm,
                      results: { MD5: null, "SHA-1": null, "SHA-256": null, "SHA-512": null }
                    }))}
                    className="input-field h-12"
                    aria-label="Select hash algorithm"
                  >
                    {HASH_ALGORITHMS.map((algo) => (
                      <option key={algo} value={algo}>
                        {algo} - {ALGORITHM_INFO[algo]?.description || 'Hash function'}
                      </option>
                    ))}
                  </select>
                )}
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
                      results: { MD5: null, "SHA-1": null, "SHA-256": null, "SHA-512": null },
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
                      results: { MD5: null, "SHA-1": null, "SHA-256": null, "SHA-512": null },
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

            {/* Info Panel */}
            <div className="space-y-4">
              <label className="text-body font-medium text-foreground">Security Level</label>
              <div className="space-y-2">
                {generateAllHashes ? (
                  <div className="text-sm text-foreground-secondary">
                    <span className="text-success-600 font-medium">Secure:</span> SHA-256, SHA-512<br />
                    <span className="text-warning-600 font-medium">Legacy:</span> MD5, SHA-1
                  </div>
                ) : (
                  <div className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium",
                    ALGORITHM_INFO[state.algorithm]?.secure
                      ? "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-200"
                      : "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-200"
                  )}>
                    {ALGORITHM_INFO[state.algorithm]?.secure ? "Secure" : "Legacy - Not Recommended"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card variant="default">
        <CardHeader className="pb-8">
          <h2 className="text-title text-xl font-semibold text-foreground mb-2">
            {state.inputType === "text" ? "Text Input" : "File Upload"}
          </h2>
          <p className="text-body text-foreground-secondary">
            {state.inputType === "text"
              ? "Enter the text you want to hash"
              : "Upload a file to generate hash values"}
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
                    results: { MD5: null, "SHA-1": null, "SHA-256": null, "SHA-512": null },
                  }))
                }
                placeholder="Enter text to hash..."
                className={cn(
                  "input-field h-40 resize-vertical text-code",
                  "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                  state.isProcessing && "opacity-50 cursor-not-allowed",
                )}
                aria-label="Text input for hash generation"
                disabled={state.isProcessing}
              />
              {state.textInput && (
                <div className="text-sm text-foreground-secondary">
                  Input length: {state.textInput.length.toLocaleString()} characters
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
                    ? "border-accent-400 bg-accent-50 dark:border-accent-500 dark:bg-accent-950/20"
                    : "border-neutral-300 dark:border-neutral-600 hover:border-accent-300 dark:hover:border-accent-600",
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
                      "bg-gradient-to-br from-accent-100 to-accent-200",
                      "dark:from-accent-900/30 dark:to-accent-800/30",
                      "transition-transform duration-200 group-hover:scale-110",
                    )}
                  >
                    <svg
                      className="h-10 w-10 text-accent-600 dark:text-accent-400"
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
                      <span className="font-semibold text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 cursor-pointer">
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
                <div className={cn("bg-background-tertiary rounded-2xl p-6 animate-fade-in-up border border-border-secondary")}>
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
              <AlertList items={state.validationErrors} />
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
                  {state.progress.stage === "hashing" && "Generating hashes..."}
                  {state.progress.stage === "complete" && "Complete!"}
                </span>
                <span className="text-body text-foreground-secondary">
                  {state.progress.percentage}%
                </span>
              </div>
              <ProgressIndicator
                progress={{
                  progress: state.progress.percentage,
                  stage:
                    state.progress.stage === "hashing"
                      ? "processing"
                      : state.progress.stage,
                  bytesProcessed: state.progress.bytesProcessed,
                  totalBytes: state.progress.totalBytes,
                  estimatedTimeRemaining: state.progress.estimatedTimeRemaining,
                }}
                label="Hash generation"
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
            <Alert variant="error" title="Hash Generation Failed">
              {state.error}
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Hash Results Section - Always Visible */}
      <ResultsPanel
        title="Hash Results"
        result={
          // Combine all successful hash results into a single output
          HASH_ALGORITHMS
            .filter(algorithm => state.results[algorithm]?.success && state.results[algorithm]?.hash)
            .map(algorithm => {
              const result = state.results[algorithm];
              return `${algorithm}: ${result?.hash}`;
            })
            .join('\n\n') || ""
        }
        isProcessing={state.isProcessing}
        onCopy={handleCopy}
        copySuccess={copySuccess?.success && copySuccess.message.includes('copied')}
        copyLabel="Copy All Hashes"
        placeholder={
          state.isProcessing
            ? "Generating hash values..."
            : "Hash results will appear here after processing your input"
        }
        metadata={
          Object.values(state.results).some(r => r?.success)
            ? [
              {
                label: "Algorithms",
                value: HASH_ALGORITHMS.filter(a => state.results[a]?.success).length,
                format: (v: string | number) => `${v} hash${Number(v) === 1 ? '' : 'es'} generated`
              },
              ...(Object.values(state.results).find(r => r?.success && r.processingTime)
                ? [{
                  label: "Total Time",
                  value: Object.values(state.results)
                    .filter(r => r?.success && r.processingTime)
                    .reduce((sum, r) => sum + (r?.processingTime || 0), 0),
                  format: (v: string | number) => `${v}ms`
                }]
                : []),
              ...(Object.values(state.results).some(r => r?.success && r.serverSide)
                ? [{ label: "Processing", value: "Mixed (Client + Server)" }]
                : Object.values(state.results).some(r => r?.success && !r.serverSide)
                  ? [{ label: "Processing", value: "Client-side" }]
                  : [])
            ]
            : []
        }
        badges={
          Object.values(state.results).some(r => r?.success)
            ? HASH_ALGORITHMS
              .filter(algorithm => state.results[algorithm]?.success)
              .map(algorithm => (
                <ResultBadge
                  key={algorithm}
                  variant={ALGORITHM_INFO[algorithm]?.secure ? "success" : "warning"}
                >
                  {algorithm}
                </ResultBadge>
              ))
            : []
        }
        rows={6}
        className="animate-fade-in-up"
      >
        {/* Copy Success Feedback */}
        {copySuccess && (
          <Alert
            variant={copySuccess.success ? "success" : "error"}
            className="animate-fade-in"
          >
            {copySuccess.message}
          </Alert>
        )}
      </ResultsPanel>
    </div>
  );
}
