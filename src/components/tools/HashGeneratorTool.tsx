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
} from "@/components/ui";
import { HashGeneratorService } from "@/services/tools/hashGeneratorService";
import {
  HashState,
  HashResult,
  HashAlgorithm,
  ClipboardResult,
  HASH_ALGORITHMS,
  ALGORITHM_INFO,
  FILE_SIZE_LIMITS,
} from "@/types/tools/hashGenerator";
import { A11yAnnouncement } from "@/types/tools/base64";
import {
  DocumentDuplicateIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
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
  const [announcement, setAnnouncement] = useState<A11yAnnouncement | null>(
    null,
  );
  const [generateAllHashes, setGenerateAllHashes] = useState(false);

  const { announceToScreenReader } = useAccessibilityAnnouncements();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process hash generation
  const processHash = useCallback(
    async (algorithm?: HashAlgorithm) => {
      if (state.inputType === "text" && !state.textInput.trim()) {
        setState((prev) => ({
          ...prev,
          results: generateAllHashes
            ? { MD5: null, "SHA-1": null, "SHA-256": null, "SHA-512": null }
            : { ...prev.results, [algorithm || state.algorithm]: null },
          error: null,
          progress: null,
          warnings: [],
          validationErrors: [],
        }));
        return;
      }

      if (state.inputType === "file" && !state.fileInput) {
        setState((prev) => ({
          ...prev,
          results: generateAllHashes
            ? { MD5: null, "SHA-1": null, "SHA-256": null, "SHA-512": null }
            : { ...prev.results, [algorithm || state.algorithm]: null },
          error: null,
          progress: null,
          warnings: [],
          validationErrors: [],
        }));
        return;
      }

      // Validate input before processing
      if (state.inputType === "file" && state.fileInput) {
        const validation = HashGeneratorService.validateFile(state.fileInput);
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
        : [algorithm || state.algorithm];

      // Announce start of processing to screen readers
      setAnnouncement(
        announceToScreenReader(
          `Starting hash generation for ${algorithmsToProcess.join(", ")}`,
          "polite",
        ),
      );

      try {
        const input =
          state.inputType === "text" ? state.textInput : state.fileInput!;
        const inputSize =
          state.inputType === "text"
            ? state.textInput.length
            : state.fileInput!.size;

        const results: Partial<Record<HashAlgorithm, HashResult>> = {};
        let allWarnings: string[] = [];

        for (const algo of algorithmsToProcess) {
          const result: HashResult = await HashGeneratorService.generateHash({
            algorithm: algo,
            inputType: state.inputType,
            input,
            onProgress: (progress) => {
              setState((prev) => ({ ...prev, progress }));
            },
          });

          results[algo] = result;

          if (result.warnings) {
            allWarnings = [...allWarnings, ...result.warnings];
          }

          // Track usage analytics (privacy-compliant)
          HashGeneratorService.trackUsage({
            algorithm: algo,
            inputType: state.inputType,
            inputSize,
            processingTime: result.processingTime || 0,
            success: result.success,
            clientSide: !result.serverSide,
            error: result.success ? undefined : result.error,
          });
        }

        setState((prev) => ({
          ...prev,
          results: generateAllHashes
            ? ({ ...results } as Record<HashAlgorithm, HashResult | null>)
            : {
                ...prev.results,
                [algorithm || state.algorithm]:
                  results[algorithm || state.algorithm] || null,
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
    },
    [
      state.algorithm,
      state.inputType,
      state.textInput,
      state.fileInput,
      generateAllHashes,
      announceToScreenReader,
    ],
  );

  // Enhanced auto-process with improved debouncing for text input
  useEffect(() => {
    if (state.inputType === "text") {
      // Only process if there's actual text content
      if (state.textInput.trim()) {
        const timer = setTimeout(() => {
          processHash();
        }, 300); // 300ms debounce for real-time processing
        return () => clearTimeout(timer);
      } else {
        // Clear results immediately when text is empty
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
    } else if (state.fileInput) {
      // Process file immediately when selected
      processHash();
    }
  }, [
    processHash,
    state.inputType,
    state.textInput,
    state.fileInput,
    generateAllHashes,
    state.algorithm,
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

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect],
  );

  // Enhanced copy to clipboard with improved feedback
  const handleCopyToClipboard = useCallback(
    async (hash: string, algorithm: HashAlgorithm) => {
      // Show immediate feedback
      setCopySuccess({
        success: true,
        message: "Copying...",
        timestamp: Date.now(),
      });

      const result = await HashGeneratorService.copyToClipboard(hash);

      setCopySuccess({
        success: result.success,
        message: result.message,
        timestamp: Date.now(),
      });

      // Enhanced accessibility announcement with more context
      const hashLength = hash.length;
      const hashPreview = hash.substring(0, 8) + "...";
      setAnnouncement(
        announceToScreenReader(
          `${algorithm} hash ${result.success ? `(${hashLength} characters, starting with ${hashPreview}) copied to clipboard` : "copy failed: " + result.message}`,
          result.success ? "polite" : "assertive",
        ),
      );

      // Clear success message after 3 seconds
      setTimeout(() => setCopySuccess(null), 3000);
    },
    [announceToScreenReader],
  );

  // Clear copy success message when it expires
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  return (
    <div className="space-y-8">
      {/* ARIA Live Region for announcements */}
      <AriaLiveRegion announcement={announcement} />

      {/* Input Type Selection */}
      <Card variant="elevated" className="tool-card-hash">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="tool-icon tool-icon-hash">#</div>
            <div>
              <h2 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Input Method
              </h2>
              <p className="text-body text-neutral-600 dark:text-neutral-400">
                Choose how you want to provide data for hash generation
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <fieldset className="space-y-4">
            <legend className="sr-only">
              Choose input method for hash generation
            </legend>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    inputType: "text",
                    fileInput: null,
                    results: {
                      MD5: null,
                      "SHA-1": null,
                      "SHA-256": null,
                      "SHA-512": null,
                    },
                  }))
                }
                className={cn(
                  "px-6 py-3 rounded-xl border-2 font-medium text-body transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:ring-offset-2",
                  "dark:focus:ring-offset-neutral-900",
                  state.inputType === "text"
                    ? cn(
                        "border-accent-400 bg-gradient-to-r from-accent-50 to-accent-100/50",
                        "dark:border-accent-500 dark:from-accent-950/50 dark:to-accent-900/30",
                        "text-accent-800 dark:text-accent-200 shadow-glow-accent",
                      )
                    : cn(
                        "border-neutral-200 dark:border-neutral-700",
                        "bg-white dark:bg-neutral-900",
                        "text-neutral-700 dark:text-neutral-300",
                        "hover:border-accent-200 dark:hover:border-accent-700",
                        "hover:bg-accent-50/50 dark:hover:bg-accent-950/20",
                      ),
                )}
                aria-pressed={state.inputType === "text"}
                aria-describedby="text-input-description"
              >
                Text Input
              </button>

              <button
                type="button"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    inputType: "file",
                    textInput: "",
                    results: {
                      MD5: null,
                      "SHA-1": null,
                      "SHA-256": null,
                      "SHA-512": null,
                    },
                  }))
                }
                className={cn(
                  "px-6 py-3 rounded-xl border-2 font-medium text-body transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:ring-offset-2",
                  "dark:focus:ring-offset-neutral-900",
                  state.inputType === "file"
                    ? cn(
                        "border-accent-400 bg-gradient-to-r from-accent-50 to-accent-100/50",
                        "dark:border-accent-500 dark:from-accent-950/50 dark:to-accent-900/30",
                        "text-accent-800 dark:text-accent-200 shadow-glow-accent",
                      )
                    : cn(
                        "border-neutral-200 dark:border-neutral-700",
                        "bg-white dark:bg-neutral-900",
                        "text-neutral-700 dark:text-neutral-300",
                        "hover:border-accent-200 dark:hover:border-accent-700",
                        "hover:bg-accent-50/50 dark:hover:bg-accent-950/20",
                      ),
                )}
                aria-pressed={state.inputType === "file"}
                aria-describedby="file-input-description"
              >
                File Upload
              </button>
            </div>

            <div className="text-body text-neutral-600 dark:text-neutral-400">
              {state.inputType === "text" && (
                <p id="text-input-description">
                  Enter text to generate hash values. Processing happens in
                  real-time as you type.
                </p>
              )}
              {state.inputType === "file" && (
                <p id="file-input-description">
                  Upload a file to generate hash values. Maximum file size:
                  10MB.
                </p>
              )}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      {/* Algorithm Selection */}
      <Card variant="default">
        <CardHeader>
          <h2 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Hash Algorithm Options
          </h2>
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            Select specific algorithms or generate all hash types
          </p>
        </CardHeader>
        <CardContent>
          <fieldset className="space-y-6">
            <legend className="sr-only">Choose hash algorithm options</legend>

            {/* Generate All Toggle */}
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
                <div>
                  <span className="text-body font-medium text-neutral-900 dark:text-neutral-100">
                    Generate All Hash Types
                  </span>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Create MD5, SHA-1, SHA-256, and SHA-512 hashes
                    simultaneously
                  </p>
                </div>
              </label>
            </div>

            {/* Individual Algorithm Selection */}
            {!generateAllHashes && (
              <div className="space-y-3">
                <p className="form-label">Individual Algorithm</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {HASH_ALGORITHMS.map((algo) => (
                    <button
                      key={algo}
                      type="button"
                      onClick={() =>
                        setState((prev) => ({ ...prev, algorithm: algo }))
                      }
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:ring-offset-2",
                        "dark:focus:ring-offset-neutral-900",
                        state.algorithm === algo
                          ? cn(
                              "border-accent-400 bg-gradient-to-r from-accent-50 to-accent-100/50",
                              "dark:border-accent-500 dark:from-accent-950/50 dark:to-accent-900/30",
                              "shadow-glow-accent",
                            )
                          : cn(
                              "border-neutral-200 dark:border-neutral-700",
                              "bg-white dark:bg-neutral-900",
                              "hover:border-accent-200 dark:hover:border-accent-700",
                              "hover:bg-accent-50/30 dark:hover:bg-accent-950/10",
                            ),
                      )}
                      aria-pressed={state.algorithm === algo}
                    >
                      <div className="space-y-1">
                        <h3
                          className={cn(
                            "font-semibold text-body",
                            state.algorithm === algo
                              ? "text-accent-800 dark:text-accent-200"
                              : "text-neutral-900 dark:text-neutral-100",
                          )}
                        >
                          {algo}
                        </h3>
                        <p
                          className={cn(
                            "text-sm",
                            state.algorithm === algo
                              ? "text-accent-600 dark:text-accent-300"
                              : "text-neutral-600 dark:text-neutral-400",
                          )}
                        >
                          {ALGORITHM_INFO[algo]?.description ||
                            "Cryptographic hash function"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </fieldset>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card variant="default">
        <CardHeader>
          <h2 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {state.inputType === "text" ? "Text Input" : "File Upload"}
          </h2>
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            {state.inputType === "text"
              ? "Enter the text you want to hash"
              : "Upload a file to generate hash values"}
          </p>
        </CardHeader>
        <CardContent>
          {state.inputType === "text" ? (
            <div className="space-y-4">
              <textarea
                value={state.textInput}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, textInput: e.target.value }))
                }
                placeholder="Enter text to hash..."
                className={cn(
                  "input-field h-32 resize-vertical text-code",
                  "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                  state.isProcessing && "opacity-50 cursor-not-allowed",
                )}
                aria-label="Text input for hash generation"
                disabled={state.isProcessing}
              />
              {state.textInput && (
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Input length: {state.textInput.length.toLocaleString()}{" "}
                  characters
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Upload Area */}
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-2xl p-8 text-center",
                  "transition-all duration-300 group",
                  dragActive
                    ? "border-accent-400 bg-accent-50 dark:border-accent-500 dark:bg-accent-950/20"
                    : "border-neutral-300 dark:border-neutral-600 hover:border-accent-300 dark:hover:border-accent-600",
                  state.isProcessing && "opacity-50 pointer-events-none",
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
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

                <div className="space-y-4">
                  <div
                    className={cn(
                      "mx-auto h-16 w-16 rounded-full flex items-center justify-center",
                      "bg-gradient-to-br from-accent-100 to-accent-200",
                      "dark:from-accent-900/30 dark:to-accent-800/30",
                      "transition-transform duration-200 group-hover:scale-110",
                    )}
                  >
                    <svg
                      className="h-8 w-8 text-accent-600 dark:text-accent-400"
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
                    <p className="text-body text-neutral-600 dark:text-neutral-400">
                      <span className="font-semibold text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 cursor-pointer">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      Maximum file size: 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected File Info */}
              {state.fileInput && (
                <div
                  className={cn("surface rounded-xl p-4 animate-fade-in-up")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center",
                            "bg-gradient-to-br from-neutral-100 to-neutral-200",
                            "dark:from-neutral-800 dark:to-neutral-700",
                          )}
                        >
                          <svg
                            className="h-6 w-6 text-neutral-600 dark:text-neutral-400"
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
                        <p className="text-body font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {state.fileInput.name}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {(state.fileInput.size / 1024).toFixed(1)} KB
                          {state.fileInput.type && ` • ${state.fileInput.type}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setState((prev) => ({ ...prev, fileInput: null }));
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      aria-label="Remove selected file"
                      disabled={state.isProcessing}
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
            <div
              className={cn(
                "mt-6 p-4 rounded-xl border",
                "bg-error-50 border-error-200 dark:bg-error-950/20 dark:border-error-800",
                "animate-fade-in-up",
              )}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-error-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-body font-semibold text-error-800 dark:text-error-200">
                    Validation Error
                    {state.validationErrors.length > 1 ? "s" : ""}
                  </h3>
                  <div className="mt-2 text-body text-error-700 dark:text-error-300">
                    <ul className="list-disc list-inside space-y-1">
                      {state.validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {state.warnings.length > 0 && (
            <div
              className={cn(
                "mt-6 p-4 rounded-xl border",
                "bg-warning-50 border-warning-200 dark:bg-warning-950/20 dark:border-warning-800",
                "animate-fade-in-up",
              )}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-warning-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-body font-semibold text-warning-800 dark:text-warning-200">
                    Warning{state.warnings.length > 1 ? "s" : ""}
                  </h3>
                  <div className="mt-2 text-body text-warning-700 dark:text-warning-300">
                    <ul className="list-disc list-inside space-y-1">
                      {state.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      {state.isProcessing && state.progress && (
        <Card variant="elevated" className="animate-fade-in-up">
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body font-medium text-neutral-700 dark:text-neutral-300">
                  {state.progress.stage === "reading" && "Reading file..."}
                  {state.progress.stage === "hashing" && "Generating hashes..."}
                  {state.progress.stage === "complete" && "Complete!"}
                </span>
                <span className="text-body text-neutral-500 dark:text-neutral-400">
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
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
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
          <CardContent>
            <div
              className={cn(
                "p-4 rounded-xl border",
                "bg-error-50 border-error-200 dark:bg-error-950/20 dark:border-error-800",
              )}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-error-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-body font-semibold text-error-800 dark:text-error-200">
                    Hash Generation Failed
                  </h3>
                  <div className="mt-2 text-body text-error-700 dark:text-error-300">
                    {state.error}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {Object.values(state.results).some((result) => result?.success) && (
        <Card variant="elevated" className="animate-fade-in-up">
          <CardHeader>
            <h2 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Hash Results
            </h2>
            <p className="text-body text-neutral-600 dark:text-neutral-400">
              Generated hash values for your input
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {HASH_ALGORITHMS.map((algorithm) => {
                const result = state.results[algorithm];
                if (!result?.success || !result.hash) return null;

                return (
                  <div
                    key={algorithm}
                    className={cn(
                      "p-4 rounded-xl border",
                      "bg-accent-50/50 border-accent-200/50",
                      "dark:bg-accent-950/20 dark:border-accent-800/50",
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-body font-semibold text-accent-800 dark:text-accent-200">
                          {algorithm}
                        </h3>
                        <p className="text-sm text-accent-600 dark:text-accent-300">
                          {result.hash.length} characters
                          {result.processingTime &&
                            ` • ${result.processingTime}ms`}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleCopyToClipboard(result.hash!, algorithm)
                        }
                        className="flex items-center gap-2"
                        aria-label={`Copy ${algorithm} hash to clipboard`}
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                    <div
                      className={cn(
                        "p-3 rounded-lg font-mono text-sm break-all",
                        "bg-neutral-100 dark:bg-neutral-800",
                        "text-neutral-800 dark:text-neutral-200",
                        "border border-neutral-200 dark:border-neutral-700",
                      )}
                    >
                      {result.hash}
                    </div>
                  </div>
                );
              })}

              {/* Copy Success Feedback */}
              {copySuccess && (
                <div
                  className={cn(
                    "p-3 rounded-xl text-body animate-fade-in",
                    copySuccess.success
                      ? "bg-success-50 text-success-700 border border-success-200 dark:bg-success-950/20 dark:text-success-300 dark:border-success-800"
                      : "bg-error-50 text-error-700 border border-error-200 dark:bg-error-950/20 dark:text-error-300 dark:border-error-800",
                  )}
                >
                  {copySuccess.message}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
