import JSZip from "jszip";
import {
  FaviconFileValidation,
  FaviconGenerationResult,
  FaviconGenerationOptions,
  GeneratedFavicon,
  FaviconProgress,
  FaviconUsageData,
  SUPPORTED_IMAGE_FORMATS,
  FAVICON_SIZES,
  FAVICON_FILE_LIMITS,
  DEFAULT_FAVICON_OPTIONS,
  BatchProcessingResult,
  BatchProgress,
  CompressionStats,
  PerformanceMetrics,
  ImageCompressionOptions,
  PERFORMANCE_THRESHOLDS,
} from "@/types/tools/faviconGenerator";

/**
 * Service for client-side favicon generation using Canvas API with enhanced performance features
 */
export class FaviconGeneratorService {
  private static performanceMonitor: PerformanceMetrics | null = null;

  /**
   * Validates an uploaded image file for favicon generation with enhanced validation
   */
  static validateFile(file: File): FaviconFileValidation {
    const validation: FaviconFileValidation = {
      isValid: false,
      warnings: [],
    };

    // Check file size
    if (file.size > FAVICON_FILE_LIMITS.maxFileSize) {
      validation.error = `File size too large. Maximum allowed size is ${Math.round(FAVICON_FILE_LIMITS.maxFileSize / (1024 * 1024))}MB`;
      return validation;
    }

    // Check file type
    if (
      !SUPPORTED_IMAGE_FORMATS.includes(
        file.type as (typeof SUPPORTED_IMAGE_FORMATS)[number],
      )
    ) {
      validation.error = `Unsupported file format. Supported formats: PNG, JPEG, SVG, WebP, GIF`;
      return validation;
    }

    // Set basic file info
    validation.fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
    };

    // Enhanced performance warnings for large files
    if (file.size > FAVICON_FILE_LIMITS.largeFileThreshold) {
      validation.warnings?.push(
        `Large file detected (${Math.round(file.size / (1024 * 1024))}MB). Processing will use enhanced optimization and may take longer.`,
      );
      validation.warnings?.push(
        "Consider using image compression to reduce processing time.",
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      // > 2MB
      validation.warnings?.push(
        "Large file detected. Processing may take longer.",
      );
    }

    if (file.type === "image/svg+xml") {
      validation.warnings?.push(
        "SVG files will be rasterized to PNG. Consider using a high-resolution PNG for better quality.",
      );
    }

    // Memory usage warning
    if (file.size > PERFORMANCE_THRESHOLDS.memoryWarningThreshold) {
      validation.warnings?.push(
        "Large file may require significant memory. Monitor system performance during processing.",
      );
    }

    validation.isValid = true;
    return validation;
  }

  /**
   * Enhanced image loading with performance monitoring
   */
  static async loadImageFile(
    file: File,
    enablePerformanceTracking = true,
  ): Promise<{
    image: HTMLImageElement;
    width: number;
    height: number;
    loadTime?: number;
  }> {
    const startTime = enablePerformanceTracking ? performance.now() : 0;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const loadTime = enablePerformanceTracking
          ? performance.now() - startTime
          : undefined;

        resolve({
          image: img,
          width: img.naturalWidth,
          height: img.naturalHeight,
          loadTime,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image file"));
      };

      img.src = url;
    });
  }

  /**
   * Enhanced favicon generation with compression and performance optimization
   */
  static async generateFavicons(
    file: File,
    options: FaviconGenerationOptions = DEFAULT_FAVICON_OPTIONS,
    onProgress?: (progress: FaviconProgress) => void,
  ): Promise<FaviconGenerationResult> {
    const startTime = Date.now();
    let performanceMetrics: PerformanceMetrics | undefined;

    if (options.enablePerformanceTracking) {
      performanceMetrics = {
        imageLoadTime: 0,
        canvasProcessingTime: 0,
        compressionTime: 0,
        totalProcessingTime: 0,
      };
    }

    try {
      // Validate file first
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || "File validation failed",
          warnings: validation.warnings,
        };
      }

      // Enhanced image loading with performance tracking
      const imageLoadStart = performance.now();
      const { image, width, height } = await this.loadImageFile(
        file,
        options.enablePerformanceTracking,
      );

      if (performanceMetrics) {
        performanceMetrics.imageLoadTime = performance.now() - imageLoadStart;
      }

      // Check dimensions
      if (
        width < FAVICON_FILE_LIMITS.minDimensions ||
        height < FAVICON_FILE_LIMITS.minDimensions
      ) {
        return {
          success: false,
          error: `Image too small. Minimum dimensions: ${FAVICON_FILE_LIMITS.minDimensions}x${FAVICON_FILE_LIMITS.minDimensions}`,
        };
      }

      if (
        width > FAVICON_FILE_LIMITS.maxDimensions ||
        height > FAVICON_FILE_LIMITS.maxDimensions
      ) {
        return {
          success: false,
          error: `Image too large. Maximum dimensions: ${FAVICON_FILE_LIMITS.maxDimensions}x${FAVICON_FILE_LIMITS.maxDimensions}`,
        };
      }

      const warnings: string[] = [...(validation.warnings || [])];

      // Enhanced quality warnings
      if (
        width < FAVICON_FILE_LIMITS.recommendedDimensions ||
        height < FAVICON_FILE_LIMITS.recommendedDimensions
      ) {
        warnings.push(
          `Source image is smaller than recommended (${FAVICON_FILE_LIMITS.recommendedDimensions}x${FAVICON_FILE_LIMITS.recommendedDimensions}). Consider using a larger image for best quality.`,
        );
      }

      if (width !== height) {
        warnings.push(
          "Source image is not square. It will be centered and may have padding.",
        );
      }

      // Large file processing strategy
      const isLargeFile = file.size > FAVICON_FILE_LIMITS.largeFileThreshold;
      if (isLargeFile && options.largeFileHandling?.enableProgressTracking) {
        warnings.push(
          "Large file detected. Using optimized processing with progress tracking.",
        );
      }

      // Generate individual favicons with enhanced processing
      const canvasProcessingStart = performance.now();
      const favicons: GeneratedFavicon[] = [];
      const totalSizes = options.sizes.length + (options.generateICO ? 1 : 0);
      let completed = 0;
      let totalOriginalSize = 0;
      let totalCompressedSize = 0;

      // Process in batches for large files
      const batchSize = isLargeFile
        ? options.batchProcessing?.maxConcurrent || 2
        : options.sizes.length;

      for (let i = 0; i < options.sizes.length; i += batchSize) {
        const batch = options.sizes.slice(i, i + batchSize);

        // Process batch concurrently for better performance
        const batchPromises = batch.map(async (sizeKey) => {
          const size = FAVICON_SIZES[sizeKey];

          onProgress?.({
            currentStep: `Generating ${size.name}`,
            completed,
            total: totalSizes,
            percentage: Math.round((completed / totalSizes) * 100),
            currentSize: size,
            estimatedTimeRemaining: this.estimateTimeRemaining(
              completed,
              totalSizes,
              startTime,
            ),
          });

          try {
            const favicon = await this.generateSingleFaviconEnhanced(
              image,
              size,
              options,
            );

            // Track compression stats
            if (options.compressionOptions?.enabled && favicon.blob.size) {
              totalOriginalSize += this.estimateUncompressedSize(
                size.width,
                size.height,
              );
              totalCompressedSize += favicon.blob.size;
            }

            return favicon;
          } catch (error) {
            console.warn(`Failed to generate ${size.name}:`, error);
            warnings.push(`Failed to generate ${size.name}`);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        favicons.push(
          ...(batchResults.filter((f) => f !== null) as GeneratedFavicon[]),
        );
        completed += batch.length;

        // Add delay between batches for large files to prevent browser freezing
        if (isLargeFile && i + batchSize < options.sizes.length) {
          await this.delay(PERFORMANCE_THRESHOLDS.batchProcessingDelay);
        }
      }

      if (performanceMetrics) {
        performanceMetrics.canvasProcessingTime =
          performance.now() - canvasProcessingStart;
      }

      // Generate multi-size ICO file if requested
      if (options.generateICO) {
        onProgress?.({
          currentStep: "Generating multi-size favicon.ico",
          completed,
          total: totalSizes,
          percentage: Math.round((completed / totalSizes) * 100),
          estimatedTimeRemaining: this.estimateTimeRemaining(
            completed,
            totalSizes,
            startTime,
          ),
        });

        try {
          const multiSizeIco = await this.generateMultiSizeICO(image, options);
          favicons.push(multiSizeIco);
        } catch (error) {
          console.warn("Failed to generate multi-size ICO:", error);
          warnings.push("Failed to generate multi-size favicon.ico");
        }

        completed++;
      }

      // Generate web app manifest if requested
      let manifestJson: string | undefined;
      if (options.generateManifest) {
        manifestJson = this.generateWebAppManifest(favicons);
      }

      // Calculate compression statistics
      let compressionStats: CompressionStats | undefined;
      if (options.compressionOptions?.enabled && totalOriginalSize > 0) {
        const compressionTime = performanceMetrics
          ? performanceMetrics.canvasProcessingTime
          : 0;
        compressionStats = {
          originalSize: totalOriginalSize,
          compressedSize: totalCompressedSize,
          compressionRatio: totalCompressedSize / totalOriginalSize,
          bytesSaved: totalOriginalSize - totalCompressedSize,
          compressionTime,
        };
      }

      const processingTime = Date.now() - startTime;

      if (performanceMetrics) {
        performanceMetrics.totalProcessingTime = processingTime;
        performanceMetrics.compressionTime =
          compressionStats?.compressionTime || 0;
      }

      return {
        success: true,
        favicons,
        manifestJson,
        warnings: warnings.length > 0 ? warnings : undefined,
        processingTime,
        compressionStats,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Favicon generation failed",
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Batch processing for multiple images
   */
  static async generateFaviconsBatch(
    files: File[],
    options: FaviconGenerationOptions = DEFAULT_FAVICON_OPTIONS,
    onProgress?: (progress: BatchProgress) => void,
    onFileProgress?: (progress: FaviconProgress) => void,
  ): Promise<BatchProcessingResult[]> {
    const results: BatchProcessingResult[] = [];
    const startTime = Date.now();

    // Validate batch size
    if (files.length > FAVICON_FILE_LIMITS.maxBatchFiles) {
      throw new Error(
        `Too many files. Maximum batch size is ${FAVICON_FILE_LIMITS.maxBatchFiles} files.`,
      );
    }

    // Process files with concurrency control
    const maxConcurrent = options.batchProcessing?.maxConcurrent || 2;

    for (let i = 0; i < files.length; i += maxConcurrent) {
      const batch = files.slice(i, i + maxConcurrent);

      const batchPromises = batch.map(async (file, batchIndex) => {
        const globalIndex = i + batchIndex;
        const fileStartTime = Date.now();

        onProgress?.({
          currentFile: file.name,
          filesCompleted: globalIndex,
          totalFiles: files.length,
          percentage: Math.round((globalIndex / files.length) * 100),
          estimatedTimeRemaining: this.estimateTimeRemaining(
            globalIndex,
            files.length,
            startTime,
          ),
        });

        try {
          const result = await this.generateFavicons(
            file,
            options,
            (progress) => {
              onFileProgress?.(progress);
              onProgress?.({
                currentFile: file.name,
                filesCompleted: globalIndex,
                totalFiles: files.length,
                percentage: Math.round((globalIndex / files.length) * 100),
                currentFileProgress: progress,
                estimatedTimeRemaining: this.estimateTimeRemaining(
                  globalIndex,
                  files.length,
                  startTime,
                ),
              });
            },
          );

          return {
            sourceFile: file,
            success: result.success,
            result,
            processingTime: Date.now() - fileStartTime,
          } as BatchProcessingResult;
        } catch (error) {
          return {
            sourceFile: file,
            success: false,
            error: error instanceof Error ? error.message : "Processing failed",
            processingTime: Date.now() - fileStartTime,
          } as BatchProcessingResult;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Update progress
      onProgress?.({
        currentFile: "",
        filesCompleted: Math.min(i + maxConcurrent, files.length),
        totalFiles: files.length,
        percentage: Math.round(
          (Math.min(i + maxConcurrent, files.length) / files.length) * 100,
        ),
        estimatedTimeRemaining: this.estimateTimeRemaining(
          i + maxConcurrent,
          files.length,
          startTime,
        ),
      });

      // Add delay between batches to prevent overwhelming the browser
      if (i + maxConcurrent < files.length) {
        await this.delay(PERFORMANCE_THRESHOLDS.batchProcessingDelay);
      }
    }

    return results;
  }

  /**
   * Enhanced favicon generation with compression options
   */
  private static async generateSingleFaviconEnhanced(
    sourceImage: HTMLImageElement,
    size: (typeof FAVICON_SIZES)[keyof typeof FAVICON_SIZES],
    options: FaviconGenerationOptions,
  ): Promise<GeneratedFavicon> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    canvas.width = size.width;
    canvas.height = size.height;

    // Enhanced rendering with performance optimizations
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Fill background if specified
    if (options.backgroundColor && options.backgroundColor !== "transparent") {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Calculate dimensions for centering and padding
    const padding = options.padding || 0;
    const availableWidth = canvas.width - padding * 2;
    const availableHeight = canvas.height - padding * 2;

    const scaleX = availableWidth / sourceImage.naturalWidth;
    const scaleY = availableHeight / sourceImage.naturalHeight;
    const scale = Math.min(scaleX, scaleY);

    const scaledWidth = sourceImage.naturalWidth * scale;
    const scaledHeight = sourceImage.naturalHeight * scale;

    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;

    ctx.drawImage(sourceImage, x, y, scaledWidth, scaledHeight);

    // Enhanced compression based on options
    const compressionOptions = options.compressionOptions;
    let quality = options.quality || 0.9;
    let format =
      size.format === "ico" ? "png" : compressionOptions?.format || "png";

    if (compressionOptions?.enabled) {
      quality = Math.min(quality, compressionOptions.quality);

      // Apply compression algorithm
      switch (compressionOptions.algorithm) {
        case "aggressive":
          quality *= 0.8; // Reduce quality for smaller files
          break;
        case "lossless":
          format = "png"; // Always use PNG for lossless
          quality = 1.0;
          break;
        default:
          // Use default settings
          break;
      }
    }

    // Generate blob with compression
    const blob =
      size.format === "ico"
        ? await this.generateICOBlob(canvas)
        : await this.generateCompressedBlob(
          canvas,
          format,
          quality,
          compressionOptions,
        );

    const dataUrl = await this.blobToDataUrl(blob);
    const filename = `${size.name}.${size.format === "ico" ? "ico" : format}`;

    return {
      size,
      blob,
      dataUrl,
      filename,
    };
  }

  /**
   * Generate compressed blob with enhanced options
   */
  private static async generateCompressedBlob(
    canvas: HTMLCanvasElement,
    format: string,
    quality: number,
    compressionOptions?: ImageCompressionOptions,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const mimeType = this.getMimeTypeForFormat(
        format as "png" | "webp" | "jpeg",
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to generate compressed blob"));
            return;
          }

          // Check if we need to enforce max file size
          if (
            compressionOptions?.maxFileSize &&
            blob.size > compressionOptions.maxFileSize
          ) {
            // Recursively reduce quality if file is too large
            const reducedQuality = Math.max(0.1, quality * 0.8);
            this.generateCompressedBlob(
              canvas,
              format,
              reducedQuality,
              compressionOptions,
            )
              .then(resolve)
              .catch(reject);
            return;
          }

          resolve(blob);
        },
        mimeType,
        quality,
      );
    });
  }

  /**
   * Estimate uncompressed size for compression calculations
   */
  private static estimateUncompressedSize(
    width: number,
    height: number,
  ): number {
    // Estimate 4 bytes per pixel (RGBA)
    return width * height * 4;
  }

  /**
   * Utility method to add delays for performance management
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate a single favicon of specified size
   */
  private static async generateSingleFavicon(
    sourceImage: HTMLImageElement,
    size: (typeof FAVICON_SIZES)[keyof typeof FAVICON_SIZES],
    options: FaviconGenerationOptions,
  ): Promise<GeneratedFavicon> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas 2D context not available");
    }

    canvas.width = size.width;
    canvas.height = size.height;

    // Fill background if specified
    if (options.backgroundColor && options.backgroundColor !== "transparent") {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Calculate dimensions for centering and padding
    const padding = options.padding || 0;
    const availableWidth = canvas.width - padding * 2;
    const availableHeight = canvas.height - padding * 2;

    const scaleX = availableWidth / sourceImage.naturalWidth;
    const scaleY = availableHeight / sourceImage.naturalHeight;
    const scale = Math.min(scaleX, scaleY);

    const scaledWidth = sourceImage.naturalWidth * scale;
    const scaledHeight = sourceImage.naturalHeight * scale;

    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;

    // Enable high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw the source image
    ctx.drawImage(sourceImage, x, y, scaledWidth, scaledHeight);

    // Generate appropriate file format
    let blob: Blob;
    let filename: string;

    if (size.format === "ico") {
      blob = await this.generateICOBlob(canvas);
      filename = `${size.name}.ico`;
    } else {
      // Use the specified output format or default to PNG
      const outputFormat = options.outputFormat || "png";
      const mimeType = this.getMimeTypeForFormat(outputFormat);
      const quality = options.quality || 0.9;

      blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) =>
            b
              ? resolve(b)
              : reject(
                new Error(
                  `Failed to generate ${outputFormat.toUpperCase()} blob`,
                ),
              ),
          mimeType,
          quality,
        );
      });
      filename = `${size.name}.${outputFormat}`;
    }

    const dataUrl = await this.blobToDataUrl(blob);

    return {
      size,
      blob,
      dataUrl,
      filename,
    };
  }

  /**
   * Generate a multi-size ICO file containing 16x16 and 32x32 images
   */
  private static async generateMultiSizeICO(
    sourceImage: HTMLImageElement,
    options: FaviconGenerationOptions,
  ): Promise<GeneratedFavicon> {
    const sizes = [16, 32]; // Standard favicon sizes
    const images: { data: Uint8Array; width: number; height: number }[] = [];

    // Generate PNG data for each size
    for (const size of sizes) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas 2D context not available");
      }

      canvas.width = size;
      canvas.height = size;

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

      const scaleX = availableWidth / sourceImage.naturalWidth;
      const scaleY = availableHeight / sourceImage.naturalHeight;
      const scale = Math.min(scaleX, scaleY);

      const scaledWidth = sourceImage.naturalWidth * scale;
      const scaledHeight = sourceImage.naturalHeight * scale;

      const x = (canvas.width - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) / 2;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(sourceImage, x, y, scaledWidth, scaledHeight);

      // Convert to PNG data
      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) =>
            blob ? resolve(blob) : reject(new Error("Failed to generate PNG")),
          "image/png",
          0.9,
        );
      });

      const pngData = new Uint8Array(await pngBlob.arrayBuffer());
      images.push({ data: pngData, width: size, height: size });
    }

    // Create ICO file with multiple images
    const icoBlob = this.createMultiSizeICOBlob(images);
    const dataUrl = await this.blobToDataUrl(icoBlob);

    return {
      size: { width: 32, height: 32, format: "ico", name: "favicon" },
      blob: icoBlob,
      dataUrl,
      filename: "favicon.ico",
    };
  }

  /**
   * Create a multi-size ICO blob from multiple PNG images
   */
  private static createMultiSizeICOBlob(
    images: { data: Uint8Array; width: number; height: number }[],
  ): Blob {
    const imageCount = images.length;

    // Calculate total size needed
    const headerSize = 6; // ICO header
    const dirEntrySize = 16 * imageCount; // Directory entries
    const totalDataSize = images.reduce((sum, img) => sum + img.data.length, 0);
    const totalSize = headerSize + dirEntrySize + totalDataSize;

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    const uint8View = new Uint8Array(buffer);

    let offset = 0;

    // ICO header (6 bytes)
    view.setUint16(offset, 0, true); // Reserved
    view.setUint16(offset + 2, 1, true); // Image type (1 = ICO)
    view.setUint16(offset + 4, imageCount, true); // Number of images
    offset += 6;

    // Directory entries (16 bytes each)
    let imageDataOffset = headerSize + dirEntrySize;
    for (let i = 0; i < imageCount; i++) {
      const img = images[i];
      const width = img.width > 255 ? 0 : img.width; // 0 means 256
      const height = img.height > 255 ? 0 : img.height; // 0 means 256

      view.setUint8(offset, width); // Width
      view.setUint8(offset + 1, height); // Height
      view.setUint8(offset + 2, 0); // Color palette size (0 for PNG)
      view.setUint8(offset + 3, 0); // Reserved
      view.setUint16(offset + 4, 1, true); // Color planes
      view.setUint16(offset + 6, 32, true); // Bits per pixel
      view.setUint32(offset + 8, img.data.length, true); // Image data size
      view.setUint32(offset + 12, imageDataOffset, true); // Offset to image data

      imageDataOffset += img.data.length;
      offset += 16;
    }

    // Image data
    for (const img of images) {
      uint8View.set(img.data, offset);
      offset += img.data.length;
    }

    return new Blob([buffer], { type: "image/x-icon" });
  }

  /**
   * Get MIME type for the given output format
   */
  private static getMimeTypeForFormat(format: "png" | "webp" | "jpeg"): string {
    switch (format) {
      case "png":
        return "image/png";
      case "webp":
        return "image/webp";
      case "jpeg":
        return "image/jpeg";
      default:
        return "image/png";
    }
  }

  /**
   * Generate single-size ICO blob (for individual size ICOs)
   */
  private static async generateICOBlob(
    canvas: HTMLCanvasElement,
  ): Promise<Blob> {
    // Get PNG data from canvas
    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to generate PNG blob for ICO"));
          }
        },
        "image/png",
        0.9,
      );
    });

    const pngData = new Uint8Array(await pngBlob.arrayBuffer());

    // ICO file format structure
    const icoHeader = new ArrayBuffer(6);
    const headerView = new DataView(icoHeader);

    // ICO signature (0x00000100)
    headerView.setUint16(0, 0, true); // Reserved field
    headerView.setUint16(2, 1, true); // Image type (1 = ICO)
    headerView.setUint16(4, 1, true); // Number of images

    // ICO directory entry
    const dirEntry = new ArrayBuffer(16);
    const dirView = new DataView(dirEntry);

    const width = canvas.width > 255 ? 0 : canvas.width; // 0 means 256
    const height = canvas.height > 255 ? 0 : canvas.height; // 0 means 256

    dirView.setUint8(0, width); // Image width
    dirView.setUint8(1, height); // Image height
    dirView.setUint8(2, 0); // Color palette size (0 for PNG)
    dirView.setUint8(3, 0); // Reserved
    dirView.setUint16(4, 1, true); // Color planes
    dirView.setUint16(6, 32, true); // Bits per pixel
    dirView.setUint32(8, pngData.length, true); // Image data size
    dirView.setUint32(12, 22, true); // Offset to image data (6 + 16 = 22)

    // Combine all parts
    const icoData = new Uint8Array(6 + 16 + pngData.length);
    icoData.set(new Uint8Array(icoHeader), 0);
    icoData.set(new Uint8Array(dirEntry), 6);
    icoData.set(pngData, 22);

    return new Blob([icoData], { type: "image/x-icon" });
  }

  /**
   * Convert blob to data URL
   */
  private static async blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () =>
        reject(new Error("Failed to convert blob to data URL"));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Generate comprehensive web app manifest.json
   */
  private static generateWebAppManifest(favicons: GeneratedFavicon[]): string {
    const icons = favicons
      .filter(
        (favicon) => favicon.size.format === "png" && favicon.size.width >= 192,
      )
      .map((favicon) => {
        const icon: any = {
          src: `/${favicon.filename}`,
          sizes: `${favicon.size.width}x${favicon.size.height}`,
          type: "image/png",
        };

        // Add purpose for Android icons
        if (favicon.filename.includes("android")) {
          icon.purpose = "any maskable";
        }

        return icon;
      });

    const manifest = {
      name: "Your App Name",
      short_name: "App",
      description: "Your Progressive Web App description",
      start_url: "/",
      display: "standalone",
      orientation: "portrait-primary",
      background_color: "#ffffff",
      theme_color: "#000000",
      categories: ["productivity", "utilities"],
      lang: "en",
      dir: "ltr",
      icons,
      screenshots: [],
      shortcuts: [],
    };

    return JSON.stringify(manifest, null, 2);
  }

  /**
   * Create ZIP package with all favicons
   */
  static async createZipPackage(
    favicons: GeneratedFavicon[],
    manifestJson?: string,
  ): Promise<Blob> {
    const zip = new JSZip();

    // Add all favicon files to the ZIP
    for (const favicon of favicons) {
      zip.file(favicon.filename, favicon.blob);
    }

    // Add manifest.json if provided
    if (manifestJson) {
      zip.file("manifest.json", manifestJson);
    }

    // Add an HTML file with usage instructions
    const htmlInstructions = this.generateUsageInstructions(
      favicons,
      !!manifestJson,
    );
    zip.file("README.html", htmlInstructions);

    // Add a simple text file with HTML snippets
    const htmlSnippets = this.generateHTMLSnippets(favicons, !!manifestJson);
    zip.file("html-snippets.txt", htmlSnippets);

    // Generate ZIP blob
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });

    return zipBlob;
  }

  /**
   * Generate HTML snippets for easy copy-paste
   */
  private static generateHTMLSnippets(
    favicons: GeneratedFavicon[],
    hasManifest: boolean,
  ): string {
    const icoFavicon = favicons.find((f) => f.filename === "favicon.ico");
    const pngFavicons = favicons.filter(
      (f) =>
        f.size.format === "png" &&
        !f.filename.includes("apple-touch") &&
        !f.filename.includes("android"),
    );
    const appleFavicons = favicons.filter((f) =>
      f.filename.includes("apple-touch"),
    );

    let snippets = `<!-- Favicon HTML Snippets -->\n\n`;

    // Standard favicon.ico
    if (icoFavicon) {
      snippets += `<!-- Standard favicon (place in root directory) -->\n`;
      snippets += `<link rel="icon" href="/favicon.ico" sizes="any">\n\n`;
    }

    // PNG favicons
    if (pngFavicons.length > 0) {
      snippets += `<!-- PNG favicons for modern browsers -->\n`;
      for (const favicon of pngFavicons) {
        snippets += `<link rel="icon" type="image/png" sizes="${favicon.size.width}x${favicon.size.height}" href="/${favicon.filename}">\n`;
      }
      snippets += "\n";
    }

    // Apple touch icons
    if (appleFavicons.length > 0) {
      snippets += `<!-- Apple touch icons -->\n`;
      for (const favicon of appleFavicons) {
        snippets += `<link rel="apple-touch-icon" sizes="${favicon.size.width}x${favicon.size.height}" href="/${favicon.filename}">\n`;
      }
      snippets += "\n";
    }

    // Web app manifest
    if (hasManifest) {
      snippets += `<!-- Web App Manifest -->\n`;
      snippets += `<link rel="manifest" href="/manifest.json">\n\n`;
    }

    snippets += `<!-- Complete example for your <head> section -->\n`;
    snippets += `<head>\n`;
    snippets += `    <meta charset="UTF-8">\n`;
    snippets += `    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
    snippets += `    <title>Your Site Title</title>\n\n`;

    if (icoFavicon) {
      snippets += `    <link rel="icon" href="/favicon.ico" sizes="any">\n`;
    }

    for (const favicon of pngFavicons.slice(0, 3)) {
      // Limit to key sizes
      snippets += `    <link rel="icon" type="image/png" sizes="${favicon.size.width}x${favicon.size.height}" href="/${favicon.filename}">\n`;
    }

    for (const favicon of appleFavicons) {
      snippets += `    <link rel="apple-touch-icon" sizes="${favicon.size.width}x${favicon.size.height}" href="/${favicon.filename}">\n`;
    }

    if (hasManifest) {
      snippets += `    <link rel="manifest" href="/manifest.json">\n`;
    }

    snippets += `</head>`;

    return snippets;
  }

  /**
   * Generate HTML usage instructions for favicon package
   */
  private static generateUsageInstructions(
    favicons: GeneratedFavicon[],
    hasManifest: boolean,
  ): string {
    const timestamp = new Date().toISOString().split("T")[0];

    const icoLinks = favicons
      .filter((favicon) => favicon.filename === "favicon.ico")
      .map(
        (_favicon) => `    <link rel="icon" href="/favicon.ico" sizes="any">`,
      )
      .join("\n");

    const faviconLinks = favicons
      .filter(
        (favicon) =>
          favicon.size.format === "png" &&
          !favicon.filename.includes("apple-touch") &&
          !favicon.filename.includes("android"),
      )
      .map(
        (favicon) =>
          `    <link rel="icon" type="image/png" sizes="${favicon.size.width}x${favicon.size.height}" href="/${favicon.filename}">`,
      )
      .join("\n");

    const appleLinks = favicons
      .filter((favicon) => favicon.filename.includes("apple-touch"))
      .map(
        (favicon) =>
          `    <link rel="apple-touch-icon" sizes="${favicon.size.width}x${favicon.size.height}" href="/${favicon.filename}">`,
      )
      .join("\n");

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Favicon Installation Instructions</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: 'Courier New', monospace; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; font-family: 'Courier New', monospace; }
        .file-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 20px 0; }
        .file-item { padding: 10px; border: 1px solid #ddd; border-radius: 5px; text-align: center; }
        .highlight { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .step { margin: 20px 0; padding: 15px; border-left: 4px solid #007bff; background: #f8f9fa; }
    </style>
</head>
<body>
    <h1>🎨 Favicon Package - Generated ${timestamp}</h1>
    
    <div class="highlight">
        <strong>📦 Complete Favicon Package</strong><br>
        This package contains all the favicon files you need for comprehensive browser and device support.
    </div>
    
    <h2>📋 Quick Installation</h2>
    <div class="step">
        <h3>Step 1: Upload Files</h3>
        <p>Upload all favicon files to your website's root directory (where your index.html is located).</p>
    </div>
    
    <div class="step">
        <h3>Step 2: Add HTML Tags</h3>
        <p>Add the following HTML tags to the <code>&lt;head&gt;</code> section of your website:</p>
        <pre><code>${icoLinks}${faviconLinks ? "\n" + faviconLinks : ""}${appleLinks ? "\n" + appleLinks : ""}${hasManifest ? '\n    <link rel="manifest" href="/manifest.json">' : ""}</code></pre>
    </div>
    
    <h2>📁 Files Included</h2>
    <div class="file-list">
                ${favicons
        .map((favicon) => {
          let description = `${favicon.size.width}×${favicon.size.height} ${favicon.size.format.toUpperCase()}`;
          if (favicon.filename === "favicon.ico") {
            description += " (Multi-size)";
          } else if (favicon.filename.includes("apple-touch")) {
            description += " (Apple)";
          } else if (favicon.filename.includes("android")) {
            description += " (Android/PWA)";
          }

          return `<div class="file-item">
                <strong>${favicon.filename}</strong><br>
                <small>${description}</small>
            </div>`;
        })
        .join("")}
        ${hasManifest ? '<div class="file-item"><strong>manifest.json</strong><br><small>Web App Manifest</small></div>' : ""}
        <div class="file-item"><strong>html-snippets.txt</strong><br><small>Copy-paste HTML code</small></div>
    </div>
    
    <h2>🎯 Browser Support</h2>
    <ul>
        <li><strong>favicon.ico</strong> - Universal support (IE, legacy browsers)</li>
        <li><strong>PNG favicons</strong> - Modern browsers with size-specific support</li>
        <li><strong>Apple touch icons</strong> - iOS Safari, mobile bookmarks</li>
        <li><strong>Android icons</strong> - Android Chrome, PWA support</li>
        ${hasManifest ? "<li><strong>Web App Manifest</strong> - Progressive Web App features</li>" : ""}
    </ul>
    
    <h2>✅ Testing Your Favicons</h2>
    <div class="step">
        <ol>
            <li>Clear your browser cache and cookies</li>
            <li>Visit your website and check the browser tab</li>
            <li>Test on mobile devices and different browsers</li>
            <li>Check bookmarks and home screen icons</li>
            ${hasManifest ? "<li>Test PWA installation capabilities</li>" : ""}
        </ol>
    </div>
    
    <h2>🔧 Troubleshooting</h2>
    <ul>
        <li>Ensure files are uploaded to the correct directory</li>
        <li>Check file permissions (files should be publicly accessible)</li>
        <li>Verify HTML tags are in the <code>&lt;head&gt;</code> section</li>
        <li>Clear browser cache to see changes</li>
        <li>Use browser developer tools to check for 404 errors</li>
    </ul>
    
          <p><em>Generated with ❤️ by tool-chest Favicon Generator</em></p>
</body>
</html>`;
  }

  /**
   * Download a single favicon
   */
  static downloadFavicon(favicon: GeneratedFavicon): void {
    const link = document.createElement("a");
    link.href = favicon.dataUrl;
    link.download = favicon.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Download all favicons as ZIP
   */
  static async downloadAllFavicons(
    favicons: GeneratedFavicon[],
    manifestJson?: string,
  ): Promise<void> {
    const zipBlob = await this.createZipPackage(favicons, manifestJson);
    const timestamp = Date.now();
    const filename = `tool-chest_favicons_${timestamp}.zip`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
  }

  /**
   * Copy favicon data URL to clipboard
   */
  static async copyToClipboard(favicon: GeneratedFavicon): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(favicon.dataUrl);
      return true;
    } catch (error) {
      console.warn("Failed to copy to clipboard:", error);
      return false;
    }
  }

  /**
   * Estimate remaining processing time
   */
  private static estimateTimeRemaining(
    completed: number,
    total: number,
    startTime: number,
  ): number | undefined {
    if (completed === 0) return undefined;

    const elapsed = Date.now() - startTime;
    const avgTimePerItem = elapsed / completed;
    const remaining = total - completed;

    return Math.round(avgTimePerItem * remaining);
  }

  /**
   * Track usage analytics (privacy-compliant)
   */
  static async trackUsage(data: FaviconUsageData): Promise<void> {
    try {
      // Only track anonymized usage data
      const payload = {
        fileSize: data.inputFileSize,
        generatedSizes: data.sizesGenerated,
        backgroundColor: data.options.backgroundColor || "transparent",
        padding: data.options.padding || 0,
        format: "png", // Default format for tracking
        processingTime: data.processingTime,
        batchSize: 1,
        successfulSizes: data.success ? data.outputCount : 0,
        warnings: [], // Will be populated based on data
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      };

      // Send to analytics endpoint
      await fetch("/api/tools/favicon-generator/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.warn("Failed to track usage:", error);
    }
  }

  /**
   * Generate favicons using server-side API (fallback for large files)
   */
  static async generateFaviconsOnServer(
    file: File,
    options: FaviconGenerationOptions = DEFAULT_FAVICON_OPTIONS,
  ): Promise<Blob> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "backgroundColor",
        options.backgroundColor || "transparent",
      );
      formData.append("padding", (options.padding || 0).toString());
      formData.append("format", options.outputFormat || "png");
      formData.append("quality", (options.quality || 0.9).toString());
      formData.append("sizes", JSON.stringify(options.sizes));
      formData.append(
        "generateICO",
        (options.generateICO !== false).toString(),
      );
      formData.append(
        "includeManifest",
        (options.generateManifest !== false).toString(),
      );

      const response = await fetch("/api/tools/favicon-generator/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      // Return the ZIP blob directly
      return await response.blob();
    } catch (error) {
      console.error("Server-side generation failed:", error);
      throw error;
    }
  }

  /**
   * Download individual favicon using server-side API
   */
  static async downloadFaviconViaAPI(favicon: GeneratedFavicon): Promise<void> {
    try {
      const payload = {
        faviconData: favicon.dataUrl,
        fileName: favicon.filename,
        format: favicon.size.format,
      };

      const response = await fetch("/api/tools/favicon-generator/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      // Get the blob and trigger download
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = favicon.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("API download failed, falling back to client-side:", error);
      // Fallback to client-side download
      this.downloadFavicon(favicon);
    }
  }

  /**
   * Check if server-side processing should be used
   */
  static shouldUseServerSideProcessing(
    file: File,
    options: FaviconGenerationOptions,
  ): boolean {
    // Use server-side for large files or complex operations
    const isLargeFile = file.size > FAVICON_FILE_LIMITS.largeFileThreshold;
    const hasComplexOptions = options.batchProcessing?.enabled;
    const isSVG = file.type === "image/svg+xml";

    return isLargeFile || hasComplexOptions || isSVG;
  }

  /**
   * Enhanced usage tracking with performance metrics
   */
  static async trackUsageEnhanced(data: {
    fileSize: number;
    fileSizes?: number[];
    generatedSizes: number[];
    backgroundColor: string;
    padding: number;
    format: "png" | "webp" | "jpeg";
    processingTime: number;
    batchSize?: number;
    compressionStats?: CompressionStats;
    performanceMetrics?: PerformanceMetrics;
    successfulSizes: number;
    warnings?: string[];
    serverSideUsed?: boolean;
  }): Promise<void> {
    try {
      const payload = {
        ...data,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      };

      await fetch("/api/tools/favicon-generator/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.warn("Enhanced usage tracking failed:", error);
    }
  }
}
