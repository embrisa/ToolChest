import {
  Base64Options,
  Base64Result,
  FileValidationResult,
  Base64DownloadOptions,
  Base64Progress,
  ValidationError,
  MimeTypeConfig,
  ClipboardResult,
} from "@/types/tools/base64";

/**
 * Enhanced Base64 Service for client-side encoding/decoding operations
 * Handles text and file processing with privacy-first approach, progress tracking,
 * and comprehensive accessibility features
 */
export class Base64Service {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5MB
  private static readonly CHUNK_SIZE = 64 * 1024; // 64KB chunks for progress tracking

  /**
   * MIME type configuration for file validation
   */
  private static readonly MIME_CONFIG: MimeTypeConfig = {
    allowedTypes: [
      // Text files
      "text/plain",
      "text/csv",
      "text/html",
      "text/css",
      "text/javascript",
      "application/json",
      "application/xml",
      "text/xml",
      // Images
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
      "image/tiff",
      // Documents
      "application/pdf",
      "application/msword",
      "application/rtf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      // Archives
      "application/zip",
      "application/x-tar",
      "application/gzip",
      // Audio/Video
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      // Other
      "application/octet-stream",
    ],
    maxSize: 10 * 1024 * 1024,
    textTypes: [
      "text/plain",
      "text/csv",
      "text/html",
      "text/css",
      "text/javascript",
      "application/json",
      "application/xml",
      "text/xml",
    ],
    binaryTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "application/pdf",
      "application/zip",
      "audio/mpeg",
      "video/mp4",
    ],
  };

  /**
   * Encode text or file to Base64 with progress tracking
   */
  public static async encode(options: Base64Options): Promise<Base64Result> {
    const startTime = Date.now();

    try {
      if (options.inputType === "text") {
        return this.encodeText(
          options.input as string,
          options.variant,
          startTime,
        );
      } else {
        return await this.encodeFile(
          options.input as File,
          options.variant,
          options.onProgress,
          startTime,
        );
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Encoding failed",
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Decode Base64 to text or file with progress tracking
   */
  public static async decode(options: Base64Options): Promise<Base64Result> {
    const startTime = Date.now();

    try {
      if (options.inputType === "text") {
        return this.decodeText(
          options.input as string,
          options.variant,
          startTime,
        );
      } else {
        return await this.decodeFile(
          options.input as File,
          options.variant,
          options.onProgress,
          startTime,
        );
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Decoding failed",
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Enhanced text encoding with validation
   */
  private static encodeText(
    text: string,
    variant: "standard" | "url-safe",
    startTime: number,
  ): Base64Result {
    if (!text) {
      return {
        success: false,
        error: "No text provided for encoding",
        processingTime: Date.now() - startTime,
      };
    }

    const warnings: string[] = [];

    // Check for potentially problematic characters
    if (text.length > 1000000) {
      // 1MB of text
      warnings.push("Large text input may take longer to process");
    }

    if (/[\u0080-\uFFFF]/.test(text)) {
      warnings.push(
        "Text contains non-ASCII characters which will be UTF-8 encoded",
      );
    }

    try {
      // Convert text to UTF-8 bytes then to Base64
      const encoder = new TextEncoder();
      const bytes = encoder.encode(text);
      let base64 = this.bytesToBase64(bytes);

      // Apply URL-safe variant if requested
      if (variant === "url-safe") {
        base64 = base64
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=/g, "");
      }

      return {
        success: true,
        data: base64,
        originalSize: text.length,
        outputSize: base64.length,
        processingTime: Date.now() - startTime,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch {
      return {
        success: false,
        error: "Failed to encode text",
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Enhanced text decoding with validation
   */
  private static decodeText(
    base64: string,
    variant: "standard" | "url-safe",
    startTime: number,
  ): Base64Result {
    if (!base64) {
      return {
        success: false,
        error: "No Base64 data provided for decoding",
        processingTime: Date.now() - startTime,
      };
    }

    const warnings: string[] = [];

    try {
      let cleanBase64 = base64.trim();

      // Remove whitespace and newlines
      cleanBase64 = cleanBase64.replace(/\s/g, "");

      // Handle URL-safe variant
      if (variant === "url-safe") {
        cleanBase64 = cleanBase64.replace(/-/g, "+").replace(/_/g, "/");
        // Add padding if needed
        while (cleanBase64.length % 4) {
          cleanBase64 += "=";
        }
      }

      // Enhanced Base64 format validation
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
        return {
          success: false,
          error:
            "Invalid Base64 format. Please check your input for invalid characters.",
          processingTime: Date.now() - startTime,
        };
      }

      // Check for potentially truncated data
      if (cleanBase64.length % 4 !== 0 && variant !== "url-safe") {
        warnings.push("Base64 data may be incomplete or truncated");
      }

      // Decode Base64 to bytes then to text
      const bytes = this.base64ToBytes(cleanBase64);
      const decoder = new TextDecoder("utf-8", { fatal: false });
      const text = decoder.decode(bytes);

      // Check if the decoded data appears to be text
      if (!this.isValidDecodedText(text)) {
        warnings.push(
          "Decoded data may contain binary content or invalid UTF-8 sequences",
        );
      }

      return {
        success: true,
        data: text,
        originalSize: base64.length,
        outputSize: text.length,
        processingTime: Date.now() - startTime,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch {
      return {
        success: false,
        error:
          "Failed to decode Base64. The data may be corrupted or not valid Base64.",
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Enhanced file encoding with progress tracking
   */
  private static async encodeFile(
    file: File,
    variant: "standard" | "url-safe",
    onProgress?: (progress: Base64Progress) => void,
    startTime: number = Date.now(),
  ): Promise<Base64Result> {
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        processingTime: Date.now() - startTime,
        warnings: validation.warnings,
      };
    }

    try {
      // Report initial progress
      onProgress?.({
        stage: "reading",
        progress: 0,
        bytesProcessed: 0,
        totalBytes: file.size,
      });

      let arrayBuffer: ArrayBuffer;

      // Use chunked reading for large files
      if (file.size > this.LARGE_FILE_THRESHOLD) {
        arrayBuffer = await this.readFileWithProgress(file, onProgress);
      } else {
        arrayBuffer = await file.arrayBuffer();
      }

      // Report processing stage
      onProgress?.({
        stage: "processing",
        progress: 50,
        bytesProcessed: file.size,
        totalBytes: file.size,
      });

      const bytes = new Uint8Array(arrayBuffer);
      let base64 = this.bytesToBase64(bytes);

      // Apply URL-safe variant if requested
      if (variant === "url-safe") {
        base64 = base64
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=/g, "");
      }

      // Report completion
      onProgress?.({
        stage: "complete",
        progress: 100,
        bytesProcessed: file.size,
        totalBytes: file.size,
      });

      return {
        success: true,
        data: base64,
        filename: file.name,
        originalSize: file.size,
        outputSize: base64.length,
        mimeType: file.type || "application/octet-stream",
        processingTime: Date.now() - startTime,
        warnings: validation.warnings,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read or encode file: ${error instanceof Error ? error.message : "Unknown error"}`,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Enhanced file decoding with progress tracking
   */
  private static async decodeFile(
    file: File,
    variant: "standard" | "url-safe",
    onProgress?: (progress: Base64Progress) => void,
    startTime: number = Date.now(),
  ): Promise<Base64Result> {
    try {
      onProgress?.({
        stage: "reading",
        progress: 0,
        bytesProcessed: 0,
        totalBytes: file.size,
      });

      const text = await file.text();

      onProgress?.({
        stage: "processing",
        progress: 50,
        bytesProcessed: file.size,
        totalBytes: file.size,
      });

      const result = this.decodeText(text, variant, startTime);

      onProgress?.({
        stage: "complete",
        progress: 100,
        bytesProcessed: file.size,
        totalBytes: file.size,
      });

      if (result.success && result.data) {
        return {
          ...result,
          filename: file.name,
          originalSize: file.size,
          mimeType: file.type || "text/plain",
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: `Failed to read file: ${error instanceof Error ? error.message : "Unknown error"}`,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Enhanced file validation with MIME type checking
   */
  public static validateFile(file: File): FileValidationResult {
    const validationErrors: ValidationError[] = [];
    const warnings: string[] = [];

    if (!file) {
      return {
        isValid: false,
        error: "No file selected",
        validationErrors: [
          {
            field: "file",
            message: "Please select a file",
            type: "error",
            code: "FILE_REQUIRED",
          },
        ],
      };
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size (${this.formatBytes(file.size)}) exceeds maximum limit of ${this.formatBytes(this.MAX_FILE_SIZE)}`,
        validationErrors: [
          {
            field: "file",
            message: `File too large. Maximum size is ${this.formatBytes(this.MAX_FILE_SIZE)}`,
            type: "error",
            code: "FILE_TOO_LARGE",
          },
        ],
      };
    }

    // Check if file is empty
    if (file.size === 0) {
      return {
        isValid: false,
        error: "File is empty",
        validationErrors: [
          {
            field: "file",
            message: "Please select a file with content",
            type: "error",
            code: "FILE_EMPTY",
          },
        ],
      };
    }

    // Validate MIME type
    const mimeType = file.type || "application/octet-stream";
    const isAllowedType =
      this.MIME_CONFIG.allowedTypes.includes(mimeType) ||
      mimeType === "" || // Allow files without MIME type
      mimeType === "application/octet-stream";

    if (!isAllowedType) {
      warnings.push(`File type '${mimeType}' may not be supported`);
    }

    // Check for large files
    const isLargeFile = file.size > this.LARGE_FILE_THRESHOLD;
    if (isLargeFile) {
      warnings.push(
        `Large file (${this.formatBytes(file.size)}) - processing may take longer`,
      );
    }

    // Detect file type from extension if MIME type is missing
    const fileType = this.detectFileType(file.name, mimeType);

    return {
      isValid: true,
      isLargeFile,
      mimeType,
      fileType,
      warnings: warnings.length > 0 ? warnings : undefined,
      validationErrors:
        validationErrors.length > 0 ? validationErrors : undefined,
    };
  }

  /**
   * Enhanced clipboard functionality with accessibility
   */
  public static async copyToClipboard(text: string): Promise<ClipboardResult> {
    try {
      await navigator.clipboard.writeText(text);
      return {
        success: true,
        method: "modern",
        message: "Content copied to clipboard",
        announceToScreenReader:
          "Content has been copied to clipboard successfully",
      };
    } catch {
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.setAttribute("aria-hidden", "true");
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (result) {
          return {
            success: true,
            method: "fallback",
            message: "Content copied to clipboard",
            announceToScreenReader:
              "Content has been copied to clipboard using fallback method",
          };
        } else {
          throw new Error("Copy command failed");
        }
      } catch {
        return {
          success: false,
          method: "failed",
          message: "Failed to copy to clipboard. Please copy manually.",
          announceToScreenReader:
            "Copy to clipboard failed. Please select and copy the content manually.",
        };
      }
    }
  }

  /**
   * Read file with progress tracking for large files
   */
  private static async readFileWithProgress(
    file: File,
    onProgress?: (progress: Base64Progress) => void,
  ): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const startTime = Date.now();

      reader.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          const elapsed = Date.now() - startTime;
          const rate = event.loaded / elapsed; // bytes per ms
          const remaining = event.total - event.loaded;
          const estimatedTimeRemaining = remaining / rate / 1000; // seconds

          onProgress({
            stage: "reading",
            progress: Math.round(progress * 0.5), // Reading is 50% of total progress
            bytesProcessed: event.loaded,
            totalBytes: event.total,
            estimatedTimeRemaining: Math.round(estimatedTimeRemaining),
          });
        }
      };

      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file as ArrayBuffer"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Detect file type from filename and MIME type
   */
  private static detectFileType(filename: string, mimeType: string): string {
    const extension = filename.toLowerCase().split(".").pop();

    if (this.MIME_CONFIG.textTypes.includes(mimeType)) {
      return "text";
    }

    if (this.MIME_CONFIG.binaryTypes.includes(mimeType)) {
      return "binary";
    }

    // Fallback to extension-based detection
    const textExtensions = [
      "txt",
      "csv",
      "json",
      "xml",
      "html",
      "css",
      "js",
      "md",
    ];
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];

    if (extension && textExtensions.includes(extension)) {
      return "text";
    }

    if (extension && imageExtensions.includes(extension)) {
      return "image";
    }

    return "unknown";
  }

  /**
   * Enhanced validation for decoded text
   */
  private static isValidDecodedText(data: string): boolean {
    try {
      // Check for null bytes (common in binary data)
      if (data.includes("\0")) {
        return false;
      }

      // Check for valid UTF-8 sequences and printable characters
      const printableRegex = /^[\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]*$/;
      return printableRegex.test(data);
    } catch {
      return false;
    }
  }

  /**
   * Generate download for Base64 result
   */
  public static generateDownload(options: Base64DownloadOptions): void {
    try {
      const blob = new Blob([options.content], { type: options.contentType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = options.filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);
    } catch {
      throw new Error("Failed to generate download");
    }
  }

  /**
   * Generate standardized filename for Base64 downloads
   */
  public static generateFilename(
    mode: "encode" | "decode",
    originalFilename?: string,
  ): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);

    if (mode === "encode") {
      const baseName = originalFilename
        ? originalFilename.replace(/\.[^/.]+$/, "")
        : "encoded";
      return `tool-chest_base64_${baseName}_${timestamp}.txt`;
    } else {
      const baseName = originalFilename
        ? originalFilename.replace(/\.[^/.]+$/, "")
        : "decoded";
      return `tool-chest_base64_${baseName}_${timestamp}.txt`;
    }
  }

  /**
   * Convert bytes to Base64 string
   */
  private static bytesToBase64(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 string to bytes
   */
  private static base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Format bytes for display
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Server-side encoding fallback for large files
   */
  public static async encodeOnServer(
    input: string | File,
    variant: "standard" | "url-safe" = "standard",
  ): Promise<Base64Result> {
    const startTime = Date.now();

    try {
      if (typeof input === "string") {
        // Text encoding
        const response = await fetch("/api/tools/base64/encode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: input,
            variant,
          }),
        });

        const result = await response.json();
        return {
          ...result,
          processingTime: Date.now() - startTime,
          serverSide: true,
        };
      } else {
        // File encoding
        const formData = new FormData();
        formData.append("file", input);
        formData.append("variant", variant);

        const response = await fetch("/api/tools/base64/encode", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        return {
          ...result,
          processingTime: Date.now() - startTime,
          serverSide: true,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Server encoding failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Server-side decoding fallback for large files
   */
  public static async decodeOnServer(
    input: string | File,
    variant: "standard" | "url-safe" = "standard",
    outputType: "text" | "file" = "text",
  ): Promise<Base64Result> {
    const startTime = Date.now();

    try {
      if (typeof input === "string") {
        // Text decoding
        const response = await fetch("/api/tools/base64/decode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: input,
            variant,
            outputType,
          }),
        });

        const result = await response.json();
        return {
          ...result,
          processingTime: Date.now() - startTime,
          serverSide: true,
        };
      } else {
        // File decoding
        const formData = new FormData();
        formData.append("file", input);
        formData.append("variant", variant);

        const response = await fetch("/api/tools/base64/decode", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        return {
          ...result,
          processingTime: Date.now() - startTime,
          serverSide: true,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Server decoding failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Track usage analytics (privacy-compliant)
   */
  public static async trackUsage(usageData: {
    operation: "encode" | "decode";
    inputType: "text" | "file";
    variant?: "standard" | "url-safe";
    inputSize: number;
    outputSize: number;
    processingTime: number;
    success: boolean;
    clientSide?: boolean;
    error?: string;
  }): Promise<void> {
    try {
      await fetch("/api/tools/base64/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...usageData,
          clientSide: usageData.clientSide ?? true,
        }),
      });
    } catch (error) {
      // Silently fail usage tracking - don't interrupt user experience
      console.warn("Usage tracking failed:", error);
    }
  }
}
