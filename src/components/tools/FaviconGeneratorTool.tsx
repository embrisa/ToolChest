"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  AriaLiveRegion,
  useAccessibilityAnnouncements,
  Alert,
  AlertList,
  ProgressIndicator,
  ResultsPanel,
  ResultBadge,
  FileUpload,
  FileInfo,
  SizeSelector,
  ColorPicker,
} from "@/components/ui";
import { FaviconPreview } from "./FaviconPreview";
import { FaviconGeneratorService } from "@/services/tools/faviconGeneratorService";
import {
  FaviconGeneratorState,
  FaviconGenerationOptions,
  FaviconSizeKey,
  GeneratedFavicon,
  FaviconA11yAnnouncement,
  DEFAULT_FAVICON_OPTIONS,
  FAVICON_SIZES,
  FAVICON_FILE_LIMITS,
} from "@/types/tools/faviconGenerator";
import { cn } from "@/utils";

export function FaviconGeneratorTool() {
  const [state, setState] = useState<FaviconGeneratorState>({
    sourceImage: null,
    sourceImages: [],
    options: { ...DEFAULT_FAVICON_OPTIONS },
    isProcessing: false,
    isBatchProcessing: false,
    progress: null,
    batchProgress: null,
    result: null,
    batchResults: [],
    error: null,
    warnings: [],
    validationErrors: [],
    previewUrls: {},
    showPreview: false,
  });

  const [announcement, setAnnouncement] = useState<FaviconA11yAnnouncement | null>(null);
  const [copySuccess, setCopySuccess] = useState<{ success: boolean; message: string } | null>(null);

  const { announceToScreenReader } = useAccessibilityAnnouncements();
  const stateRef = useRef(state);

  // Keep stateRef current
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Generate real-time preview with performance optimization
  const generatePreview = useCallback(
    async (file: File, options: FaviconGenerationOptions) => {
      try {
        const isLargeFile = file.size > FAVICON_FILE_LIMITS.largeFileThreshold;
        const previewSizes: FaviconSizeKey[] = isLargeFile
          ? ["png32", "png48"]
          : ["png16", "png32", "png48", "appleTouch180"];

        const { image } = await FaviconGeneratorService.loadImageFile(file);
        const newPreviewUrls: { [key in FaviconSizeKey]?: string } = {};

        for (const sizeKey of previewSizes) {
          if (options.sizes.includes(sizeKey)) {
            const size = FAVICON_SIZES[sizeKey];
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) continue;

            canvas.width = size.width;
            canvas.height = size.height;

            if (options.backgroundColor && options.backgroundColor !== "transparent") {
              ctx.fillStyle = options.backgroundColor;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            const padding = options.padding || 0;
            const availableWidth = canvas.width - padding * 2;
            const availableHeight = canvas.height - padding * 2;

            const scaleX = availableWidth / image.naturalWidth;
            const scaleY = availableHeight / image.naturalHeight;
            const scale = Math.min(scaleX, scaleY);

            const scaledWidth = image.naturalWidth * scale;
            const scaledHeight = image.naturalHeight * scale;

            const x = (canvas.width - scaledWidth) / 2;
            const y = (canvas.height - scaledHeight) / 2;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

            const quality = options.compressionOptions?.enabled
              ? options.compressionOptions.quality
              : 0.9;

            newPreviewUrls[sizeKey] = canvas.toDataURL("image/png", quality);
          }
        }

        setState((prev) => ({
          ...prev,
          previewUrls: newPreviewUrls,
          showPreview: Object.keys(newPreviewUrls).length > 0,
        }));

        if (isLargeFile) {
          announceToScreenReader(
            "Large file detected. Preview generated with optimization.",
            "polite",
          );
        }
      } catch (error) {
        console.warn("Preview generation failed:", error);
      }
    },
    [announceToScreenReader],
  );

  // Handle single file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      const validation = FaviconGeneratorService.validateFile(file);

      setState((prev) => ({
        ...prev,
        sourceImage: file,
        sourceImages: [file],
        error: validation.isValid ? null : validation.error || "Invalid file",
        warnings: validation.warnings || [],
        validationErrors: validation.isValid ? [] : [validation.error || "Invalid file"],
        result: null,
        batchResults: [],
        showPreview: false,
      }));

      if (!validation.isValid) {
        announceToScreenReader(`File validation failed: ${validation.error}`, "assertive");
      } else {
        const warnings = validation.warnings?.join(". ") || "";
        const sizeText = (file.size / (1024 * 1024)).toFixed(1);
        announceToScreenReader(
          `File ${file.name} selected successfully (${sizeText}MB). ${warnings}`,
          "polite",
        );

        generatePreview(file, state.options);
      }
    },
    [announceToScreenReader, generatePreview, state.options],
  );

  // Handle size selection
  const handleSizeToggle = useCallback(
    (sizeKey: string) => {
      setState((prev) => {
        const newSizes = prev.options.sizes.includes(sizeKey as FaviconSizeKey)
          ? prev.options.sizes.filter((s) => s !== sizeKey)
          : [...prev.options.sizes, sizeKey as FaviconSizeKey];

        const newOptions = { ...prev.options, sizes: newSizes };

        if (prev.sourceImage) {
          generatePreview(prev.sourceImage, newOptions);
        }

        return { ...prev, options: newOptions };
      });
    },
    [generatePreview],
  );

  // Handle size presets
  const handleSizePresets = useCallback(
    (preset: "standard" | "all" | "clear") => {
      const newSizes = (() => {
        switch (preset) {
          case "standard":
            return ["png16", "png32", "png48", "android192"] as FaviconSizeKey[];
          case "all":
            return Object.keys(FAVICON_SIZES) as FaviconSizeKey[];
          case "clear":
            return [] as FaviconSizeKey[];
          default:
            return state.options.sizes;
        }
      })();

      const newOptions = { ...state.options, sizes: newSizes };
      setState((prev) => ({ ...prev, options: newOptions }));

      if (state.sourceImage) {
        generatePreview(state.sourceImage, newOptions);
      }
    },
    [generatePreview, state.options.sizes, state.sourceImage],
  );

  // Handle options change
  const handleOptionsChange = useCallback(
    (updates: Partial<FaviconGenerationOptions>) => {
      setState((prev) => {
        const newOptions = { ...prev.options, ...updates };

        if (prev.sourceImage) {
          generatePreview(prev.sourceImage, newOptions);
        }

        return { ...prev, options: newOptions };
      });
    },
    [generatePreview],
  );

  // Handle favicon generation
  const handleGenerate = useCallback(async () => {
    if (!state.sourceImage) return;

    try {
      setState((prev) => ({ ...prev, isProcessing: true, error: null }));
      announceToScreenReader("Starting favicon generation...", "polite");

      const result = await FaviconGeneratorService.generateFavicons(
        state.sourceImage,
        state.options,
        (progress) => setState((prev) => ({ ...prev, progress })),
      );

      setState((prev) => ({ ...prev, result, isProcessing: false }));
      announceToScreenReader("Favicon generation completed successfully!", "polite");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Generation failed";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isProcessing: false,
      }));
      announceToScreenReader(`Generation failed: ${errorMessage}`, "assertive");
    }
  }, [state.sourceImage, state.options, announceToScreenReader]);

  // Copy all favicons to clipboard
  const handleCopyAll = useCallback(async () => {
    if (!state.result?.favicons) return;

    try {
      const faviconData = state.result.favicons
        .map((favicon) => `${favicon.size.name}: ${favicon.dataUrl}`)
        .join('\n\n');

      await navigator.clipboard.writeText(faviconData);
      setCopySuccess({ success: true, message: "All favicon URLs copied to clipboard" });
      announceToScreenReader("All favicon URLs copied to clipboard", "polite");

      setTimeout(() => setCopySuccess(null), 3000);
    } catch (error) {
      setCopySuccess({ success: false, message: "Failed to copy to clipboard" });
      announceToScreenReader("Failed to copy to clipboard", "assertive");
    }
  }, [state.result?.favicons, announceToScreenReader]);

  // Download all favicons
  const downloadAllFavicons = useCallback(async () => {
    if (!state.result?.favicons) return;

    try {
      announceToScreenReader("Starting downloads...", "polite");

      state.result.favicons.forEach((favicon) => {
        const link = document.createElement("a");
        link.href = favicon.dataUrl;
        link.download = favicon.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      announceToScreenReader("All favicons downloaded", "polite");
    } catch (error) {
      announceToScreenReader("Failed to download files", "assertive");
    }
  }, [state.result?.favicons, announceToScreenReader]);

  // Clear file input
  const handleClearFile = useCallback(() => {
    setState((prev) => ({
      ...prev,
      sourceImage: null,
      sourceImages: [],
      result: null,
      error: null,
      warnings: [],
      validationErrors: [],
      previewUrls: {},
      showPreview: false,
    }));

    announceToScreenReader("File cleared", "polite");
  }, [announceToScreenReader]);

  // Transform FAVICON_SIZES to SizeSelector format
  const sizeOptions = Object.fromEntries(
    Object.entries(FAVICON_SIZES).map(([key, size]) => [
      key,
      {
        key,
        name: size.name,
        width: size.width,
        height: size.height,
        recommended: ["png16", "png32", "png48", "android192"].includes(key),
      },
    ])
  );

  return (
    <div className="container-wide space-y-12">
      {/* ARIA live region for screen reader announcements */}
      <AriaLiveRegion announcement={announcement} />

      {/* Favicon Generation Settings */}
      <Card variant="elevated" className="tool-card-favicon">
        <CardHeader className="pb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="tool-icon tool-icon-favicon h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 flex items-center justify-center">
              <span className="text-lg font-bold text-purple-700 dark:text-purple-300">🎨</span>
            </div>
            <div>
              <h2 className="text-title text-2xl font-semibold text-foreground mb-2">
                Favicon Generation Settings
              </h2>
              <p className="text-body text-foreground-secondary">
                Configure your favicon generation preferences
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Size Selection */}
            <div className="space-y-4">
              <label className="text-body font-medium text-foreground">Favicon Sizes</label>
              <SizeSelector
                sizes={sizeOptions}
                selectedSizes={state.options.sizes}
                onSizeToggle={handleSizeToggle}
                onPresetsChange={handleSizePresets}
                disabled={state.isProcessing}
                className="max-h-80 overflow-y-auto"
              />
            </div>

            {/* Customization Options */}
            <div className="space-y-6">
              {/* Background Color */}
              <div className="space-y-4">
                <ColorPicker
                  value={state.options.backgroundColor || "transparent"}
                  onChange={(color) => handleOptionsChange({ backgroundColor: color })}
                  label="Background Color"
                  disabled={state.isProcessing}
                />
              </div>

              {/* Padding */}
              <div className="space-y-3">
                <label className="text-body font-medium text-foreground">
                  Padding: {state.options.padding || 0}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={state.options.padding || 0}
                  onChange={(e) => handleOptionsChange({ padding: parseInt(e.target.value) })}
                  className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                  aria-label="Padding amount"
                  disabled={state.isProcessing}
                />
                <div className="flex justify-between text-sm text-foreground-secondary">
                  <span>No padding</span>
                  <span>Maximum padding</span>
                </div>
              </div>

              {/* Output Format */}
              <div className="space-y-3">
                <label className="text-body font-medium text-foreground">Output Format</label>
                <select
                  value={state.options.outputFormat || "png"}
                  onChange={(e) =>
                    handleOptionsChange({
                      outputFormat: e.target.value as "png" | "webp" | "jpeg",
                    })
                  }
                  className="input-field h-12"
                  aria-label="Output format"
                  disabled={state.isProcessing}
                >
                  <option value="png">PNG (Recommended)</option>
                  <option value="webp">WebP (Smaller size)</option>
                  <option value="jpeg">JPEG (No transparency)</option>
                </select>
              </div>

              {/* Quality */}
              <div className="space-y-3">
                <label className="text-body font-medium text-foreground">
                  Quality: {Math.round((state.options.quality || 0.9) * 100)}%
                </label>
                <input
                  type="range"
                  min="0.6"
                  max="1.0"
                  step="0.1"
                  value={state.options.quality || 0.9}
                  onChange={(e) => handleOptionsChange({ quality: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                  aria-label="Output quality"
                  disabled={state.isProcessing}
                />
                <div className="flex justify-between text-sm text-foreground-secondary">
                  <span>Smaller files</span>
                  <span>Best quality</span>
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.options.generateManifest}
                    onChange={(e) => handleOptionsChange({ generateManifest: e.target.checked })}
                    className="checkbox"
                    disabled={state.isProcessing}
                  />
                  <span className="text-sm text-foreground">Generate web app manifest.json</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.options.generateICO}
                    onChange={(e) => handleOptionsChange({ generateICO: e.target.checked })}
                    className="checkbox"
                    disabled={state.isProcessing}
                  />
                  <span className="text-sm text-foreground">Generate .ico files</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Upload */}
      <Card variant="default">
        <CardHeader className="pb-8">
          <h2 className="text-title text-xl font-semibold text-foreground mb-2">
            Image Upload
          </h2>
          <p className="text-body text-foreground-secondary">
            Upload your source image for favicon generation
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-8">
            {/* File Upload Area */}
            <FileUpload
              onFileSelect={handleFileSelect}
              accept="image/*"
              maxSize={10}
              disabled={state.isProcessing}
              icon={
                <svg
                  className="h-10 w-10 text-purple-600 dark:text-purple-400"
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
              }
              title="Click to upload"
              subtitle="PNG, JPG, SVG supported • Maximum file size: 10MB"
            />

            {/* Selected File Info */}
            {state.sourceImage && (
              <FileInfo
                file={state.sourceImage}
                onRemove={handleClearFile}
                disabled={state.isProcessing}
              />
            )}
          </div>

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

          {/* Generate Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={handleGenerate}
              disabled={
                !state.sourceImage ||
                state.isProcessing ||
                state.options.sizes.length === 0
              }
              size="lg"
              className="min-w-48"
            >
              {state.isProcessing ? "Generating..." : "Generate Favicons"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Real-time Preview */}
      {state.showPreview && Object.keys(state.previewUrls).length > 0 && (
        <Card variant="elevated" className="tool-card-favicon animate-fade-in-up">
          <CardHeader className="pb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="tool-icon tool-icon-favicon h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30 flex items-center justify-center">
                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">👁️</span>
              </div>
              <div>
                <h2 className="text-title text-2xl font-semibold text-foreground mb-2">
                  Real-time Preview
                </h2>
                <p className="text-body text-foreground-secondary">
                  See how your favicons will look in different browser contexts and sizes
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-8">
              {/* Preview Component */}
              <FaviconPreview
                previewUrls={state.previewUrls}
                selectedContext={state.options.previewContext}
                onContextChange={(context) =>
                  handleOptionsChange({
                    previewContext: context as "browser" | "bookmark" | "desktop" | "all",
                  })
                }
                title="Context Preview"
              />

              {/* Preview Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <div className="text-sm font-medium text-foreground-secondary mb-1">
                    Sizes Generated
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {Object.keys(state.previewUrls).length}
                  </div>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <div className="text-sm font-medium text-foreground-secondary mb-1">
                    Format
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {(state.options.outputFormat || "PNG").toUpperCase()}
                  </div>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <div className="text-sm font-medium text-foreground-secondary mb-1">
                    Quality
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {Math.round((state.options.quality || 0.9) * 100)}%
                  </div>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <div className="text-sm font-medium text-foreground-secondary mb-1">
                    Padding
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {state.options.padding || 0}px
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Indicator */}
      {state.isProcessing && state.progress && (
        <Card variant="elevated" className="animate-fade-in-up">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-body font-medium text-foreground">
                  {state.progress.currentStep || "Processing..."}
                </span>
                <span className="text-body text-foreground-secondary">
                  {state.progress.percentage}%
                </span>
              </div>
              <ProgressIndicator
                progress={{
                  progress: state.progress.percentage,
                  stage: "processing",
                  bytesProcessed: state.progress.completed,
                  totalBytes: state.progress.total,
                  estimatedTimeRemaining: state.progress.estimatedTimeRemaining,
                }}
                label="Favicon generation"
                className="w-full"
              />
              {state.progress.estimatedTimeRemaining &&
                state.progress.estimatedTimeRemaining > 1 && (
                  <p className="text-sm text-foreground-secondary">
                    Estimated time remaining: {Math.round(state.progress.estimatedTimeRemaining / 1000)}s
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
            <Alert variant="error" title="Favicon Generation Failed">
              {state.error}
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      <ResultsPanel
        title="Generated Favicons"
        result={
          state.result?.favicons
            ? state.result.favicons
              .map((favicon) => `${favicon.size.name} (${favicon.size.width}×${favicon.size.height}): ${favicon.filename}`)
              .join('\n')
            : ""
        }
        isProcessing={state.isProcessing}
        onCopy={handleCopyAll}
        copySuccess={copySuccess?.success}
        copyLabel="Copy All URLs"
        placeholder={
          state.isProcessing
            ? "Generating favicon files..."
            : "Generated favicons will appear here after processing your image"
        }
        metadata={
          state.result?.success
            ? [
              {
                label: "Favicons",
                value: state.result.favicons?.length || 0,
                format: (v: string | number) => `${v} size${Number(v) === 1 ? '' : 's'} generated`
              },
              ...(state.result.processingTime
                ? [{
                  label: "Processing Time",
                  value: state.result.processingTime,
                  format: (v: string | number) => `${v}ms`
                }]
                : []),
              ...(state.result.manifestJson
                ? [{ label: "Manifest", value: "Generated" }]
                : [])
            ]
            : []
        }
        badges={
          state.result?.success && state.result.favicons
            ? state.result.favicons.slice(0, 6).map((favicon, index) => (
              <ResultBadge key={index} variant="success">
                {favicon.size.name}
              </ResultBadge>
            ))
            : []
        }
        rows={8}
        className="animate-fade-in-up"
      >
        {/* Additional Actions */}
        {state.result?.success && state.result.favicons && (
          <div className="mt-6 space-y-4">
            <div className="flex gap-3">
              <Button
                onClick={downloadAllFavicons}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                Download All Files
              </Button>
            </div>

            {/* Individual Favicon Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {state.result.favicons.map((favicon, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-background-tertiary rounded-lg border"
                >
                  <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center overflow-hidden">
                    <img
                      src={favicon.dataUrl}
                      alt={`${favicon.size.width}×${favicon.size.height}`}
                      className="max-w-full max-h-full"
                      style={{
                        width: Math.min(favicon.size.width, 32),
                        height: Math.min(favicon.size.height, 32),
                        imageRendering: favicon.size.width <= 32 ? "pixelated" : "auto",
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {favicon.size.name}
                    </p>
                    <p className="text-xs text-foreground-secondary">
                      {favicon.size.width}×{favicon.size.height}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = favicon.dataUrl;
                      link.download = favicon.filename;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="text-xs px-2 py-1"
                  >
                    Save
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Copy Success Feedback */}
        {copySuccess && (
          <Alert
            variant={copySuccess.success ? "success" : "error"}
            className="animate-fade-in"
          >
            {copySuccess.message}
          </Alert>
        )}

        {/* Manifest JSON Display */}
        {state.result?.manifestJson && (
          <div className="mt-6">
            <h3 className="text-body font-medium text-foreground mb-3">
              Web App Manifest (manifest.json)
            </h3>
            <pre className="text-code bg-background-tertiary p-4 rounded-lg overflow-x-auto text-sm">
              {state.result.manifestJson}
            </pre>
          </div>
        )}
      </ResultsPanel>
    </div>
  );
}
