// Favicon Generator TypeScript Types

/**
 * Supported input image formats for favicon generation
 */
export const SUPPORTED_IMAGE_FORMATS = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/svg+xml',
    'image/webp',
    'image/gif'
] as const;

/**
 * Standard favicon sizes for various platforms and use cases
 */
export const FAVICON_SIZES = {
    // Browser favicons
    ico16: { width: 16, height: 16, format: 'ico', name: 'favicon-16x16' },
    ico32: { width: 32, height: 32, format: 'ico', name: 'favicon-32x32' },

    // PNG favicons
    png16: { width: 16, height: 16, format: 'png', name: 'favicon-16x16' },
    png32: { width: 32, height: 32, format: 'png', name: 'favicon-32x32' },
    png48: { width: 48, height: 48, format: 'png', name: 'favicon-48x48' },
    png64: { width: 64, height: 64, format: 'png', name: 'favicon-64x64' },
    png96: { width: 96, height: 96, format: 'png', name: 'favicon-96x96' },
    png128: { width: 128, height: 128, format: 'png', name: 'favicon-128x128' },

    // Apple touch icons
    appleTouch180: { width: 180, height: 180, format: 'png', name: 'apple-touch-icon' },

    // Android/PWA icons
    android192: { width: 192, height: 192, format: 'png', name: 'android-chrome-192x192' },
    android512: { width: 512, height: 512, format: 'png', name: 'android-chrome-512x512' }
} as const;

export type FaviconSizeKey = keyof typeof FAVICON_SIZES;
export type FaviconFormat = 'ico' | 'png';
export type SupportedImageFormat = typeof SUPPORTED_IMAGE_FORMATS[number];

/**
 * Favicon size configuration
 */
export interface FaviconSize {
    width: number;
    height: number;
    format: FaviconFormat;
    name: string;
}

/**
 * Generation options for favicon processing
 */
export interface FaviconGenerationOptions {
    backgroundColor?: string;
    customBackgroundColor?: string;
    padding?: number;
    quality?: number;
    outputFormat?: 'png' | 'webp' | 'jpeg';
    compressionLevel?: number;
    sizes: FaviconSizeKey[];
    generateManifest?: boolean;
    generateICO?: boolean;
    previewContext?: 'browser' | 'bookmark' | 'desktop' | 'all';
    compressionOptions?: ImageCompressionOptions;
    batchProcessing?: BatchProcessingConfig;
    largeFileHandling?: LargeFileProcessingConfig;
    enablePerformanceTracking?: boolean;
}

/**
 * Enhanced preview context options
 */
export interface FaviconPreviewContext {
    id: string;
    name: string;
    description: string;
    backgroundColor: string;
    showInBrowser?: boolean;
    showInBookmark?: boolean;
    showOnDesktop?: boolean;
}

/**
 * File validation result for uploaded images
 */
export interface FaviconFileValidation {
    isValid: boolean;
    error?: string;
    warnings?: string[];
    fileInfo?: {
        name: string;
        size: number;
        type: string;
        dimensions?: {
            width: number;
            height: number;
        };
    };
}

/**
 * Generated favicon file data
 */
export interface GeneratedFavicon {
    size: FaviconSize;
    blob: Blob;
    dataUrl: string;
    filename: string;
}

/**
 * Favicon generation result
 */
export interface FaviconGenerationResult {
    success: boolean;
    error?: string;
    warnings?: string[];
    favicons?: GeneratedFavicon[];
    manifestJson?: string;
    zipBlob?: Blob;
    processingTime?: number;
    compressionStats?: CompressionStats;
    batchResults?: BatchProcessingResult[];
}

/**
 * Compression statistics for generated favicons
 */
export interface CompressionStats {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    bytesSaved: number;
    compressionTime: number;
}

/**
 * Batch processing configuration
 */
export interface BatchProcessingConfig {
    enabled: boolean;
    maxConcurrent: number;
    chunkSize: number;
    progressCallback?: (progress: BatchProgress) => void;
}

/**
 * Batch processing result for multiple images
 */
export interface BatchProcessingResult {
    sourceFile: File;
    success: boolean;
    result?: FaviconGenerationResult;
    error?: string;
    processingTime: number;
}

/**
 * Batch progress tracking
 */
export interface BatchProgress {
    currentFile: string;
    filesCompleted: number;
    totalFiles: number;
    percentage: number;
    estimatedTimeRemaining?: number;
    currentFileProgress?: FaviconProgress;
}

/**
 * Large file processing configuration
 */
export interface LargeFileProcessingConfig {
    chunkSize: number;
    maxMemoryUsage: number;
    useWebWorker: boolean;
    enableProgressTracking: boolean;
    fallbackToServer: boolean;
}

/**
 * Performance monitoring data
 */
export interface PerformanceMetrics {
    imageLoadTime: number;
    canvasProcessingTime: number;
    compressionTime: number;
    totalProcessingTime: number;
    memoryUsage?: number;
    cpuUsage?: number;
}

/**
 * Image compression options
 */
export interface ImageCompressionOptions {
    enabled: boolean;
    quality: number; // 0.1 to 1.0
    format: 'png' | 'webp' | 'jpeg';
    maxFileSize?: number; // in bytes
    preserveTransparency: boolean;
    algorithm: 'default' | 'aggressive' | 'lossless';
}

/**
 * Progress tracking for favicon generation
 */
export interface FaviconProgress {
    currentStep: string;
    completed: number;
    total: number;
    percentage: number;
    currentSize?: FaviconSize;
    estimatedTimeRemaining?: number;
}

/**
 * Favicon generator component state
 */
export interface FaviconGeneratorState {
    // Input configuration
    sourceImage: File | null;
    sourceImages: File[]; // For batch processing
    options: FaviconGenerationOptions;

    // Processing state
    isProcessing: boolean;
    isBatchProcessing: boolean;
    progress: FaviconProgress | null;
    batchProgress: BatchProgress | null;

    // Results and feedback
    result: FaviconGenerationResult | null;
    batchResults: BatchProcessingResult[];
    error: string | null;
    warnings: string[];
    validationErrors: string[];

    // Preview state
    previewUrls: { [key in FaviconSizeKey]?: string };
    showPreview: boolean;

    // Performance tracking
    performanceMetrics?: PerformanceMetrics;
}

/**
 * Canvas processing context for favicon generation
 */
export interface FaviconCanvasContext {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    sourceImage: HTMLImageElement;
    sourceWidth: number;
    sourceHeight: number;
}

/**
 * Drag and drop event data
 */
export interface FaviconDragEvent {
    files: FileList;
    dataTransfer: DataTransfer;
}

/**
 * Accessibility announcement for favicon generation
 */
export interface FaviconA11yAnnouncement {
    message: string;
    type: 'polite' | 'assertive';
    timestamp: number;
}

/**
 * Preview context configurations
 */
export const PREVIEW_CONTEXTS: { [key: string]: FaviconPreviewContext } = {
    browser: {
        id: 'browser',
        name: 'Browser Tab',
        description: 'How favicon appears in browser tabs',
        backgroundColor: '#f5f5f5',
        showInBrowser: true
    },
    bookmark: {
        id: 'bookmark',
        name: 'Bookmark Bar',
        description: 'How favicon appears in bookmarks',
        backgroundColor: '#ffffff',
        showInBookmark: true
    },
    desktop: {
        id: 'desktop',
        name: 'Desktop Icon',
        description: 'How favicon appears as desktop shortcut',
        backgroundColor: '#e5e5e5',
        showOnDesktop: true
    }
};

/**
 * File processing limits and thresholds
 */
export const FAVICON_FILE_LIMITS = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    largeFileThreshold: 5 * 1024 * 1024, // 5MB
    maxBatchFiles: 10,
    minDimensions: 16,
    maxDimensions: 2048,
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    recommendedDimensions: 512
} as const;

/**
 * Performance thresholds for optimization decisions
 */
export const PERFORMANCE_THRESHOLDS = {
    largeFileProcessingTime: 5000, // 5 seconds
    memoryWarningThreshold: 50 * 1024 * 1024, // 50MB
    cpuIntensiveOperationTime: 2000, // 2 seconds
    batchProcessingDelay: 100, // 100ms between batch items
    maxConcurrentOperations: 3
} as const;

/**
 * Default enhanced favicon generation options
 */
export const DEFAULT_FAVICON_OPTIONS: FaviconGenerationOptions = {
    backgroundColor: 'transparent',
    padding: 0,
    quality: 0.9,
    outputFormat: 'png',
    compressionLevel: 6,
    sizes: ['png16', 'png32', 'png48', 'appleTouch180', 'android192', 'android512'] as FaviconSizeKey[],
    generateManifest: true,
    generateICO: true,
    previewContext: 'all',
    compressionOptions: {
        enabled: true,
        quality: 0.85,
        format: 'png',
        preserveTransparency: true,
        algorithm: 'default'
    },
    batchProcessing: {
        enabled: false,
        maxConcurrent: 2,
        chunkSize: 1024 * 1024 // 1MB chunks
    },
    largeFileHandling: {
        chunkSize: 2 * 1024 * 1024, // 2MB chunks
        maxMemoryUsage: 100 * 1024 * 1024, // 100MB
        useWebWorker: false, // Not implemented yet
        enableProgressTracking: true,
        fallbackToServer: false
    },
    enablePerformanceTracking: true
} as const;

/**
 * Usage tracking data for favicon generation
 */
export interface FaviconUsageData {
    operation: 'generate_favicons';
    inputFileSize: number;
    inputFileType: string;
    sourceDimensions: {
        width: number;
        height: number;
    };
    sizesGenerated: FaviconSizeKey[];
    options: FaviconGenerationOptions;
    outputCount: number;
    totalOutputSize: number;
    processingTime: number;
    success: boolean;
    clientSide: boolean;
    error?: string;
} 