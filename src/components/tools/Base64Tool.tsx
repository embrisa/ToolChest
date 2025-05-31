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
import { Base64Service } from '@/services/tools/base64Service';
import {
    Base64State,
    Base64Result,
    A11yAnnouncement,
    ClipboardResult
} from '@/types/tools/base64';

export function Base64Tool() {
    const [state, setState] = useState<Base64State>({
        mode: 'encode',
        variant: 'standard',
        inputType: 'text',
        textInput: '',
        fileInput: null,
        result: null,
        isProcessing: false,
        progress: null,
        error: null,
        warnings: [],
        validationErrors: []
    });

    const [dragActive, setDragActive] = useState(false);
    const [copySuccess, setCopySuccess] = useState<ClipboardResult | null>(null);
    const [announcement, setAnnouncement] = useState<A11yAnnouncement | null>(null);

    const { announceToScreenReader } = useAccessibilityAnnouncements();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Process Base64 operation with enhanced error handling and progress
    const processBase64 = useCallback(async () => {
        if (state.inputType === 'text' && !state.textInput.trim()) {
            setState(prev => ({
                ...prev,
                result: null,
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
                result: null,
                error: null,
                progress: null,
                warnings: [],
                validationErrors: []
            }));
            return;
        }

        // Validate input before processing

        if (state.inputType === 'file' && state.fileInput) {
            const validation = Base64Service.validateFile(state.fileInput);
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

        // Announce start of processing to screen readers
        setAnnouncement(announceToScreenReader(
            `Starting ${state.mode} operation`,
            'polite'
        ));

        try {
            const input = state.inputType === 'text' ? state.textInput : state.fileInput!;
            const inputSize = state.inputType === 'text' ? state.textInput.length : state.fileInput!.size;

            const result: Base64Result = await Base64Service[state.mode]({
                mode: state.mode,
                variant: state.variant,
                inputType: state.inputType,
                input,
                onProgress: (progress) => {
                    setState(prev => ({ ...prev, progress }));
                }
            });

            setState(prev => ({
                ...prev,
                result,
                error: result.success ? null : result.error || 'Operation failed',
                warnings: result.warnings || [],
                isProcessing: false,
                progress: null
            }));

            // Track usage analytics (privacy-compliant)
            Base64Service.trackUsage({
                operation: state.mode,
                inputType: state.inputType,
                variant: state.variant,
                inputSize,
                outputSize: result.success ? (result.data?.length || 0) : 0,
                processingTime: result.processingTime || 0,
                success: result.success,
                clientSide: !result.serverSide,
                error: result.success ? undefined : result.error
            });

            // Announce completion
            if (result.success) {
                setAnnouncement(announceToScreenReader(
                    `${state.mode} operation completed successfully`,
                    'polite'
                ));
            } else {
                setAnnouncement(announceToScreenReader(
                    `${state.mode} operation failed: ${result.error}`,
                    'assertive'
                ));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Operation failed';
            setState(prev => ({
                ...prev,
                result: null,
                error: errorMessage,
                isProcessing: false,
                progress: null
            }));

            setAnnouncement(announceToScreenReader(
                `Operation failed: ${errorMessage}`,
                'assertive'
            ));
        }
    }, [state.mode, state.variant, state.inputType, state.textInput, state.fileInput, announceToScreenReader]);

    // Auto-process when inputs change (with debouncing for text)
    useEffect(() => {
        if (state.inputType === 'text') {
            const timer = setTimeout(() => {
                processBase64();
            }, 300); // 300ms debounce
            return () => clearTimeout(timer);
        } else {
            processBase64();
        }
    }, [processBase64, state.inputType]);

    // Enhanced file selection with validation
    const handleFileSelect = useCallback((file: File) => {
        const validation = Base64Service.validateFile(file);

        setState(prev => ({
            ...prev,
            fileInput: file,
            error: validation.isValid ? null : validation.error || 'Invalid file',
            warnings: validation.warnings || [],
            validationErrors: validation.validationErrors || [],
            result: null
        }));

        if (!validation.isValid) {
            setAnnouncement(announceToScreenReader(
                `File validation failed: ${validation.error}`,
                'assertive'
            ));
        } else {
            const warnings = validation.warnings?.join('. ') || '';
            setAnnouncement(announceToScreenReader(
                `File selected: ${file.name}. ${warnings}`,
                'polite'
            ));
        }
    }, [announceToScreenReader]);

    // Enhanced drag and drop handlers with accessibility
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        } else {
            setAnnouncement(announceToScreenReader(
                'No valid file found in drop operation',
                'assertive'
            ));
        }
    }, [handleFileSelect, announceToScreenReader]);



    // Enhanced copy to clipboard with accessibility feedback
    const handleCopy = useCallback(async () => {
        if (!state.result?.data) return;

        const result = await Base64Service.copyToClipboard(state.result.data);
        setCopySuccess(result);

        setAnnouncement(announceToScreenReader(
            result.announceToScreenReader || result.message,
            result.success ? 'polite' : 'assertive'
        ));

        if (result.success) {
            setTimeout(() => setCopySuccess(null), 3000);
        }
    }, [state.result, announceToScreenReader]);

    // Download result with accessibility feedback
    const handleDownload = useCallback(() => {
        if (!state.result?.data) return;

        try {
            const filename = Base64Service.generateFilename(
                state.mode,
                state.result.filename || state.fileInput?.name
            );

            Base64Service.generateDownload({
                content: state.result.data,
                filename,
                contentType: 'text/plain'
            });

            setAnnouncement(announceToScreenReader(
                `Download started for ${filename}`,
                'polite'
            ));
        } catch {
            setAnnouncement(announceToScreenReader(
                'Download failed. Please try again.',
                'assertive'
            ));
        }
    }, [state.result, state.mode, state.fileInput, announceToScreenReader]);

    // Clear file input
    const handleClearFile = useCallback(() => {
        setState(prev => ({
            ...prev,
            fileInput: null,
            result: null,
            error: null,
            warnings: [],
            validationErrors: []
        }));

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        setAnnouncement(announceToScreenReader('File cleared', 'polite'));
    }, [announceToScreenReader]);

    return (
        <div className="space-y-6">
            {/* ARIA live region for screen reader announcements */}
            <AriaLiveRegion announcement={announcement} />

            {/* Mode and Variant Selection */}
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Base64 Operation Settings
                    </h2>
                    <p className="text-sm text-gray-600">
                        Choose your encoding/decoding preferences
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Mode Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Operation Mode
                            </label>
                            <div className="flex space-x-2">
                                <Button
                                    variant={state.mode === 'encode' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => setState(prev => ({ ...prev, mode: 'encode', result: null }))}
                                    aria-pressed={state.mode === 'encode'}
                                    className="flex-1"
                                >
                                    Encode
                                </Button>
                                <Button
                                    variant={state.mode === 'decode' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => setState(prev => ({ ...prev, mode: 'decode', result: null }))}
                                    aria-pressed={state.mode === 'decode'}
                                    className="flex-1"
                                >
                                    Decode
                                </Button>
                            </div>
                        </div>

                        {/* Input Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Input Type
                            </label>
                            <div className="flex space-x-2">
                                <Button
                                    variant={state.inputType === 'text' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => setState(prev => ({
                                        ...prev,
                                        inputType: 'text',
                                        result: null,
                                        fileInput: null
                                    }))}
                                    aria-pressed={state.inputType === 'text'}
                                    className="flex-1"
                                >
                                    Text
                                </Button>
                                <Button
                                    variant={state.inputType === 'file' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => setState(prev => ({
                                        ...prev,
                                        inputType: 'file',
                                        result: null,
                                        textInput: ''
                                    }))}
                                    aria-pressed={state.inputType === 'file'}
                                    className="flex-1"
                                >
                                    File
                                </Button>
                            </div>
                        </div>

                        {/* Variant Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Base64 Variant
                            </label>
                            <div className="flex space-x-2">
                                <Button
                                    variant={state.variant === 'standard' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => setState(prev => ({ ...prev, variant: 'standard', result: null }))}
                                    aria-pressed={state.variant === 'standard'}
                                    className="flex-1"
                                    title="Standard Base64 encoding with +, /, and = characters"
                                >
                                    Standard
                                </Button>
                                <Button
                                    variant={state.variant === 'url-safe' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => setState(prev => ({ ...prev, variant: 'url-safe', result: null }))}
                                    aria-pressed={state.variant === 'url-safe'}
                                    className="flex-1"
                                    title="URL-safe Base64 encoding with -, _, and no padding"
                                >
                                    URL-Safe
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Input Section */}
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-900">
                        {state.mode === 'encode' ? 'Input to Encode' : 'Base64 Data to Decode'}
                    </h2>
                    <p className="text-sm text-gray-600">
                        {state.inputType === 'text'
                            ? `Enter ${state.mode === 'encode' ? 'text' : 'Base64 data'} below`
                            : `Upload a file to ${state.mode}`
                        }
                    </p>
                </CardHeader>
                <CardContent>
                    {state.inputType === 'text' ? (
                        <div className="space-y-4">
                            <textarea
                                value={state.textInput}
                                onChange={(e) => setState(prev => ({ ...prev, textInput: e.target.value, result: null }))}
                                placeholder={state.mode === 'encode'
                                    ? 'Enter text to encode...'
                                    : 'Enter Base64 data to decode...'
                                }
                                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                aria-label={state.mode === 'encode' ? 'Text input for encoding' : 'Base64 input for decoding'}
                                disabled={state.isProcessing}
                            />
                            {state.textInput && (
                                <div className="text-xs text-gray-500">
                                    Input length: {state.textInput.length.toLocaleString()} characters
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* File Upload Area */}
                            <div
                                className={`
                                    relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
                                    ${dragActive
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }
                                    ${state.isProcessing ? 'opacity-50 pointer-events-none' : ''}
                                `}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    aria-label="File upload input"
                                    disabled={state.isProcessing}
                                />

                                <div className="space-y-2">
                                    <div className="text-gray-600">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                                                Click to upload
                                            </span>
                                            {' '}or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Maximum file size: 10MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Selected File Info */}
                            {state.fileInput && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {state.fileInput.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(state.fileInput.size / 1024).toFixed(1)} KB
                                                    {state.fileInput.type && ` • ${state.fileInput.type}`}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleClearFile}
                                            aria-label="Remove selected file"
                                            disabled={state.isProcessing}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Validation Errors */}
                    {state.validationErrors.length > 0 && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Validation Error{state.validationErrors.length > 1 ? 's' : ''}
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <ul className="list-disc list-inside space-y-1">
                                            {state.validationErrors.map((error, index) => (
                                                <li key={index}>{error.message}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Warnings */}
                    {state.warnings.length > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Warning{state.warnings.length > 1 ? 's' : ''}
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <ul className="list-disc list-inside space-y-1">
                                            {state.warnings.map((warning, index) => (
                                                <li key={index}>{warning}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Progress Indicator */}
            {state.isProcessing && state.progress && (
                <Card>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                    {state.progress.stage === 'reading' && 'Reading file...'}
                                    {state.progress.stage === 'processing' && `${state.mode === 'encode' ? 'Encoding' : 'Decoding'}...`}
                                    {state.progress.stage === 'complete' && 'Complete!'}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {state.progress.progress}%
                                </span>
                            </div>
                            <ProgressIndicator
                                progress={state.progress}
                                label={`${state.mode} operation`}
                                className="w-full"
                            />
                            {state.progress.estimatedTimeRemaining && state.progress.estimatedTimeRemaining > 1 && (
                                <p className="text-xs text-gray-500">
                                    Estimated time remaining: {state.progress.estimatedTimeRemaining}s
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error Display */}
            {state.error && (
                <Card>
                    <CardContent>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Operation Failed
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        {state.error}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results Section */}
            {state.result?.success && state.result.data && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {state.mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}
                                </h2>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                    {state.result.originalSize && (
                                        <span>Input: {state.result.originalSize.toLocaleString()} bytes</span>
                                    )}
                                    {state.result.outputSize && (
                                        <span>Output: {state.result.outputSize.toLocaleString()} bytes</span>
                                    )}
                                    {state.result.processingTime && (
                                        <span>Time: {state.result.processingTime}ms</span>
                                    )}
                                    {state.result.serverSide && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Server-side
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleCopy}
                                    disabled={!state.result.data}
                                    aria-label="Copy result to clipboard"
                                >
                                    {copySuccess?.success ? 'Copied!' : 'Copy'}
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleDownload}
                                    disabled={!state.result.data}
                                    aria-label="Download result as file"
                                >
                                    Download
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <textarea
                                value={state.result.data}
                                readOnly
                                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical font-mono text-sm"
                                aria-label={`${state.mode} result`}
                            />

                            {/* Copy Success Feedback */}
                            {copySuccess && (
                                <div className={`p-2 rounded-md text-sm ${copySuccess.success
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                    {copySuccess.message}
                                </div>
                            )}

                            {/* Result Warnings */}
                            {state.result.warnings && state.result.warnings.length > 0 && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">
                                                Processing Notes
                                            </h3>
                                            <div className="mt-2 text-sm text-yellow-700">
                                                <ul className="list-disc list-inside space-y-1">
                                                    {state.result.warnings.map((warning, index) => (
                                                        <li key={index}>{warning}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 