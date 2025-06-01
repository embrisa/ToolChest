/**
 * Base64 operation mode
 */
export type Base64Mode = "encode" | "decode";

/**
 * Base64 encoding variant
 */
export type Base64Variant = "standard" | "url-safe";

/**
 * Base64 input type
 */
export type Base64InputType = "text" | "file";

/**
 * Progress tracking for large file operations
 */
export interface Base64Progress {
  stage: "reading" | "processing" | "complete";
  progress: number; // 0-100
  bytesProcessed: number;
  totalBytes: number;
  estimatedTimeRemaining?: number; // in seconds
}

/**
 * Enhanced Base64 operation result
 */
export interface Base64Result {
  success: boolean;
  data?: string;
  error?: string;
  filename?: string;
  originalSize?: number;
  outputSize?: number;
  mimeType?: string;
  processingTime?: number; // in milliseconds
  warnings?: string[];
  serverSide?: boolean; // Whether operation was performed server-side
}

/**
 * Base64 operation options
 */
export interface Base64Options {
  mode: Base64Mode;
  variant: Base64Variant;
  inputType: Base64InputType;
  input: string | File;
  filename?: string;
  onProgress?: (progress: Base64Progress) => void;
}

/**
 * Enhanced Base64 processing state
 */
export interface Base64State {
  mode: Base64Mode;
  variant: Base64Variant;
  inputType: Base64InputType;
  textInput: string;
  fileInput: File | null;
  result: Base64Result | null;
  isProcessing: boolean;
  progress: Base64Progress | null;
  error: string | null;
  warnings: string[];
  validationErrors: ValidationError[];
}

/**
 * Validation error with accessibility support
 */
export interface ValidationError {
  field: string;
  message: string;
  type: "error" | "warning" | "info";
  code: string;
}

/**
 * Enhanced file validation result
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
  isLargeFile?: boolean; // >5MB
  mimeType?: string;
  fileType?: string;
  validationErrors?: ValidationError[];
}

/**
 * MIME type validation configuration
 */
export interface MimeTypeConfig {
  allowedTypes: string[];
  maxSize: number;
  textTypes: string[];
  binaryTypes: string[];
}

/**
 * Download options for Base64 results
 */
export interface Base64DownloadOptions {
  content: string;
  filename: string;
  contentType: string;
  mimeType?: string;
}

/**
 * Clipboard operation result with accessibility
 */
export interface ClipboardResult {
  success: boolean;
  method: "modern" | "fallback" | "failed";
  message: string;
  announceToScreenReader?: string;
}

/**
 * Base64 usage statistics
 */
export interface Base64UsageStats {
  totalOperations: number;
  encodeOperations: number;
  decodeOperations: number;
  fileOperations: number;
  textOperations: number;
  lastUsed: Date;
}

/**
 * Accessibility announcement types
 */
export type A11yAnnouncementType = "polite" | "assertive";

/**
 * Accessibility announcement
 */
export interface A11yAnnouncement {
  message: string;
  type: A11yAnnouncementType;
  timestamp: number;
}
