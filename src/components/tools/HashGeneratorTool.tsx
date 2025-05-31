'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
    Button,
    Card,
    CardHeader,
    CardContent,
    ProgressIndicator,
    AriaLiveRegion,
    useAccessibilityAnnouncements
} from '@/components/ui';
import { HashGeneratorService } from '@/services/tools/hashGeneratorService';
import {
    HashState,
    HashResult,
    HashAlgorithm,
    ClipboardResult,
    HASH_ALGORITHMS,
    ALGORITHM_INFO,
    FILE_SIZE_LIMITS
} from '@/types/tools/hashGenerator';
import { A11yAnnouncement } from '@/types/tools/base64';
import {
    DocumentDuplicateIcon,
    DocumentArrowDownIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

export function HashGeneratorTool() {
    const [state, setState] = useState<HashState>({
        algorithm: 'SHA-256',
        inputType: 'text',
        textInput: '',
        fileInput: null,
        results: {
            'MD5': null,
            'SHA-1': null,
            'SHA-256': null,
            'SHA-512': null
        },
        isProcessing: false,
        progress: null,
        error: null,
        warnings: [],
        validationErrors: []
    });

    const [dragActive, setDragActive] = useState(false);
    const [copySuccess, setCopySuccess] = useState<ClipboardResult | null>(null);
    const [announcement, setAnnouncement] = useState<A11yAnnouncement | null>(null);
    const [generateAllHashes, setGenerateAllHashes] = useState(false);

    const { announceToScreenReader } = useAccessibilityAnnouncements();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Process hash generation
    const processHash = useCallback(async (algorithm?: HashAlgorithm) => {
        if (state.inputType === 'text' && !state.textInput.trim()) {
            setState(prev => ({
                ...prev,
                results: generateAllHashes ?
                    { 'MD5': null, 'SHA-1': null, 'SHA-256': null, 'SHA-512': null } :
                    { ...prev.results, [algorithm || state.algorithm]: null },
                error: null,
                progress: null,
                warnings: [],
                validationErrors: []
            }));
            return;
        }

        if (state.inputType === 'file' && !state.fileInput) {
            setState(prev => ({
                ...prev,
                results: generateAllHashes ?
                    { 'MD5': null, 'SHA-1': null, 'SHA-256': null, 'SHA-512': null } :
                    { ...prev.results, [algorithm || state.algorithm]: null },
                error: null,
                progress: null,
                warnings: [],
                validationErrors: []
            }));
            return;
        }

        // Validate input before processing
        if (state.inputType === 'file' && state.fileInput) {
            const validation = HashGeneratorService.validateFile(state.fileInput);
            if (!validation.isValid) {
                setState(prev => ({
                    ...prev,
                    error: validation.error || 'File validation failed',
                    validationErrors: validation.validationErrors || [],
                    warnings: validation.warnings || []
                }));

                setAnnouncement(announceToScreenReader(
                    `File validation failed: ${validation.error}`,
                    'assertive'
                ));
                return;
            }
        }

        setState(prev => ({
            ...prev,
            isProcessing: true,
            error: null,
            progress: null,
            validationErrors: []
        }));

        const algorithmsToProcess = generateAllHashes ? HASH_ALGORITHMS : [algorithm || state.algorithm];

        // Announce start of processing to screen readers
        setAnnouncement(announceToScreenReader(
            `Starting hash generation for ${algorithmsToProcess.join(', ')}`,
            'polite'
        ));

        try {
            const input = state.inputType === 'text' ? state.textInput : state.fileInput!;
            const inputSize = state.inputType === 'text' ? state.textInput.length : state.fileInput!.size;

            const results: Partial<Record<HashAlgorithm, HashResult>> = {};
            let allWarnings: string[] = [];

            for (const algo of algorithmsToProcess) {
                const result: HashResult = await HashGeneratorService.generateHash({
                    algorithm: algo,
                    inputType: state.inputType,
                    input,
                    onProgress: (progress) => {
                        setState(prev => ({ ...prev, progress }));
                    }
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
                    error: result.success ? undefined : result.error
                });
            }

            setState(prev => ({
                ...prev,
                results: generateAllHashes ?
                    { ...results } as Record<HashAlgorithm, HashResult | null> :
                    { ...prev.results, [algorithm || state.algorithm]: results[algorithm || state.algorithm] || null },
                error: null,
                warnings: [...new Set(allWarnings)], // Remove duplicates
                isProcessing: false,
                progress: null
            }));

            // Announce completion
            const successCount = Object.values(results).filter(r => r?.success).length;
            const failureCount = Object.values(results).filter(r => !r?.success).length;

            if (failureCount === 0) {
                setAnnouncement(announceToScreenReader(
                    `Hash generation completed successfully for ${successCount} algorithm${successCount > 1 ? 's' : ''}`,
                    'polite'
                ));
            } else {
                setAnnouncement(announceToScreenReader(
                    `Hash generation completed with ${failureCount} error${failureCount > 1 ? 's' : ''}`,
                    'assertive'
                ));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Hash generation failed';
            setState(prev => ({
                ...prev,
                error: errorMessage,
                isProcessing: false,
                progress: null
            }));

            setAnnouncement(announceToScreenReader(
                `Hash generation failed: ${errorMessage}`,
                'assertive'
            ));
        }
    }, [state.algorithm, state.inputType, state.textInput, state.fileInput, generateAllHashes, announceToScreenReader]);

    // Enhanced auto-process with improved debouncing for text input
    useEffect(() => {
        if (state.inputType === 'text') {
            // Only process if there's actual text content
            if (state.textInput.trim()) {
                const timer = setTimeout(() => {
                    processHash();
                }, 300); // 300ms debounce for real-time processing
                return () => clearTimeout(timer);
            } else {
                // Clear results immediately when text is empty
                setState(prev => ({
                    ...prev,
                    results: generateAllHashes ?
                        { 'MD5': null, 'SHA-1': null, 'SHA-256': null, 'SHA-512': null } :
                        { ...prev.results, [state.algorithm]: null },
                    error: null,
                    warnings: [],
                    validationErrors: []
                }));
            }
        } else if (state.fileInput) {
            // Process file immediately when selected
            processHash();
        }
    }, [processHash, state.inputType, state.textInput, state.fileInput, generateAllHashes, state.algorithm]);

    // Enhanced file selection with validation
    const handleFileSelect = useCallback((file: File) => {
        const validation = HashGeneratorService.validateFile(file);

        setState(prev => ({
            ...prev,
            fileInput: file,
            error: validation.isValid ? null : validation.error || 'Invalid file',
            warnings: validation.warnings || [],
            validationErrors: validation.validationErrors || [],
            results: { 'MD5': null, 'SHA-1': null, 'SHA-256': null, 'SHA-512': null }
        }));

        if (!validation.isValid) {
            setAnnouncement(announceToScreenReader(
                `File validation failed: ${validation.error}`,
                'assertive'
            ));
        } else {
            const warnings = validation.warnings?.join('. ') || '';
            setAnnouncement(announceToScreenReader(
                `File selected: ${file.name}${warnings ? '. ' + warnings : ''}`,
                'polite'
            ));
        }
    }, [announceToScreenReader]);

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

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [handleFileSelect]);

    // Enhanced copy to clipboard with improved feedback
    const handleCopyToClipboard = useCallback(async (hash: string, algorithm: HashAlgorithm) => {
        // Show immediate feedback
        setCopySuccess({
            success: true,
            message: 'Copying...',
            timestamp: Date.now()
        });

        const result = await HashGeneratorService.copyToClipboard(hash);

        setCopySuccess({
            success: result.success,
            message: result.message,
            timestamp: Date.now()
        });

        // Enhanced accessibility announcement with more context
        const hashLength = hash.length;
        const hashPreview = hash.substring(0, 8) + '...';
        setAnnouncement(announceToScreenReader(
            `${algorithm} hash ${result.success ? `(${hashLength} characters, starting with ${hashPreview}) copied to clipboard` : 'copy failed: ' + result.message}`,
            result.success ? 'polite' : 'assertive'
        ));

        // Clear success message after 3 seconds
        setTimeout(() => setCopySuccess(null), 3000);
    }, [announceToScreenReader]);

    // Clear copy success message when it expires
    useEffect(() => {
        if (copySuccess) {
            const timer = setTimeout(() => setCopySuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [copySuccess]);

    return (
        <div className="space-y-6">
            {/* ARIA Live Region for announcements */}
            <AriaLiveRegion announcement={announcement} />

            {/* Input Type Selection */}
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Input Method
                    </h2>
                </CardHeader>
                <CardContent>
                    <fieldset className="space-y-4">
                        <legend className="sr-only">Choose input method for hash generation</legend>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => setState(prev => ({
                                    ...prev,
                                    inputType: 'text',
                                    fileInput: null,
                                    results: { 'MD5': null, 'SHA-1': null, 'SHA-256': null, 'SHA-512': null }
                                }))}
                                className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${state.inputType === 'text'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                                aria-pressed={state.inputType === 'text'}
                                aria-describedby="text-input-description"
                            >
                                Text Input
                            </button>

                            <button
                                type="button"
                                onClick={() => setState(prev => ({
                                    ...prev,
                                    inputType: 'file',
                                    textInput: '',
                                    results: { 'MD5': null, 'SHA-1': null, 'SHA-256': null, 'SHA-512': null }
                                }))}
                                className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${state.inputType === 'file'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                                aria-pressed={state.inputType === 'file'}
                                aria-describedby="file-input-description"
                            >
                                File Upload
                            </button>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {state.inputType === 'text' && (
                                <p id="text-input-description">
                                    Enter text to generate hash values. Processing happens in real-time as you type.
                                </p>
                            )}
                            {state.inputType === 'file' && (
                                <p id="file-input-description">
                                    Upload a file to generate hash values. Maximum file size: 10MB.
                                </p>
                            )}
                        </div>
                    </fieldset>
                </CardContent>
            </Card>

            {/* Algorithm Selection */}
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Hash Algorithm
                    </h2>
                </CardHeader>
                <CardContent>
                    <fieldset className="space-y-4">
                        <legend className="sr-only">Choose hash algorithm</legend>

                        <div className="flex items-center space-x-4 mb-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={generateAllHashes}
                                    onChange={(e) => setGenerateAllHashes(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Generate all hash types
                                </span>
                            </label>
                        </div>

                        {!generateAllHashes && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {HASH_ALGORITHMS.map((algo) => (
                                    <button
                                        key={algo}
                                        type="button"
                                        onClick={() => setState(prev => ({ ...prev, algorithm: algo }))}
                                        className={`p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${state.algorithm === algo
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                                            }`}
                                        aria-pressed={state.algorithm === algo}
                                        title={ALGORITHM_INFO[algo].description}
                                    >
                                        <div className="text-center">
                                            <div className="font-semibold">{algo}</div>
                                            <div className="text-xs opacity-75">
                                                {ALGORITHM_INFO[algo].outputLength} chars
                                            </div>
                                            {!ALGORITHM_INFO[algo].secure && (
                                                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                                    ⚠️ Legacy
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </fieldset>
                </CardContent>
            </Card>

            {/* Input Section */}
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {state.inputType === 'text' ? 'Text Input' : 'File Upload'}
                    </h2>
                </CardHeader>
                <CardContent>
                    {state.inputType === 'text' ? (
                        <div className="space-y-4">
                            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Enter text to hash
                            </label>
                            <textarea
                                id="text-input"
                                value={state.textInput}
                                onChange={(e) => setState(prev => ({ ...prev, textInput: e.target.value }))}
                                placeholder="Enter your text here..."
                                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-vertical"
                                aria-describedby="text-input-help"
                            />
                            <p id="text-input-help" className="text-sm text-gray-600 dark:text-gray-400">
                                Hash values will be generated automatically as you type.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div
                                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${dragActive
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onKeyDown={(e) => {
                                    // Keyboard accessibility: Enter or Space to trigger file picker
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        fileInputRef.current?.click();
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label="Click to select file or drag and drop"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileSelect(file);
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    aria-describedby="file-upload-help file-type-info"
                                    accept=".txt,.csv,.json,.pdf,.jpg,.jpeg,.png,.gif,.webp,.zip,.exe,.mp4,.mp3,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                    tabIndex={-1}
                                />

                                <div className="space-y-2">
                                    <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                                        {state.fileInput ? (
                                            <div className="space-y-1">
                                                <div className="font-semibold">{state.fileInput.name}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Size: {(state.fileInput.size / 1024 / 1024).toFixed(2)} MB
                                                    {state.fileInput.type && ` • Type: ${state.fileInput.type}`}
                                                </div>
                                            </div>
                                        ) : (
                                            'Drop file here or click to browse'
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Maximum file size: 10MB
                                    </p>
                                    {!state.fileInput && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            Keyboard users: Press Enter or Space to open file picker
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p id="file-upload-help" className="text-sm text-gray-600 dark:text-gray-400">
                                    Drag and drop a file or click to select. Hash values will be generated automatically.
                                </p>

                                <div id="file-type-info" className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Supported File Types
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <div>
                                            <span className="font-medium">Text:</span> .txt, .csv, .json, .html, .css, .js, .xml, .md
                                        </div>
                                        <div>
                                            <span className="font-medium">Images:</span> .jpg, .png, .gif, .webp, .svg, .bmp
                                        </div>
                                        <div>
                                            <span className="font-medium">Documents:</span> .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx
                                        </div>
                                        <div>
                                            <span className="font-medium">Archives:</span> .zip, .rar, .tar, .gz, .7z
                                        </div>
                                        <div>
                                            <span className="font-medium">Media:</span> .mp4, .mp3, .wav, .avi, .mov
                                        </div>
                                        <div>
                                            <span className="font-medium">Other:</span> Any binary file
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        All files are processed safely without execution. Hash generation works with any file type.
                                    </p>
                                </div>

                                {/* File validation feedback */}
                                {state.fileInput && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                                            File Information
                                        </h4>
                                        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                            <div>
                                                <span className="font-medium">Name:</span> {state.fileInput.name}
                                            </div>
                                            <div>
                                                <span className="font-medium">Size:</span> {(state.fileInput.size / 1024 / 1024).toFixed(2)} MB ({state.fileInput.size.toLocaleString()} bytes)
                                            </div>
                                            {state.fileInput.type && (
                                                <div>
                                                    <span className="font-medium">Type:</span> {state.fileInput.type}
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium">Last Modified:</span> {state.fileInput.lastModified ? new Date(state.fileInput.lastModified).toLocaleString() : 'Unknown'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Enhanced Progress Indicator */}
            {state.isProcessing && state.progress && (
                <Card>
                    <CardContent>
                        <ProgressIndicator progress={{
                            progress: state.progress.percentage,
                            stage: state.progress.stage === 'hashing' ? 'processing' : state.progress.stage,
                            bytesProcessed: state.progress.bytesProcessed,
                            totalBytes: state.progress.totalBytes,
                            estimatedTimeRemaining: state.progress.estimatedTimeRemaining
                        }} />

                        {/* Additional progress details for large files */}
                        {state.progress.totalBytes > FILE_SIZE_LIMITS.LARGE_FILE_THRESHOLD && (
                            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex justify-between items-center">
                                    <span>
                                        Processing: {((state.progress.bytesProcessed / (1024 * 1024)).toFixed(2))} MB / {((state.progress.totalBytes / (1024 * 1024)).toFixed(2))} MB
                                    </span>
                                    {state.progress.estimatedTimeRemaining && (
                                        <span className="font-medium">
                                            ETA: {Math.round(state.progress.estimatedTimeRemaining / 1000)}s
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1 text-xs">
                                    Processing speed: ~{((state.progress.bytesProcessed / (1024 * 1024)) / ((Date.now() - (state.progress as any).startTime || Date.now()) / 1000)).toFixed(1)} MB/s
                                </div>
                            </div>
                        )}

                        {/* Performance hint for real-time processing */}
                        {state.inputType === 'text' && state.textInput.length > 1000 && (
                            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                💡 Large text detected. Hash values are generated in real-time as you type with 300ms debouncing for optimal performance.
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Error and Validation Display */}
            {(state.error || state.validationErrors.length > 0) && (
                <Card>
                    <CardContent>
                        <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <XCircleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    {state.validationErrors.length > 0 ? 'File Validation Error' : 'Hash Generation Error'}
                                </h3>
                                {state.error && (
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                        {state.error}
                                    </p>
                                )}
                                {state.validationErrors.length > 0 && (
                                    <ul className="text-sm text-red-700 dark:text-red-300 mt-1 space-y-1">
                                        {state.validationErrors.map((error, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="mr-2">•</span>
                                                <span>{error}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Helpful suggestions for common errors */}
                                {state.error?.includes('File size') && (
                                    <div className="mt-2 p-2 bg-red-100 dark:bg-red-800/30 rounded text-xs text-red-600 dark:text-red-400">
                                        💡 <strong>Suggestion:</strong> Try compressing your file or selecting a smaller file.
                                        For very large files, consider using command-line tools like <code>sha256sum</code> or <code>md5sum</code>.
                                    </div>
                                )}

                                {state.error?.includes('empty') && (
                                    <div className="mt-2 p-2 bg-red-100 dark:bg-red-800/30 rounded text-xs text-red-600 dark:text-red-400">
                                        💡 <strong>Suggestion:</strong> Please select a file that contains data.
                                        Empty files cannot have meaningful hash values generated.
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Warnings Display */}
            {state.warnings.length > 0 && (
                <Card>
                    <CardContent>
                        <div className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                    Security Warning
                                </h3>
                                <ul className="text-sm text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                                    {state.warnings.map((warning, index) => (
                                        <li key={index}>• {warning}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results Display */}
            {Object.entries(state.results).some(([_, result]) => result?.success) && (
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Hash Results
                        </h2>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(state.results).map(([algorithm, result]) => {
                                if (!result?.success) return null;

                                return (
                                    <div key={algorithm} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {algorithm}
                                                </h3>
                                                {!ALGORITHM_INFO[algorithm as HashAlgorithm].secure && (
                                                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-1 rounded">
                                                        Legacy
                                                    </span>
                                                )}
                                                {result.serverSide && (
                                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                                        Server-side
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCopyToClipboard(result.hash!, algorithm as HashAlgorithm)}
                                                className="flex items-center space-x-1"
                                                aria-label={`Copy ${algorithm} hash to clipboard`}
                                            >
                                                <DocumentDuplicateIcon className="h-4 w-4" />
                                                <span>Copy</span>
                                            </Button>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 font-mono text-sm break-all">
                                            {result.hash}
                                        </div>

                                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-4">
                                            <span>Length: {result.hash?.length} characters</span>
                                            <span>Input size: {result.inputSize} bytes</span>
                                            <span>Time: {result.processingTime}ms</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Copy Success Message */}
            {copySuccess && (
                <Card>
                    <CardContent>
                        <div className={`flex items-center space-x-3 p-4 rounded-lg ${copySuccess.success
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                            }`}>
                            {copySuccess.success ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                            ) : (
                                <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                            )}
                            <p className={`text-sm ${copySuccess.success
                                ? 'text-green-800 dark:text-green-200'
                                : 'text-red-800 dark:text-red-200'
                                }`}>
                                {copySuccess.message}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 