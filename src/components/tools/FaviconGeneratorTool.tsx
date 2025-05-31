'use client';

import { useState, useCallback, useRef } from 'react';
import {
    Button,
    Card,
    CardHeader,
    CardContent,
    AriaLiveRegion,
    ColorPicker
} from '@/components/ui';
import { FaviconPreview } from './FaviconPreview';
import { FaviconGeneratorService } from '@/services/tools/faviconGeneratorService';
import {
    FaviconGeneratorState,
    FaviconGenerationOptions,
    FaviconSizeKey,
    GeneratedFavicon,
    FaviconA11yAnnouncement,
    DEFAULT_FAVICON_OPTIONS,
    FAVICON_SIZES,
    FAVICON_FILE_LIMITS
} from '@/types/tools/faviconGenerator';

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
        showPreview: false
    });

    const [dragActive, setDragActive] = useState(false);
    const [announcement, setAnnouncement] = useState<FaviconA11yAnnouncement | null>(null);
    const [showAdvancedOptions] = useState(false);
    const [showBatchMode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Announce to screen readers
    const announceToScreenReader = useCallback((message: string, type: 'polite' | 'assertive' = 'polite') => {
        const announcement: FaviconA11yAnnouncement = {
            message,
            type,
            timestamp: Date.now()
        };
        setAnnouncement(announcement);
        return announcement;
    }, []);

    // Generate real-time preview with performance optimization
    const generatePreview = useCallback(async (file: File, options: FaviconGenerationOptions) => {
        try {
            // For large files, only generate a few preview sizes
            const isLargeFile = file.size > FAVICON_FILE_LIMITS.largeFileThreshold;
            const previewSizes: FaviconSizeKey[] = isLargeFile
                ? ['png32', 'png48'] // Reduced previews for large files
                : ['png16', 'png32', 'png48', 'appleTouch180'];

            const { image } = await FaviconGeneratorService.loadImageFile(file);
            const newPreviewUrls: { [key in FaviconSizeKey]?: string } = {};

            for (const sizeKey of previewSizes) {
                if (options.sizes.includes(sizeKey)) {
                    const size = FAVICON_SIZES[sizeKey];
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) continue;

                    canvas.width = size.width;
                    canvas.height = size.height;

                    // Fill background if specified
                    if (options.backgroundColor && options.backgroundColor !== 'transparent') {
                        ctx.fillStyle = options.backgroundColor;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }

                    // Calculate dimensions for centering and padding
                    const padding = options.padding || 0;
                    const availableWidth = canvas.width - (padding * 2);
                    const availableHeight = canvas.height - (padding * 2);

                    const scaleX = availableWidth / image.naturalWidth;
                    const scaleY = availableHeight / image.naturalHeight;
                    const scale = Math.min(scaleX, scaleY);

                    const scaledWidth = image.naturalWidth * scale;
                    const scaledHeight = image.naturalHeight * scale;

                    const x = (canvas.width - scaledWidth) / 2;
                    const y = (canvas.height - scaledHeight) / 2;

                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

                    // Apply compression for preview
                    const quality = options.compressionOptions?.enabled
                        ? options.compressionOptions.quality
                        : 0.9;

                    newPreviewUrls[sizeKey] = canvas.toDataURL('image/png', quality);
                }
            }

            setState(prev => ({
                ...prev,
                previewUrls: newPreviewUrls,
                showPreview: Object.keys(newPreviewUrls).length > 0
            }));

            if (isLargeFile) {
                announceToScreenReader('Large file detected. Preview generated with optimization.', 'polite');
            }
        } catch (error) {
            console.warn('Preview generation failed:', error);
        }
    }, [announceToScreenReader]);

    // Handle single file selection
    const handleFileSelect = useCallback((file: File) => {
        const validation = FaviconGeneratorService.validateFile(file);

        setState(prev => ({
            ...prev,
            sourceImage: file,
            sourceImages: [file], // Also set as batch for consistency
            error: validation.isValid ? null : validation.error || 'Invalid file',
            warnings: validation.warnings || [],
            validationErrors: validation.isValid ? [] : [validation.error || 'Invalid file'],
            result: null,
            batchResults: [],
            showPreview: false
        }));

        if (!validation.isValid) {
            announceToScreenReader(`File validation failed: ${validation.error}`, 'assertive');
        } else {
            const warnings = validation.warnings?.join('. ') || '';
            const sizeText = (file.size / (1024 * 1024)).toFixed(1);
            announceToScreenReader(
                `File ${file.name} selected successfully (${sizeText}MB). ${warnings}`,
                'polite'
            );

            // Generate initial preview
            generatePreview(file, state.options);
        }
    }, [announceToScreenReader, generatePreview, state.options]);

    // Note: Batch file selection is available but not exposed in UI yet
    // This implementation is ready for future batch processing features

    // Handle drag and drop
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
    }, []);

    // Handle file input change
    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    // Handle size selection
    const handleSizeToggle = useCallback((sizeKey: FaviconSizeKey) => {
        setState(prev => {
            const newSizes = prev.options.sizes.includes(sizeKey)
                ? prev.options.sizes.filter(s => s !== sizeKey)
                : [...prev.options.sizes, sizeKey];

            const updatedOptions = {
                ...prev.options,
                sizes: newSizes
            };

            // Update real-time preview if source image exists
            if (prev.sourceImage) {
                setTimeout(() => {
                    generatePreview(prev.sourceImage!, updatedOptions);
                }, 0);
            }

            return {
                ...prev,
                options: updatedOptions
            };
        });
    }, [generatePreview]);

    // Handle generate favicons with enhanced processing
    const handleGenerate = useCallback(async () => {
        if (!state.sourceImage && state.sourceImages.length === 0) {
            announceToScreenReader('Please select at least one image file first.', 'assertive');
            return;
        }

        // Determine processing mode
        const isBatchMode = showBatchMode && state.sourceImages.length > 1;
        const processingFile = state.sourceImage!;

        setState(prev => ({
            ...prev,
            isProcessing: !isBatchMode,
            isBatchProcessing: isBatchMode,
            progress: null,
            batchProgress: null,
            result: null,
            batchResults: [],
            error: null
        }));

        try {
            if (isBatchMode) {
                // Batch processing
                announceToScreenReader(`Starting batch processing of ${state.sourceImages.length} files.`, 'polite');

                const results = await FaviconGeneratorService.generateFaviconsBatch(
                    state.sourceImages,
                    state.options,
                    (progress) => {
                        setState(prev => ({ ...prev, batchProgress: progress }));
                        announceToScreenReader(
                            `Processing ${progress.currentFile}: ${progress.percentage}% complete`,
                            'polite'
                        );
                    },
                    (progress) => {
                        setState(prev => ({ ...prev, progress }));
                    }
                );

                setState(prev => ({
                    ...prev,
                    isBatchProcessing: false,
                    batchResults: results,
                    batchProgress: null,
                    progress: null
                }));

                const successCount = results.filter(r => r.success).length;
                announceToScreenReader(
                    `Batch processing complete. ${successCount} of ${results.length} files processed successfully.`,
                    'polite'
                );

            } else {
                // Single file processing
                const fileSize = processingFile.size;
                const isLargeFile = fileSize > FAVICON_FILE_LIMITS.largeFileThreshold;

                if (isLargeFile) {
                    announceToScreenReader(
                        `Processing large file (${Math.round(fileSize / (1024 * 1024))}MB). This may take longer.`,
                        'polite'
                    );
                }

                const result = await FaviconGeneratorService.generateFavicons(
                    processingFile,
                    state.options,
                    (progress) => {
                        setState(prev => ({ ...prev, progress }));

                        // Announce progress for large files
                        if (isLargeFile && progress.percentage % 25 === 0) {
                            announceToScreenReader(
                                `Processing: ${progress.currentStep} - ${progress.percentage}% complete`,
                                'polite'
                            );
                        }
                    }
                );

                setState(prev => ({
                    ...prev,
                    isProcessing: false,
                    result,
                    progress: null,
                    error: result.success ? null : result.error || 'Generation failed',
                    warnings: result.warnings || []
                }));

                if (result.success) {
                    const processingTime = result.processingTime || 0;
                    const faviconCount = result.favicons?.length || 0;
                    announceToScreenReader(
                        `Favicon generation complete! Generated ${faviconCount} favicons in ${Math.round(processingTime / 1000)} seconds.`,
                        'polite'
                    );
                } else {
                    announceToScreenReader(`Generation failed: ${result.error}`, 'assertive');
                }
            }

        } catch (error) {
            setState(prev => ({
                ...prev,
                isProcessing: false,
                isBatchProcessing: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred',
                progress: null,
                batchProgress: null
            }));
            announceToScreenReader('Favicon generation failed due to an unexpected error.', 'assertive');
        }
    }, [state.sourceImage, state.sourceImages, state.options, showBatchMode, announceToScreenReader]);

    // Enhanced options change handler
    const handleOptionsChange = useCallback((newOptions: Partial<FaviconGenerationOptions>) => {
        setState(prev => {
            const updatedOptions = { ...prev.options, ...newOptions };

            // Update real-time preview if source image exists
            if (prev.sourceImage) {
                setTimeout(() => {
                    generatePreview(prev.sourceImage!, updatedOptions);
                }, 0);
            }

            return {
                ...prev,
                options: updatedOptions
            };
        });
    }, [generatePreview]);

    // Download single favicon
    const downloadFavicon = useCallback(async (favicon: GeneratedFavicon) => {
        FaviconGeneratorService.downloadFavicon(favicon);
        announceToScreenReader(`Downloaded ${favicon.filename}`, 'polite');
    }, [announceToScreenReader]);

    // Download all favicons
    const downloadAllFavicons = useCallback(async () => {
        if (!state.result?.favicons) return;

        await FaviconGeneratorService.downloadAllFavicons(
            state.result.favicons,
            state.result.manifestJson
        );
        announceToScreenReader('Downloaded all favicons as ZIP package', 'polite');
    }, [state.result, announceToScreenReader]);

    // Copy to clipboard
    const copyToClipboard = useCallback(async (favicon: GeneratedFavicon) => {
        const success = await FaviconGeneratorService.copyToClipboard(favicon);
        announceToScreenReader(
            success ? `Copied ${favicon.filename} data URL to clipboard` : 'Failed to copy to clipboard',
            success ? 'polite' : 'assertive'
        );
    }, [announceToScreenReader]);

    // Performance metrics display
    const renderPerformanceMetrics = useCallback(() => {
        const compressionStats = state.result?.compressionStats;
        if (!compressionStats) return null;

        return (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Performance Metrics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-blue-700">Original Size:</span>
                        <span className="ml-2 font-mono">{(compressionStats.originalSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <div>
                        <span className="text-blue-700">Compressed Size:</span>
                        <span className="ml-2 font-mono">{(compressionStats.compressedSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <div>
                        <span className="text-blue-700">Compression Ratio:</span>
                        <span className="ml-2 font-mono">{(compressionStats.compressionRatio * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                        <span className="text-blue-700">Bytes Saved:</span>
                        <span className="ml-2 font-mono">{(compressionStats.bytesSaved / 1024).toFixed(1)} KB</span>
                    </div>
                </div>
            </div>
        );
    }, [state.result?.compressionStats]);

    // Enhanced compression options UI
    const renderCompressionOptions = useCallback(() => {
        if (!showAdvancedOptions) return null;

        return (
            <Card className="mt-4">
                <CardHeader>
                    <h3 className="text-lg font-semibold">Compression Options</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="enable-compression"
                            checked={state.options.compressionOptions?.enabled || false}
                            onChange={(e) => handleOptionsChange({
                                compressionOptions: {
                                    enabled: e.target.checked,
                                    quality: 0.85,
                                    format: 'png' as const,
                                    preserveTransparency: true,
                                    algorithm: 'default' as const
                                }
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="enable-compression" className="text-sm font-medium">
                            Enable compression optimization
                        </label>
                    </div>

                    {state.options.compressionOptions?.enabled && (
                        <div className="space-y-4 pl-6">
                            <div>
                                <label htmlFor="compression-quality" className="block text-sm font-medium mb-1">
                                    Quality: {Math.round((state.options.compressionOptions.quality || 0.85) * 100)}%
                                </label>
                                <input
                                    type="range"
                                    id="compression-quality"
                                    min="0.1"
                                    max="1.0"
                                    step="0.05"
                                    value={state.options.compressionOptions.quality || 0.85}
                                    onChange={(e) => handleOptionsChange({
                                        compressionOptions: {
                                            enabled: state.options.compressionOptions?.enabled || true,
                                            quality: parseFloat(e.target.value),
                                            format: state.options.compressionOptions?.format || 'png',
                                            preserveTransparency: state.options.compressionOptions?.preserveTransparency || true,
                                            algorithm: state.options.compressionOptions?.algorithm || 'default'
                                        }
                                    })}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label htmlFor="compression-algorithm" className="block text-sm font-medium mb-1">
                                    Algorithm
                                </label>
                                <select
                                    id="compression-algorithm"
                                    value={state.options.compressionOptions.algorithm || 'default'}
                                    onChange={(e) => handleOptionsChange({
                                        compressionOptions: {
                                            enabled: state.options.compressionOptions?.enabled || true,
                                            quality: state.options.compressionOptions?.quality || 0.85,
                                            format: state.options.compressionOptions?.format || 'png',
                                            preserveTransparency: state.options.compressionOptions?.preserveTransparency || true,
                                            algorithm: e.target.value as 'default' | 'aggressive' | 'lossless'
                                        }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="default">Default</option>
                                    <option value="aggressive">Aggressive (smaller files)</option>
                                    <option value="lossless">Lossless (best quality)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }, [showAdvancedOptions, state.options.compressionOptions, handleOptionsChange]);

    return (
        <div className="space-y-6">
            <AriaLiveRegion
                announcement={announcement}
            />

            {/* File Upload Section */}
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">Upload Source Image</h2>
                    <p className="text-sm text-gray-600">
                        Upload a PNG, JPEG, SVG, WebP, or GIF image to generate favicons.
                        For best results, use a square image at least 512x512 pixels.
                    </p>
                </CardHeader>
                <CardContent>
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                fileInputRef.current?.click();
                            }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label="Drop image file here or click to select"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={[
                                'image/png',
                                'image/jpeg',
                                'image/jpg',
                                'image/svg+xml',
                                'image/webp',
                                'image/gif'
                            ].join(',')}
                            onChange={handleFileInputChange}
                            className="sr-only"
                            aria-describedby="file-upload-description"
                        />

                        <div className="space-y-4">
                            <div className="text-4xl">🖼️</div>
                            <div>
                                <p className="text-lg font-medium">
                                    Drop your image here, or{' '}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-blue-600 hover:text-blue-700 underline"
                                    >
                                        browse
                                    </button>
                                </p>
                                <p id="file-upload-description" className="text-sm text-gray-500 mt-2">
                                    Supported formats: PNG, JPEG, SVG, WebP, GIF
                                    <br />
                                    Maximum file size: {Math.round(FAVICON_FILE_LIMITS.maxFileSize / (1024 * 1024))}MB
                                </p>
                            </div>
                        </div>

                        {state.sourceImage && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                                <p className="text-sm font-medium text-green-800">
                                    Selected: {state.sourceImage.name}
                                </p>
                                <p className="text-xs text-green-600">
                                    Size: {Math.round(state.sourceImage.size / 1024)}KB
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Validation Errors and Warnings */}
                    {state.error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm font-medium text-red-800">Error:</p>
                            <p className="text-sm text-red-600">{state.error}</p>
                        </div>
                    )}

                    {state.warnings.length > 0 && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm font-medium text-yellow-800">Warnings:</p>
                            <ul className="text-sm text-yellow-600 list-disc list-inside">
                                {state.warnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Size Selection */}
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">Select Favicon Sizes</h2>
                    <p className="text-sm text-gray-600">
                        Choose which favicon sizes to generate. Different sizes are used for different purposes.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(FAVICON_SIZES).map(([key, size]) => (
                            <label
                                key={key}
                                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${state.options.sizes.includes(key as FaviconSizeKey)
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={state.options.sizes.includes(key as FaviconSizeKey)}
                                    onChange={() => handleSizeToggle(key as FaviconSizeKey)}
                                    className="mr-3"
                                />
                                <div>
                                    <p className="font-medium">{size.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {size.width}×{size.height} ({size.format.toUpperCase()})
                                    </p>
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="mt-4 flex space-x-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOptionsChange({
                                sizes: Object.keys(FAVICON_SIZES) as FaviconSizeKey[]
                            })}
                        >
                            Select All
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOptionsChange({ sizes: [] })}
                        >
                            Clear All
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Generation Options */}
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">Generation Options</h2>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Background Color with ColorPicker */}
                        <div>
                            <ColorPicker
                                value={
                                    state.options.backgroundColor === 'transparent'
                                        ? 'transparent'
                                        : state.options.customBackgroundColor || state.options.backgroundColor || 'transparent'
                                }
                                onChange={(color) => {
                                    if (color === 'transparent') {
                                        handleOptionsChange({
                                            backgroundColor: 'transparent',
                                            customBackgroundColor: undefined
                                        });
                                    } else {
                                        handleOptionsChange({
                                            backgroundColor: color,
                                            customBackgroundColor: color
                                        });
                                    }
                                }}
                                label="Background Color"
                                presetColors={[
                                    { name: 'Transparent', value: 'transparent', description: 'No background' },
                                    { name: 'White', value: '#ffffff', description: 'White background' },
                                    { name: 'Black', value: '#000000', description: 'Black background' },
                                    { name: 'Light Gray', value: '#f5f5f5', description: 'Light gray background' },
                                    { name: 'Dark Gray', value: '#333333', description: 'Dark gray background' },
                                    { name: 'Blue', value: '#2563eb', description: 'Blue brand color' },
                                    { name: 'Green', value: '#16a34a', description: 'Green brand color' },
                                    { name: 'Red', value: '#dc2626', description: 'Red brand color' }
                                ]}
                                allowCustom={true}
                            />
                        </div>

                        {/* Padding */}
                        <div>
                            <label htmlFor="padding" className="block text-sm font-medium mb-2">
                                Padding: {state.options.padding || 0}px
                            </label>
                            <input
                                id="padding"
                                type="range"
                                min="0"
                                max="20"
                                value={state.options.padding || 0}
                                onChange={(e) => handleOptionsChange({ padding: parseInt(e.target.value) })}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>No padding</span>
                                <span>Maximum padding</span>
                            </div>
                        </div>

                        {/* Output Format and Quality */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Output Format
                                </label>
                                <select
                                    value={state.options.outputFormat || 'png'}
                                    onChange={(e) => handleOptionsChange({
                                        outputFormat: e.target.value as 'png' | 'webp' | 'jpeg'
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="png">PNG (Recommended)</option>
                                    <option value="webp">WebP (Smaller size)</option>
                                    <option value="jpeg">JPEG (No transparency)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    PNG provides best quality and transparency support
                                </p>
                            </div>

                            <div>
                                <label htmlFor="quality" className="block text-sm font-medium mb-2">
                                    Quality: {Math.round((state.options.quality || 0.9) * 100)}%
                                </label>
                                <input
                                    id="quality"
                                    type="range"
                                    min="0.6"
                                    max="1.0"
                                    step="0.1"
                                    value={state.options.quality || 0.9}
                                    onChange={(e) => handleOptionsChange({ quality: parseFloat(e.target.value) })}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Smaller</span>
                                    <span>Best quality</span>
                                </div>
                            </div>
                        </div>

                        {/* Additional Options */}
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={state.options.generateManifest}
                                    onChange={(e) => handleOptionsChange({ generateManifest: e.target.checked })}
                                    className="mr-2"
                                />
                                Generate web app manifest.json
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={state.options.generateICO}
                                    onChange={(e) => handleOptionsChange({ generateICO: e.target.checked })}
                                    className="mr-2"
                                />
                                Generate .ico files
                            </label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced Real-time Preview */}
            {state.showPreview && Object.keys(state.previewUrls).length > 0 && (
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Enhanced Preview</h2>
                        <p className="text-sm text-gray-600">
                            See how your favicons will look in different contexts with realistic simulations
                        </p>
                    </CardHeader>
                    <CardContent>
                        <FaviconPreview
                            previewUrls={state.previewUrls}
                            selectedContext={state.options.previewContext}
                            onContextChange={(context) => handleOptionsChange({ previewContext: context as 'browser' | 'bookmark' | 'desktop' | 'all' })}
                            title="Context Preview"
                        />
                    </CardContent>
                </Card>
            )}

            {/* Generate Button */}
            <div className="text-center">
                <Button
                    onClick={handleGenerate}
                    disabled={!state.sourceImage || state.isProcessing || state.options.sizes.length === 0}
                    size="lg"
                    className="min-w-48"
                >
                    {state.isProcessing ? 'Generating...' : 'Generate Favicons'}
                </Button>
            </div>

            {/* Progress Indicator */}
            {state.isProcessing && state.progress && (
                <Card>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700">{state.progress.currentStep}</span>
                                <span className="text-gray-500">{state.progress.percentage}%</span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar"
                                aria-valuenow={state.progress.percentage} aria-valuemin={0} aria-valuemax={100}
                                aria-label="Favicon generation progress">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${state.progress.percentage}%` }}
                                />
                            </div>

                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>
                                    {state.progress.completed} of {state.progress.total} complete
                                </span>
                                {state.progress.estimatedTimeRemaining && state.progress.estimatedTimeRemaining > 1 && (
                                    <span>{Math.round(state.progress.estimatedTimeRemaining / 1000)}s remaining</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {state.result?.success && state.result.favicons && (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Generated Favicons</h2>
                            <Button onClick={downloadAllFavicons}>
                                Download All as ZIP
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {state.result.favicons.map((favicon, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="text-center mb-3">
                                        <img
                                            src={favicon.dataUrl}
                                            alt={`Favicon ${favicon.size.width}x${favicon.size.height}`}
                                            className="mx-auto"
                                            style={{
                                                width: Math.min(favicon.size.width, 64),
                                                height: Math.min(favicon.size.height, 64),
                                                imageRendering: 'pixelated'
                                            }}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium">{favicon.size.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {favicon.size.width}×{favicon.size.height}
                                        </p>
                                        <div className="mt-2 space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => downloadFavicon(favicon)}
                                            >
                                                Download
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => copyToClipboard(favicon)}
                                            >
                                                Copy URL
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {state.result.manifestJson && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-medium mb-2">Web App Manifest (manifest.json)</h3>
                                <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
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