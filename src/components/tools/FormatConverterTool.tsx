"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Alert,
  ResultsPanel,
  ImportPanel,
  CopyExportBar,
  FileReadProgress,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { FormatConverterService } from "@/services/tools/formatConverterService";
import { DataFormat, FormatConverterResult } from "@/types/tools/formatConverter";
import { cn } from "@/utils";
import { AriaLiveRegion, useAccessibilityAnnouncements } from "@/components/ui/AriaLiveRegion";
import { A11yAnnouncement } from "@/types/tools/base64";
import { useToolMetrics } from "@/hooks";
import { durationSince, estimateBytesFromString, getSizeBucket, nowMs } from "@/utils/toolMetrics";
import { useCancelableFileReader } from "@/hooks/useCancelableFileReader";

const LARGE_FILE_THRESHOLD_BYTES = 5 * 1024 * 1024;

export function FormatConverterTool() {
  const tCommon = useTranslations("tools.common");
  const tUnits = useTranslations("common");
  const t = useTranslations("tools.format-converter");

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [fromFormat, setFromFormat] = useState<DataFormat>("json");
  const [toFormat, setToFormat] = useState<DataFormat>("xml");
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    { code: string; message: string }[]
  >([]);
  const [announcement, setAnnouncement] = useState<A11yAnnouncement | null>(null);
  const [importMode, setImportMode] = useState<"text" | "file">("text");
  const [inputBytes, setInputBytes] = useState<number | null>(null);
  const [fileReadProgress, setFileReadProgress] = useState<{
    loaded: number;
    total: number;
  } | null>(null);
  const fileReadAbortRef = useRef<AbortController | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const workerPendingMapRef = useRef<
    Map<
      number,
      {
        resolve: (result: FormatConverterResult) => void;
        reject: (reason: unknown) => void;
      }
    >
  >(new Map());
  const workerRequestIdRef = useRef(0);
  const [isWorkerReady, setIsWorkerReady] = useState(false);

  const { announceSuccess, announceError, announceWarning } = useAccessibilityAnnouncements();
  const { recordMetric } = useToolMetrics({ toolSlug: "format-converter" });
  const { readAsText, cancel: cancelFileRead } = useCancelableFileReader();
  const loadStartRef = useRef(nowMs());

  useEffect(() => {
    const durationMs = durationSince(loadStartRef.current);
    recordMetric({
      action: "load",
      durationMs,
      success: true,
      workerUsed: false,
    });
  }, [recordMetric]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const worker = new Worker(
        new URL("../../workers/formatConverterWorker.ts", import.meta.url),
        { type: "module" },
      );
      workerRef.current = worker;
      setIsWorkerReady(true);

      worker.onmessage = (
        event: MessageEvent<{ id: number } & FormatConverterResult>,
      ) => {
        const { id, ...result } = event.data;
        const pending = workerPendingMapRef.current.get(id);
        if (!pending) return;
        workerPendingMapRef.current.delete(id);
        pending.resolve(result);
      };

      worker.onerror = (event) => {
        console.warn("[format-converter] worker error", event);
      };

      return () => {
        workerPendingMapRef.current.clear();
        worker.terminate();
      };
    } catch (error) {
      console.warn("[format-converter] worker unavailable, falling back", error);
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelFileRead();
      fileReadAbortRef.current?.abort();
    };
  }, [cancelFileRead]);

  const convertWithWorker = useCallback(
    (
      inputValue: string,
      from: DataFormat,
      to: DataFormat,
    ): Promise<FormatConverterResult> | null => {
      if (!workerRef.current) return null;
      const requestId = workerRequestIdRef.current++;

      return new Promise<FormatConverterResult>((resolve, reject) => {
        workerPendingMapRef.current.set(requestId, { resolve, reject });
        workerRef.current?.postMessage({
          id: requestId,
          input: inputValue,
          fromFormat: from,
          toFormat: to,
        });

        setTimeout(() => {
          const pending = workerPendingMapRef.current.get(requestId);
          if (pending) {
            workerPendingMapRef.current.delete(requestId);
            reject(new Error("Worker timed out"));
          }
        }, 15_000);
      });
    },
    [],
  );

  const handleCancelFileRead = useCallback(() => {
    cancelFileRead();
    fileReadAbortRef.current?.abort();
    setFileReadProgress(null);
    setAnnouncement(announceWarning(tCommon("ui.status.cancelled")));
  }, [announceWarning, cancelFileRead, tCommon]);

  const handleConvert = useCallback(async () => {
    const actionStart = nowMs();
    const sizeFromInput =
      (inputBytes ?? estimateBytesFromString(input)) ?? 0;
    const inputSizeBucket = getSizeBucket(sizeFromInput);

    if (validationErrors.length > 0) {
      setAnnouncement(announceWarning(tCommon("validation.invalidInput")));
      recordMetric({
        action: "convert",
        durationMs: durationSince(actionStart),
        success: false,
        errorCategory: "validation",
        inputSizeBucket,
        workerUsed: false,
      });
      return;
    }

    const shouldUseWorker =
      isWorkerReady && sizeFromInput >= LARGE_FILE_THRESHOLD_BYTES;
    let workerUsed = false;

    setIsProcessing(true);
    setProcessingTime(null);

    if (shouldUseWorker) {
      setAnnouncement(announceWarning(tCommon("ui.status.processing")));
    }

    try {
      let result: FormatConverterResult | null = null;

      if (shouldUseWorker) {
        try {
          const workerResult = await convertWithWorker(
            input,
            fromFormat,
            toFormat,
          );
          if (workerResult) {
            result = workerResult;
            workerUsed = true;
          }
        } catch (workerError) {
          console.warn(
            "[format-converter] worker failed, falling back",
            workerError,
          );
          setAnnouncement(
            announceWarning(tCommon("ui.status.workerFallback")),
          );
        }
      }

      if (!result) {
        result = FormatConverterService.convert(input, fromFormat, toFormat);
      }

      const durationMs = result.processingTime ?? durationSince(actionStart);
      setProcessingTime(durationMs);

      if (result.success) {
        setOutput(result.output || "");
        setError(null);
        setAnnouncement(announceSuccess(t("tool.status.converted")));
      } else {
        setError(result.error || tCommon("errors.processingFailed"));
        setOutput("");
        setAnnouncement(announceError(result.error || tCommon("errors.processingFailed")));
      }

      recordMetric({
        action: "convert",
        durationMs,
        success: result.success,
        errorCategory: result.success ? undefined : "processing-error",
        inputSizeBucket,
        workerUsed,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : tCommon("errors.processingFailed");
      setError(message);
      setOutput("");
      setAnnouncement(announceError(message));
      recordMetric({
        action: "convert",
        durationMs: durationSince(actionStart),
        success: false,
        errorCategory: "exception",
        inputSizeBucket,
        workerUsed,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    announceError,
    announceSuccess,
    announceWarning,
    convertWithWorker,
    fromFormat,
    input,
    inputBytes,
    isWorkerReady,
    recordMetric,
    t,
    tCommon,
    toFormat,
    validationErrors.length,
  ]);

  const onFileSelect = useCallback(
    async (file: File) => {
      const shouldShowProgress = file.size >= LARGE_FILE_THRESHOLD_BYTES;
      const abortController = new AbortController();
      fileReadAbortRef.current = abortController;

      try {
        setError(null);
        setInputBytes(file.size);
        setImportMode("file");
        if (shouldShowProgress) {
          setFileReadProgress({ loaded: 0, total: file.size });
          setAnnouncement(announceWarning(tCommon("ui.status.processing")));
        }

        const text = await readAsText(file, {
          onProgress: (progress) => {
            if (shouldShowProgress) {
              setFileReadProgress(progress);
            }
          },
          signal: abortController.signal,
        });

        setInput(text);
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext === "json") setFromFormat("json");
        else if (ext === "xml") setFromFormat("xml");
        else if (ext === "csv") setFromFormat("csv");
        else if (ext === "yaml" || ext === "yml") setFromFormat("yaml");
        setAnnouncement(announceSuccess(tCommon("ui.status.success")));
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          setAnnouncement(announceWarning(tCommon("ui.status.cancelled")));
          return;
        }
        const msg =
          e instanceof Error ? e.message : tCommon("errors.processingFailed");
        setError(msg);
        setAnnouncement(announceError(msg));
      } finally {
        setFileReadProgress(null);
        fileReadAbortRef.current = null;
      }
    },
    [announceError, announceSuccess, announceWarning, readAsText, tCommon],
  );

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <Card variant="default">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex flex-col flex-1 gap-2">
                <label htmlFor="from-select" className="text-sm font-medium">
                  {t("tool.fromLabel")}
                </label>
                <select
                  id="from-select"
                  value={fromFormat}
                  onChange={(e) => setFromFormat(e.target.value as DataFormat)}
                  className={cn("input-field", "text-sm")}
                >
                  <option value="json">JSON</option>
                  <option value="xml">XML</option>
                  <option value="csv">CSV</option>
                  <option value="yaml">YAML</option>
                </select>
              </div>
              <div className="flex flex-col flex-1 gap-2">
                <label htmlFor="to-select" className="text-sm font-medium">
                  {t("tool.toLabel")}
                </label>
                <select
                  id="to-select"
                  value={toFormat}
                  onChange={(e) => setToFormat(e.target.value as DataFormat)}
                  className={cn("input-field", "text-sm")}
                >
                  <option value="json">JSON</option>
                  <option value="xml">XML</option>
                  <option value="csv">CSV</option>
                  <option value="yaml">YAML</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImportPanel
              mode={importMode}
              onModeChange={(mode) => {
                setImportMode(mode);
                if (mode === "text") {
                  setInputBytes(estimateBytesFromString(input) ?? null);
                } else {
                  setInputBytes(null);
                }
              }}
              textValue={input}
              onTextChange={(value) => {
                setInput(value);
                setInputBytes(estimateBytesFromString(value) ?? null);
              }}
              onFileSelect={onFileSelect}
              accept=".json,.xml,.csv,.yaml,.yml,.txt"
              maxSizeMB={10}
              largeHintThresholdMB={5}
              title={t("tool.placeholders.input")}
              description={tCommon("ui.placeholders.fileUpload")}
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
              onValidationChange={setValidationErrors}
              onAnnounce={(msg, kind) =>
                setAnnouncement(kind === "assertive" ? announceError(msg) : announceSuccess(msg))
              }
            />
            {fileReadProgress && (
              <FileReadProgress
                progress={fileReadProgress}
                label={tCommon("ui.status.processing")}
                note={`${tCommon("ui.status.processing")} ${(fileReadProgress.total / (1024 * 1024)).toFixed(2)} ${tUnits("units.mb")}`}
                cancelLabel={tUnits("actions.cancel")}
                onCancel={handleCancelFileRead}
              />
            )}
            <Button
              onClick={handleConvert}
              className="w-full"
              disabled={isProcessing || validationErrors.length > 0}
              aria-busy={isProcessing}
            >
              {t("tool.actions.convert")}
            </Button>
            {error && <Alert variant="error">{error}</Alert>}
            <ResultsPanel
              title={t("tool.outputTitle")}
              result={output}
              placeholder={t("tool.outputPlaceholder")}
              isProcessing={isProcessing}
              metadata={
                processingTime !== null
                  ? [
                      {
                        label: t("tool.labels.processingTime"),
                        value: `${processingTime} ms`,
                      },
                    ]
                  : []
              }
            >
              <CopyExportBar
                value={output}
                rawValue={output}
                jsonValue={(() => {
                  if (toFormat !== "json") return undefined;
                  try {
                    return JSON.parse(output);
                  } catch {
                    return undefined;
                  }
                })()}
                filename={`converted.${toFormat === "yaml" ? "yml" : toFormat}`}
                mimeType={
                  toFormat === "json"
                    ? "application/json;charset=utf-8"
                    : toFormat === "xml"
                      ? "application/xml;charset=utf-8"
                      : toFormat === "csv"
                        ? "text/csv;charset=utf-8"
                        : "text/plain;charset=utf-8"
                }
                labels={{
                  copy: tCommon("ui.actions.copy"),
                  copyRaw: tCommon("ui.actions.copyRaw"),
                  copyJSON: tCommon("ui.actions.copyJSON"),
                  download: tCommon("ui.actions.download"),
                  copied: tCommon("ui.status.copied"),
                }}
                onAnnounce={(msg, kind) =>
                  setAnnouncement(kind === "assertive" ? announceError(msg) : announceSuccess(msg))
                }
              />
            </ResultsPanel>
          </CardContent>
        </Card>
        <AriaLiveRegion announcement={announcement} />
      </div>
    </ErrorBoundary>
  );
}
