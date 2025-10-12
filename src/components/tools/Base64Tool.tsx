"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
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
  ImportPanel,
  CopyExportBar,
  FileInfo,
} from "@/components/ui";
import { Base64Service } from "@/services/tools/base64Service";
import { Base64State, Base64Result, A11yAnnouncement } from "@/types/tools/base64";
import { cn } from "@/utils";

export function Base64Tool() {
  const tCommon = useTranslations("tools.common");
  const tUnits = useTranslations("common");
  const tBase64 = useTranslations("tools.base64");

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

  const [announcement, setAnnouncement] = useState<A11yAnnouncement | null>(
    null,
  );

  const { announceToScreenReader } = useAccessibilityAnnouncements();
  const stateRef = useRef(state);
  const lastProcessedInputRef = useRef<{
    inputType: string;
    textInput: string;
    fileInput: File | null;
  }>({
    inputType: "",
    textInput: "",
    fileInput: null,
  });

  // Keep stateRef current
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Process Base64 operation with enhanced error handling and progress
  const processBase64 = useCallback(
    async (shouldTrackUsage = true) => {
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
            error: validation.error || tCommon("errors.processingFailed"),
            validationErrors: validation.validationErrors || [],
            warnings: validation.warnings || [],
          }));

          setAnnouncement(
            announceToScreenReader(
              `${tCommon("errors.processingFailed")}: ${validation.error}`,
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
        announceToScreenReader(
          `${tCommon("ui.status.processing")} ${tCommon(`ui.modes.${currentState.mode}`)}`,
          "polite",
        ),
      );

      try {
        const input =
          currentState.inputType === "text"
            ? currentState.textInput
            : currentState.fileInput!;
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
          error: result.success
            ? null
            : result.error || tCommon("ui.status.error"),
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
              `${tCommon(`ui.modes.${currentState.mode}`)} ${tCommon("ui.status.success")}`,
              "polite",
            ),
          );
        } else {
          setAnnouncement(
            announceToScreenReader(
              `${tCommon(`ui.modes.${currentState.mode}`)} ${tCommon("ui.status.error")}: ${result.error}`,
              "assertive",
            ),
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : tCommon("ui.status.error");
        setState((prev) => ({
          ...prev,
          result: null,
          error: errorMessage,
          isProcessing: false,
          progress: null,
        }));

        setAnnouncement(
          announceToScreenReader(
            `${tCommon("ui.status.error")}: ${errorMessage}`,
            "assertive",
          ),
        );
      }
    },
    [
      // Use a ref for state to avoid recreating this function on every state change
      // This prevents the infinite loop since the callback won't change
      announceToScreenReader,
      tCommon,
    ],
  );

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
    processBase64, // Include the processing function
  ]);

  // Enhanced file selection with validation
  const handleFileSelect = useCallback(
    (file: File) => {
      const validation = Base64Service.validateFile(file);

      setState((prev) => ({
        ...prev,
        fileInput: file,
        error: validation.isValid
          ? null
          : validation.error || tCommon("validation.invalidInput"),
        warnings: validation.warnings || [],
        validationErrors: validation.validationErrors || [],
        result: null,
      }));

      if (!validation.isValid) {
        setAnnouncement(
          announceToScreenReader(
            `${tCommon("errors.processingFailed")}: ${validation.error}`,
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
    [announceToScreenReader, tCommon],
  );

  // Copy and Download handled via CopyExportBar

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
              <span className="text-lg font-bold text-brand-700 dark:text-brand-300">
                B64
              </span>
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
              <label className="text-body font-medium text-foreground">
                Operation Mode
              </label>
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
                  {tCommon("ui.modes.encode")}
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
                  {tCommon("ui.modes.decode")}
                </Button>
              </div>
            </div>

            {/* Input Type Selection */}
            <div className="space-y-4">
              <label className="text-body font-medium text-foreground">
                {tCommon("ui.inputTypes.text")}/{tCommon("ui.inputTypes.file")}
              </label>
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
                  {tCommon("ui.inputTypes.text")}
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
                  {tCommon("ui.inputTypes.file")}
                </Button>
              </div>
            </div>

            {/* Variant Selection */}
            <div className="space-y-4">
              <label className="text-body font-medium text-foreground">
                Base64 Variant
              </label>
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
                  {tBase64("tool.variants.standard")}
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
                  {tBase64("tool.variants.urlSafe")}
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
              ? `Input to ${tCommon("ui.modes.encode")}`
              : `Base64 Data to ${tCommon("ui.modes.decode")}`}
          </h2>
          <p className="text-body text-foreground-secondary">
            {state.inputType === "text"
              ? `Enter ${state.mode === "encode" ? "text" : "Base64 data"} below`
              : `Upload a file to ${tCommon(`ui.modes.${state.mode}`)}`}
          </p>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          <ImportPanel
            mode={state.inputType}
            onModeChange={(m) =>
              setState((prev) => ({
                ...prev,
                inputType: m,
                result: null,
                ...(m === "text" ? { fileInput: null } : { textInput: "" }),
              }))
            }
            textValue={state.textInput}
            onTextChange={(v) =>
              setState((prev) => ({ ...prev, textInput: v, result: null }))
            }
            onFileSelect={handleFileSelect}
            accept={"*/*"}
            maxSizeMB={10}
            title={
              state.inputType === "text"
                ? tBase64("tool.placeholders.textInput")
                : "Upload a file"
            }
            description={
              state.inputType === "text"
                ? "Paste or type your data"
                : "Drag and drop or paste a file (max 10MB)"
            }
            placeholder={tCommon("ui.placeholders.textInput")}
            labels={{
              textMode: tCommon("ui.inputTypes.text"),
              fileMode: tCommon("ui.inputTypes.file"),
              pasteFromClipboard: tCommon("ui.actions.pasteFromClipboard"),
              clearText: tCommon("ui.actions.clear"),
              characters: tUnits("units.characters"),
              validationErrors: tCommon("validation.invalidInput"),
              filePasteTip: tCommon("ui.placeholders.fileUpload"),
            }}
            fileSubtitle={tCommon("ui.placeholders.fileUpload")}
            onAnnounce={(msg, kind) =>
              setAnnouncement(announceToScreenReader(msg, kind))
            }
          />
          {state.inputType === "file" && state.fileInput && (
            <FileInfo file={state.fileInput} onRemove={handleClearFile} />
          )}
          {/* legacy input UI removed; ImportPanel covers text/file inputs */}

          {/* Validation Errors */}
          {state.validationErrors.length > 0 && (
            <Alert
              variant="error"
              title={`Validation Error${state.validationErrors.length > 1 ? "s" : ""}`}
              className="mt-8"
            >
              <AlertList
                items={state.validationErrors.map((error) => error.message)}
              />
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
                  {state.progress.stage === "reading" &&
                    tCommon("ui.status.processing")}
                  {state.progress.stage === "processing" &&
                    `${tCommon(`ui.modes.${state.mode}`)}...`}
                  {state.progress.stage === "complete" &&
                    tCommon("ui.status.success")}
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
            <Alert variant="error" title={tCommon("ui.status.error")}>
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
                  ? `${tCommon("ui.modes.encode")}d Result`
                  : `${tCommon("ui.modes.decode")}d Result`}
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
                  <span>{tCommon("ui.status.processing")}</span>
                </div>
              ) : (
                <p className="text-body text-foreground-secondary">
                  {`Result will appear here after ${tCommon(`ui.modes.${state.mode}`).toLowerCase()}`}
                </p>
              )}
            </div>
            <div className="hidden" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-6">
            <TextareaLoadingWrapper
              isLoading={state.isProcessing}
              loadingText={`${tCommon(`ui.modes.${state.mode}`)}...`}
              minDisplayTime={800}
              aria-label={`${state.mode} operation in progress`}
            >
              <textarea
                value={
                  state.result?.success && state.result.data
                    ? state.result.data
                    : ""
                }
                readOnly
                placeholder={
                  state.mode === "encode"
                    ? `${tCommon("ui.modes.encode")}d data will appear here...`
                    : `${tCommon("ui.modes.decode")}d data will appear here...`
                }
                className={cn(
                  "input-field h-40 resize-vertical text-code bg-background-tertiary",
                  state.result?.success && state.result.data
                    ? "cursor-text select-all"
                    : "cursor-default",
                  !state.result?.success || !state.result.data
                    ? "placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    : "",
                )}
                aria-label={`${state.mode} result`}
              />
            </TextareaLoadingWrapper>

            <CopyExportBar
              value={state.result?.success ? state.result.data || "" : ""}
              rawValue={state.result?.success ? state.result.data || "" : ""}
              filename={Base64Service.generateFilename(
                state.mode,
                state.result?.filename || state.fileInput?.name,
              )}
              mimeType="text/plain;charset=utf-8"
              onDownloadData={() =>
                state.result?.success && state.result.data
                  ? new Blob([state.result.data], {
                      type: "text/plain;charset=utf-8",
                    })
                  : null
              }
              disabled={state.isProcessing || !state.result?.success}
              labels={{
                copy: tCommon("ui.actions.copy"),
                copyRaw: tCommon("ui.actions.copyRaw"),
                copyJSON: tCommon("ui.actions.copyJSON"),
                download: tCommon("ui.actions.download"),
                copied: tCommon("ui.status.copied"),
              }}
              onAnnounce={(msg, kind) =>
                setAnnouncement(announceToScreenReader(msg, kind))
              }
            />

            {/* Result Warnings */}
            {state.result?.success &&
              state.result.warnings &&
              state.result.warnings.length > 0 && (
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
