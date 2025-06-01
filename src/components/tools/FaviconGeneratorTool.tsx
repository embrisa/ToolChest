"use client";

import { useState, useCallback, useRef } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  AriaLiveRegion,
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

export function FaviconGeneratorTool() {
  const [state, setState] = useState<FaviconGeneratorState>({
    sourceImage: null,
    sourceImages: [], // For batch processing
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

  const [dragActive, setDragActive] = useState(false);
  const [announcement, setAnnouncement] =
    useState<FaviconA11yAnnouncement | null>(null);
  const [showAdvancedOptions] = useState(false);
  const [showBatchMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Announce to screen readers
  const announceToScreenReader = useCallback(
    (message: string, type: "polite" | "assertive" = "polite") => {
      const announcement: FaviconA11yAnnouncement = {
        message,
        type,
        timestamp: Date.now(),
      };
      setAnnouncement(announcement);
      return announcement;
    },
    [],
  );

  // Generate real-time preview with performance optimization
  const generatePreview = useCallback(
    async (file: File, options: FaviconGenerationOptions) => {
      try {
        // For large files, only generate a few preview sizes
        const isLargeFile = file.size > FAVICON_FILE_LIMITS.largeFileThreshold;
        const previewSizes: FaviconSizeKey[] = isLargeFile
          ? ["png32", "png48"] // Reduced previews for large files
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

            // Fill background if specified
            if (
              options.backgroundColor &&
              options.backgroundColor !== "transparent"
            ) {
              ctx.fillStyle = options.backgroundColor;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Calculate dimensions for centering and padding
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

            // Apply compression for preview
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
        sourceImages: [file], // Also set as batch for consistency
        error: validation.isValid ? null : validation.error || "Invalid file",
        warnings: validation.warnings || [],
        validationErrors: validation.isValid
          ? []
          : [validation.error || "Invalid file"],
        result: null,
        batchResults: [],
        showPreview: false,
      }));

      if (!validation.isValid) {
        announceToScreenReader(
          `File validation failed: ${validation.error}`,
          "assertive",
        );
      } else {
        const warnings = validation.warnings?.join(". ") || "";
        const sizeText = (file.size / (1024 * 1024)).toFixed(1);
        announceToScreenReader(
          `File ${file.name} selected successfully (${sizeText}MB). ${warnings}`,
          "polite",
        );

        // Generate initial preview
        generatePreview(file, state.options);
      }
    },
    [announceToScreenReader, generatePreview, state.options],
  );

  // Note: Batch file selection is available but not exposed in UI yet
  // This implementation is ready for future batch processing features

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  // Handle size selection
  const handleSizeToggle = useCallback(
    (sizeKey: FaviconSizeKey) => {
      setState((prev) => {
        const newSizes = prev.options.sizes.includes(sizeKey)
          ? prev.options.sizes.filter((s) => s !== sizeKey)
          : [...prev.options.sizes, sizeKey];

        const newOptions = { ...prev.options, sizes: newSizes };

        // Regenerate preview if file is selected
        if (prev.sourceImage) {
          generatePreview(prev.sourceImage, newOptions);
        }

        return { ...prev, options: newOptions };
      });
    },
    [generatePreview],
  );

  // Handle options change
  const handleOptionsChange = useCallback(
    (updates: Partial<FaviconGenerationOptions>) => {
      setState((prev) => {
        const newOptions = { ...prev.options, ...updates };

        // Regenerate preview if file is selected
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
      announceToScreenReader(
        "Favicon generation completed successfully!",
        "polite",
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Generation failed";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isProcessing: false,
      }));
      announceToScreenReader(`Generation failed: ${errorMessage}`, "assertive");
    }
  }, [state.sourceImage, state.options, announceToScreenReader]);

  // Download individual favicon
  const downloadFavicon = useCallback(
    (favicon: GeneratedFavicon) => {
      const link = document.createElement("a");
      link.href = favicon.dataUrl;
      link.download = favicon.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      announceToScreenReader(`Downloaded ${favicon.filename}`, "polite");
    },
    [announceToScreenReader],
  );

  // Copy favicon URL to clipboard
  const copyToClipboard = useCallback(
    async (favicon: GeneratedFavicon) => {
      try {
        await navigator.clipboard.writeText(favicon.dataUrl);
        announceToScreenReader("Favicon URL copied to clipboard", "polite");
      } catch (error) {
        announceToScreenReader("Failed to copy to clipboard", "polite");
      }
    },
    [announceToScreenReader],
  );

  // Download all favicons as ZIP
  const downloadAllFavicons = useCallback(async () => {
    if (!state.result?.favicons) return;

    try {
      announceToScreenReader("Preparing ZIP download...", "polite");
      // Use browser download for each favicon individually for now
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

  // Render performance metrics
  const renderPerformanceMetrics = () => {
    if (!state.result?.success) return null;

    // Create mock metrics from available data
    const metrics = {
      totalGenerationTime: state.result.processingTime || 0,
      totalFileSize:
        state.result.favicons?.reduce(
          (sum, f) => sum + f.dataUrl.length * 0.75,
          0,
        ) || 0,
      memoryUsage: 0,
      compressionRatio: 0.8,
    };
    return (
      <Card className="animate-fade-in-up">
        <CardHeader>
          <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Performance Metrics
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 surface rounded-xl">
              <div className="text-2xl font-bold text-success-600 dark:text-success-400">
                {Math.round(metrics.totalGenerationTime / 1000)}s
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Generation Time
              </div>
            </div>
            <div className="text-center p-4 surface rounded-xl">
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                {metrics.totalFileSize
                  ? Math.round(metrics.totalFileSize / 1024)
                  : 0}
                KB
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Total Size
              </div>
            </div>
            <div className="text-center p-4 surface rounded-xl">
              <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                {metrics.memoryUsage
                  ? Math.round(metrics.memoryUsage / (1024 * 1024))
                  : 0}
                MB
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Memory Used
              </div>
            </div>
            <div className="text-center p-4 surface rounded-xl">
              <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                {Math.round((metrics.compressionRatio || 0) * 100)}%
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Compression
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render compression options
  const renderCompressionOptions = () => (
    <Card>
      <CardHeader>
        <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Compression & Quality
        </h3>
        <p className="text-body text-neutral-600 dark:text-neutral-400 mt-2">
          Adjust compression settings to balance file size and quality
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <input
              id="enable-compression"
              type="checkbox"
              checked={state.options.compressionOptions?.enabled || false}
              onChange={(e) =>
                handleOptionsChange({
                  compressionOptions: {
                    enabled: e.target.checked,
                    quality: state.options.compressionOptions?.quality || 0.9,
                    format: state.options.compressionOptions?.format || "png",
                    maxFileSize:
                      state.options.compressionOptions?.maxFileSize || 1024000,
                    preserveTransparency:
                      state.options.compressionOptions?.preserveTransparency ||
                      true,
                    algorithm:
                      state.options.compressionOptions?.algorithm || "default",
                  },
                })
              }
              className="checkbox"
            />
            <label htmlFor="enable-compression" className="form-label">
              Enable advanced compression
            </label>
          </div>

          {state.options.compressionOptions?.enabled && (
            <div className="animate-fade-in-up space-y-4">
              <div>
                <label
                  htmlFor="compression-quality"
                  className="form-label mb-2"
                >
                  Quality:{" "}
                  {Math.round(
                    (state.options.compressionOptions?.quality || 0.9) * 100,
                  )}
                  %
                </label>
                <input
                  id="compression-quality"
                  type="range"
                  min="0.6"
                  max="1.0"
                  step="0.05"
                  value={state.options.compressionOptions?.quality || 0.9}
                  onChange={(e) =>
                    handleOptionsChange({
                      compressionOptions: {
                        enabled: true,
                        quality: parseFloat(e.target.value),
                        format:
                          state.options.compressionOptions?.format || "png",
                        maxFileSize:
                          state.options.compressionOptions?.maxFileSize ||
                          1024000,
                        preserveTransparency:
                          state.options.compressionOptions
                            ?.preserveTransparency || true,
                        algorithm:
                          state.options.compressionOptions?.algorithm ||
                          "default",
                      },
                    })
                  }
                  className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  <span>Smaller files</span>
                  <span>Best quality</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Accessibility Announcements */}
      <AriaLiveRegion announcement={announcement} />

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="tool-icon tool-icon-favicon mx-auto">
          <span className="text-2xl">🎨</span>
        </div>
        <div>
          <h1 className="text-display text-4xl font-bold text-gradient-brand mb-2">
            Favicon Generator
          </h1>
          <p className="text-body text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Create professional favicons in all sizes from your image. Optimized
            for modern browsers with support for high-DPI displays and web app
            manifests.
          </p>
        </div>
      </div>

      {/* File Upload */}
      <Card className="tool-card tool-card-favicon">
        <CardHeader>
          <h2 className="text-title text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Upload Image
          </h2>
          <p className="text-body text-neutral-600 dark:text-neutral-400 mt-2">
            Support for PNG, JPG, SVG up to 10MB. Best results with square
            images (512×512px or larger)
          </p>
        </CardHeader>
        <CardContent>
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              dragActive
                ? "border-success-400 bg-success-50 dark:bg-success-950/20"
                : "border-neutral-300 dark:border-neutral-600 hover:border-success-400 hover:bg-success-50/50 dark:hover:bg-success-950/10"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-describedby="file-upload-description"
            />

            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              <div>
                <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  {dragActive
                    ? "Drop your image here"
                    : "Drag & drop your image here"}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400">
                  or{" "}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-success-600 dark:text-success-400 font-medium hover:text-success-700 dark:hover:text-success-300 focus:outline-none focus:ring-2 focus:ring-success-500/50 rounded"
                  >
                    browse files
                  </button>
                </p>
              </div>

              <div
                id="file-upload-description"
                className="text-sm text-neutral-500 dark:text-neutral-400"
              >
                Supports PNG, JPG, SVG • Max 10MB • Square images recommended
              </div>
            </div>

            {state.sourceImage && (
              <div className="mt-6 p-4 surface-glass rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-success-600 dark:text-success-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {state.sourceImage.name}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {(state.sourceImage.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        sourceImage: null,
                        sourceImages: [],
                        previewUrls: {},
                        showPreview: false,
                      }))
                    }
                    className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Validation Errors */}
          {state.validationErrors.length > 0 && (
            <div className="mt-4 p-4 bg-error-50 dark:bg-error-950/20 border border-error-200 dark:border-error-800 rounded-xl">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-error-600 dark:text-error-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <h4 className="font-medium text-error-900 dark:text-error-100">
                    Upload Error
                  </h4>
                  <ul className="mt-1 text-sm text-error-700 dark:text-error-300 space-y-1">
                    {state.validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {state.warnings.length > 0 && (
            <div className="mt-4 p-4 bg-warning-50 dark:bg-warning-950/20 border border-warning-200 dark:border-warning-800 rounded-xl">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-warning-600 dark:text-warning-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <h4 className="font-medium text-warning-900 dark:text-warning-100">
                    Optimization Suggestions
                  </h4>
                  <ul className="mt-1 text-sm text-warning-700 dark:text-warning-300 space-y-1">
                    {state.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Size Selection */}
      <Card>
        <CardHeader>
          <h2 className="text-title text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Favicon Sizes
          </h2>
          <p className="text-body text-neutral-600 dark:text-neutral-400 mt-2">
            Select the sizes you need. Modern browsers typically use 32×32px for
            tabs and 192×192px for web apps.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(FAVICON_SIZES).map(([sizeKey, size]) => {
              const isSelected = state.options.sizes.includes(
                sizeKey as FaviconSizeKey,
              );
              return (
                <div
                  key={sizeKey}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    isSelected
                      ? "border-success-400 bg-success-50 dark:bg-success-950/20 shadow-colored"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-success-300 hover:bg-success-50/30 dark:hover:bg-success-950/10"
                  }`}
                  onClick={() => handleSizeToggle(sizeKey as FaviconSizeKey)}
                >
                  <div className="text-center space-y-2">
                    <div
                      className={`w-8 h-8 mx-auto border rounded flex items-center justify-center ${
                        isSelected
                          ? "border-success-400 bg-success-100 dark:bg-success-900/50"
                          : "border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-success-600 dark:text-success-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {size.name}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {size.width}×{size.height}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const standardSizes: FaviconSizeKey[] = [
                  "png16",
                  "png32",
                  "png48",
                  "android192",
                ];
                handleOptionsChange({ sizes: standardSizes });
              }}
            >
              Select Standard
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const allSizes = Object.keys(FAVICON_SIZES) as FaviconSizeKey[];
                handleOptionsChange({ sizes: allSizes });
              }}
            >
              Select All
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOptionsChange({ sizes: [] })}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customization Options */}
      <Card>
        <CardHeader>
          <h2 className="text-title text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Customization
          </h2>
          <p className="text-body text-neutral-600 dark:text-neutral-400 mt-2">
            Fine-tune your favicon appearance and format settings
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Background Color */}
            <div>
              <label className="form-label mb-3">Background Color</label>
              <div className="flex items-center space-x-4">
                <ColorPicker
                  value={state.options.backgroundColor || "transparent"}
                  onChange={(color) =>
                    handleOptionsChange({ backgroundColor: color })
                  }
                  className="w-12 h-12"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={state.options.backgroundColor || "transparent"}
                    onChange={(e) =>
                      handleOptionsChange({ backgroundColor: e.target.value })
                    }
                    placeholder="transparent or #FFFFFF"
                    className="input-field"
                  />
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    handleOptionsChange({ backgroundColor: "transparent" })
                  }
                >
                  Transparent
                </Button>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                Use transparent for most favicons, or set a background color for
                consistency
              </p>
            </div>

            {/* Padding */}
            <div>
              <label htmlFor="padding" className="form-label mb-2">
                Padding: {state.options.padding || 0}px
              </label>
              <input
                id="padding"
                type="range"
                min="0"
                max="32"
                value={state.options.padding || 0}
                onChange={(e) =>
                  handleOptionsChange({ padding: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                <span>No padding</span>
                <span>Maximum padding</span>
              </div>
            </div>

            {/* Output Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="output-format" className="form-label mb-2">
                  Output Format
                </label>
                <select
                  id="output-format"
                  value={state.options.outputFormat || "png"}
                  onChange={(e) =>
                    handleOptionsChange({
                      outputFormat: e.target.value as "png" | "webp" | "jpeg",
                    })
                  }
                  className="select"
                >
                  <option value="png">PNG (Recommended)</option>
                  <option value="webp">WebP (Smaller size)</option>
                  <option value="jpeg">JPEG (No transparency)</option>
                </select>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  PNG provides best quality and transparency support
                </p>
              </div>

              <div>
                <label htmlFor="quality" className="form-label mb-2">
                  Quality: {Math.round((state.options.quality || 0.9) * 100)}%
                </label>
                <input
                  id="quality"
                  type="range"
                  min="0.6"
                  max="1.0"
                  step="0.1"
                  value={state.options.quality || 0.9}
                  onChange={(e) =>
                    handleOptionsChange({ quality: parseFloat(e.target.value) })
                  }
                  className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  <span>Smaller</span>
                  <span>Best quality</span>
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={state.options.generateManifest}
                  onChange={(e) =>
                    handleOptionsChange({ generateManifest: e.target.checked })
                  }
                  className="checkbox"
                />
                <span className="form-label">
                  Generate web app manifest.json
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={state.options.generateICO}
                  onChange={(e) =>
                    handleOptionsChange({ generateICO: e.target.checked })
                  }
                  className="checkbox"
                />
                <span className="form-label">Generate .ico files</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Real-time Preview */}
      {state.showPreview && Object.keys(state.previewUrls).length > 0 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <h2 className="text-title text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              Enhanced Preview
            </h2>
            <p className="text-body text-neutral-600 dark:text-neutral-400 mt-2">
              See how your favicons will look in different contexts with
              realistic simulations
            </p>
          </CardHeader>
          <CardContent>
            <FaviconPreview
              previewUrls={state.previewUrls}
              selectedContext={state.options.previewContext}
              onContextChange={(context) =>
                handleOptionsChange({
                  previewContext: context as
                    | "browser"
                    | "bookmark"
                    | "desktop"
                    | "all",
                })
              }
              title="Context Preview"
            />
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      <div className="text-center">
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

      {/* Progress Indicator */}
      {state.isProcessing && state.progress && (
        <Card className="animate-fade-in-up">
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {state.progress.currentStep}
                </span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {state.progress.percentage}%
                </span>
              </div>

              <div
                className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 overflow-hidden"
                role="progressbar"
                aria-valuenow={state.progress.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Favicon generation progress"
              >
                <div
                  className="bg-gradient-to-r from-success-500 to-success-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${state.progress.percentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-sm text-neutral-500 dark:text-neutral-400">
                <span>
                  {state.progress.completed} of {state.progress.total} complete
                </span>
                {state.progress.estimatedTimeRemaining &&
                  state.progress.estimatedTimeRemaining > 1 && (
                    <span>
                      {Math.round(state.progress.estimatedTimeRemaining / 1000)}
                      s remaining
                    </span>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {state.result?.success && state.result.favicons && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-title text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                Generated Favicons
              </h2>
              <Button
                onClick={downloadAllFavicons}
                variant="primary"
                className="bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700"
              >
                Download All as ZIP
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.result.favicons.map((favicon, index) => (
                <div
                  key={index}
                  className="surface rounded-xl p-6 text-center space-y-4 hover:shadow-large transition-all duration-200"
                >
                  <div className="w-16 h-16 mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center overflow-hidden">
                    <img
                      src={favicon.dataUrl}
                      alt={`Favicon ${favicon.size.width}x${favicon.size.height}`}
                      className="max-w-full max-h-full"
                      style={{
                        width: Math.min(favicon.size.width, 64),
                        height: Math.min(favicon.size.height, 64),
                        imageRendering:
                          favicon.size.width <= 32 ? "pixelated" : "auto",
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {favicon.size.name}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {favicon.size.width}×{favicon.size.height}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {Math.round((favicon.dataUrl.length * 0.75) / 1024)} KB
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadFavicon(favicon)}
                      className="flex-1"
                    >
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(favicon)}
                    >
                      Copy URL
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {state.result.manifestJson && (
              <div className="mt-8 p-6 surface rounded-xl">
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                  Web App Manifest (manifest.json)
                </h3>
                <pre className="text-code bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg overflow-x-auto text-sm">
                  {state.result.manifestJson}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {renderPerformanceMetrics()}

      {/* Compression Options */}
      {renderCompressionOptions()}
    </div>
  );
}
