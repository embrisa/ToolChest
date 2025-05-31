export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512';

export type HashInputType = 'text' | 'file';

export interface HashProgress {
    percentage: number;
    stage: 'reading' | 'hashing' | 'complete';
    bytesProcessed: number;
    totalBytes: number;
    estimatedTimeRemaining?: number;
    message: string;
}

export interface HashResult {
    success: boolean;
    hash?: string;
    algorithm: HashAlgorithm;
    inputSize: number;
    processingTime: number;
    error?: string;
    warnings?: string[];
    serverSide?: boolean;
}

export interface HashState {
    algorithm: HashAlgorithm;
    inputType: HashInputType;
    textInput: string;
    fileInput: File | null;
    results: Record<HashAlgorithm, HashResult | null>;
    isProcessing: boolean;
    progress: HashProgress | null;
    error: string | null;
    warnings: string[];
    validationErrors: string[];
}

export interface HashValidationResult {
    isValid: boolean;
    error?: string;
    warnings?: string[];
    validationErrors?: string[];
}

export interface HashOperationParams {
    algorithm: HashAlgorithm;
    inputType: HashInputType;
    input: string | File;
    onProgress?: (progress: HashProgress) => void;
}

export interface HashUsageMetrics {
    algorithm: HashAlgorithm;
    inputType: HashInputType;
    inputSize: number;
    processingTime: number;
    success: boolean;
    clientSide: boolean;
    error?: string;
}

export interface A11yAnnouncement {
    message: string;
    priority: 'polite' | 'assertive';
    timestamp: number;
}

export interface ClipboardResult {
    success: boolean;
    message: string;
    timestamp: number;
}

// Constants
export const HASH_ALGORITHMS: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'];

export const ALGORITHM_INFO: Record<HashAlgorithm, {
    name: string;
    description: string;
    outputLength: number;
    secure: boolean;
    webCryptoName?: string;
}> = {
    'MD5': {
        name: 'MD5',
        description: '128-bit hash function. Fast but not cryptographically secure.',
        outputLength: 32,
        secure: false
    },
    'SHA-1': {
        name: 'SHA-1',
        description: '160-bit hash function. Legacy algorithm, use SHA-256+ for security.',
        outputLength: 40,
        secure: false,
        webCryptoName: 'SHA-1'
    },
    'SHA-256': {
        name: 'SHA-256',
        description: '256-bit hash function. Secure and widely used standard.',
        outputLength: 64,
        secure: true,
        webCryptoName: 'SHA-256'
    },
    'SHA-512': {
        name: 'SHA-512',
        description: '512-bit hash function. Maximum security for sensitive data.',
        outputLength: 128,
        secure: true,
        webCryptoName: 'SHA-512'
    }
};

export const FILE_SIZE_LIMITS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    LARGE_FILE_THRESHOLD: 5 * 1024 * 1024, // 5MB
    PROGRESS_THRESHOLD: 1 * 1024 * 1024 // 1MB
} as const;

// Enhanced file type support with categories
export const ALLOWED_FILE_TYPES = {
    TEXT: [
        'text/plain',
        'text/csv',
        'text/html',
        'text/css',
        'text/javascript',
        'text/xml',
        'application/json',
        'application/xml',
        'application/javascript',
        'text/markdown'
    ],
    IMAGES: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'image/bmp',
        'image/tiff'
    ],
    DOCUMENTS: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    ARCHIVES: [
        'application/zip',
        'application/x-rar-compressed',
        'application/x-tar',
        'application/gzip',
        'application/x-7z-compressed'
    ],
    EXECUTABLES: [
        'application/octet-stream',
        'application/x-executable',
        'application/x-msdownload'
    ],
    AUDIO: [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/mp4',
        'audio/aac'
    ],
    VIDEO: [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm'
    ]
} as const;

// All allowed file types (flattened)
export const ALL_ALLOWED_FILE_TYPES = [
    ...ALLOWED_FILE_TYPES.TEXT,
    ...ALLOWED_FILE_TYPES.IMAGES,
    ...ALLOWED_FILE_TYPES.DOCUMENTS,
    ...ALLOWED_FILE_TYPES.ARCHIVES,
    ...ALLOWED_FILE_TYPES.EXECUTABLES,
    ...ALLOWED_FILE_TYPES.AUDIO,
    ...ALLOWED_FILE_TYPES.VIDEO
] as const;

export const FILE_TYPE_CATEGORIES = {
    'text/plain': 'Text',
    'text/csv': 'Text',
    'text/html': 'Text',
    'text/css': 'Text',
    'text/javascript': 'Text',
    'text/xml': 'Text',
    'application/json': 'Text',
    'application/xml': 'Text',
    'application/javascript': 'Text',
    'text/markdown': 'Text',
    'image/jpeg': 'Image',
    'image/jpg': 'Image',
    'image/png': 'Image',
    'image/gif': 'Image',
    'image/webp': 'Image',
    'image/svg+xml': 'Image',
    'image/bmp': 'Image',
    'image/tiff': 'Image',
    'application/pdf': 'Document',
    'application/msword': 'Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Document',
    'application/vnd.ms-excel': 'Document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Document',
    'application/vnd.ms-powerpoint': 'Document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'Document',
    'application/zip': 'Archive',
    'application/x-rar-compressed': 'Archive',
    'application/x-tar': 'Archive',
    'application/gzip': 'Archive',
    'application/x-7z-compressed': 'Archive',
    'application/octet-stream': 'Executable',
    'application/x-executable': 'Executable',
    'application/x-msdownload': 'Executable',
    'audio/mpeg': 'Audio',
    'audio/wav': 'Audio',
    'audio/ogg': 'Audio',
    'audio/mp4': 'Audio',
    'audio/aac': 'Audio',
    'video/mp4': 'Video',
    'video/mpeg': 'Video',
    'video/quicktime': 'Video',
    'video/x-msvideo': 'Video',
    'video/webm': 'Video'
} as const; 