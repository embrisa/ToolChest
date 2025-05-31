'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    DocumentTextIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    Cog6ToothIcon,
    CloudArrowUpIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AriaLiveRegion } from '@/components/ui/AriaLiveRegion';
import { markdownToPdfService } from '@/services/tools/markdownToPdfService';
import {
    MarkdownToPdfState,
    MarkdownMode,
    PdfStylingOptions,
    DEFAULT_PDF_STYLING,
    DEFAULT_MARKDOWN_OPTIONS,
    MarkdownToPdfProgress,
    MarkdownParseResult,
    PDF_TEMPLATES,
} from '@/types/tools/markdownToPdf';

export function MarkdownToPdfTool() {
    const [state, setState] = useState<MarkdownToPdfState>({
        mode: 'editor',
        markdownContent: '# Welcome to Markdown-to-PDF\n\nType your **markdown** here and see the live preview with comprehensive **GitHub Flavored Markdown** support.\n\n## Features\n\n- [x] GitHub Flavored Markdown (GFM) support\n- [x] Live preview with real-time updates\n- [x] Multiple PDF formats (A4, Letter, Legal)\n- [x] Custom styling and themes\n- [x] File upload support\n- [ ] Advanced features coming soon\n\n### Code Syntax Highlighting\n\nSupports multiple programming languages:\n\n```javascript\n// JavaScript example\nconst greeting = "Hello, World!";\nconsole.log(greeting);\n\nfunction fibonacci(n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n```\n\n```python\n# Python example\ndef greet(name):\n    """Print a greeting message."""\n    print(f"Hello, {name}!")\n\nif __name__ == "__main__":\n    greet("World")\n```\n\n### Tables with GFM Support\n\n| Feature | Status | Description |\n|---------|--------|-------------|\n| **Tables** | ✅ | Full GFM table support |\n| **Task Lists** | ✅ | Interactive checkboxes |\n| **Strikethrough** | ✅ | ~~Old text~~ becomes strikethrough |\n| **Syntax Highlighting** | ✅ | Multiple languages supported |\n| **Links & Images** | ✅ | Auto-linking and image embedding |\n\n### Blockquotes and Text Formatting\n\n> This is a blockquote that demonstrates how quoted text appears in the PDF output.\n> \n> It can span multiple lines and includes proper formatting.\n\n**Bold text**, *italic text*, `inline code`, and ~~strikethrough~~ are all supported.\n\n### Lists and Nested Content\n\n1. **Ordered lists** work perfectly\n   - With nested bullet points\n   - And multiple levels\n2. **Task lists** with checkboxes\n   - [x] Completed task\n   - [ ] Pending task\n3. **Mixed content** in lists:\n   \n   ```bash\n   # You can include code blocks\n   npm install markdown-it\n   ```\n   \n   And regular paragraphs with **formatting**.\n\n---\n\n*Ready to create your PDF? Edit this content or upload your own markdown file!*',
        markdownFile: null,
        pdfResult: null,
        isProcessing: false,
        progress: null,
        previewHtml: '',
        error: null,
        warnings: [],
        validationErrors: [],
        stylingOptions: DEFAULT_PDF_STYLING,
        markdownOptions: DEFAULT_MARKDOWN_OPTIONS,
        showPreview: true,
        splitPaneSize: 50,
    });

    const [currentAnnouncement, setCurrentAnnouncement] = useState<{ message: string; type: 'polite' | 'assertive'; timestamp: number } | null>(null);
    const [parseResult, setParseResult] = useState<MarkdownParseResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    // Parse markdown and update preview
    const updatePreview = useCallback(async () => {
        try {
            const result = markdownToPdfService.parseMarkdown(
                state.markdownContent,
                state.markdownOptions
            );
            setParseResult(result);
            setState(prev => ({ ...prev, previewHtml: result.html, error: null }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to parse markdown';
            setState(prev => ({ ...prev, error: errorMessage }));
        }
    }, [state.markdownContent, state.markdownOptions]);

    // Update preview when content or options change
    useEffect(() => {
        if (state.markdownContent) {
            const timeoutId = setTimeout(updatePreview, 300); // Debounce
            return () => clearTimeout(timeoutId);
        }
    }, [state.markdownContent, state.markdownOptions, updatePreview]);

    // Helper function to add accessibility announcements
    const addAnnouncement = useCallback((message: string, type: 'polite' | 'assertive' = 'polite') => {
        setCurrentAnnouncement({ message, type, timestamp: Date.now() });
        setTimeout(() => {
            setCurrentAnnouncement(null);
        }, 5000);
    }, []);

    // Handle mode change
    const handleModeChange = useCallback((mode: MarkdownMode) => {
        setState(prev => ({ ...prev, mode, error: null, warnings: [] }));
        addAnnouncement(`Switched to ${mode} mode`);
    }, [addAnnouncement]);

    // Handle markdown content change
    const handleContentChange = useCallback((content: string) => {
        setState(prev => ({ ...prev, markdownContent: content, error: null }));
    }, []);

    // Handle file upload
    const handleFileUpload = useCallback(async (file: File) => {
        try {
            setState(prev => ({ ...prev, isProcessing: true, error: null, warnings: [] }));
            addAnnouncement('Validating uploaded file...');

            const validation = await markdownToPdfService.validateMarkdownFile(file);

            if (!validation.isValid) {
                setState(prev => ({
                    ...prev,
                    isProcessing: false,
                    error: validation.error || null
                }));
                addAnnouncement(`File validation failed: ${validation.error}`);
                return;
            }

            if (validation.warnings?.length) {
                setState(prev => ({ ...prev, warnings: validation.warnings || [] }));
                validation.warnings.forEach(warning => addAnnouncement(`Warning: ${warning}`));
            }

            // Read file content
            const content = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string || '');
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsText(file);
            });

            setState(prev => ({
                ...prev,
                markdownFile: file,
                markdownContent: content,
                isProcessing: false,
            }));

            addAnnouncement(`File uploaded successfully: ${validation.wordCount} words, ${validation.lineCount} lines`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
            setState(prev => ({
                ...prev,
                isProcessing: false,
                error: errorMessage
            }));
            addAnnouncement(`Upload failed: ${errorMessage}`);
        }
    }, [addAnnouncement]);

    // Handle drag and drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        const file = files[0];
        await handleFileUpload(file);
    }, [handleFileUpload]);

    // Handle file input change
    const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleFileUpload(file);
        }
    }, [handleFileUpload]);

    // Generate PDF
    const handleGeneratePdf = useCallback(async () => {
        if (!state.markdownContent.trim()) {
            addAnnouncement('Please enter some markdown content first');
            return;
        }

        try {
            setState(prev => ({ ...prev, isProcessing: true, progress: null, error: null }));
            addAnnouncement('Starting PDF generation...');

            const onProgress = (progress: MarkdownToPdfProgress) => {
                setState(prev => ({ ...prev, progress }));
                addAnnouncement(progress.currentStep);
            };

            const result = await markdownToPdfService.generatePdf(
                state.previewHtml,
                state.stylingOptions,
                onProgress
            );

            if (result.success && result.pdfBlob) {
                setState(prev => ({ ...prev, pdfResult: result, isProcessing: false, progress: null }));
                addAnnouncement(`PDF generated successfully! ${result.pageCount} pages, ${Math.round((result.fileSize || 0) / 1024)} KB`);
            } else {
                throw new Error(result.error || 'PDF generation failed');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF';
            setState(prev => ({
                ...prev,
                isProcessing: false,
                progress: null,
                error: errorMessage
            }));
            addAnnouncement(`PDF generation failed: ${errorMessage}`);
        }
    }, [state.markdownContent, state.previewHtml, state.stylingOptions, addAnnouncement]);

    // Download PDF
    const handleDownloadPdf = useCallback(() => {
        if (!state.pdfResult?.pdfBlob) {
            addAnnouncement('No PDF available to download');
            return;
        }

        try {
            const downloadOptions = markdownToPdfService.createDownloadOptions(
                state.pdfResult.pdfBlob,
                undefined,
                state.pdfResult.metadata
            );

            markdownToPdfService.downloadPdf(downloadOptions);
            addAnnouncement(`PDF downloaded: ${downloadOptions.filename}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Download failed';
            setState(prev => ({ ...prev, error: errorMessage }));
            addAnnouncement(`Download failed: ${errorMessage}`);
        }
    }, [state.pdfResult, addAnnouncement]);

    // Handle styling option changes
    const handleStylingChange = useCallback((updates: Partial<PdfStylingOptions>) => {
        setState(prev => ({
            ...prev,
            stylingOptions: { ...prev.stylingOptions, ...updates }
        }));
    }, []);

    // Handle markdown option changes (for future use)
    // const handleMarkdownOptionsChange = useCallback((updates: Partial<MarkdownOptions>) => {
    //     setState(prev => ({
    //         ...prev,
    //         markdownOptions: { ...prev.markdownOptions, ...updates }
    //     }));
    // }, []);

    // Apply template
    const handleApplyTemplate = useCallback((templateId: string) => {
        const template = PDF_TEMPLATES.find(t => t.id === templateId);
        if (template) {
            handleStylingChange(template.stylingOptions);
            addAnnouncement(`Applied ${template.name} template`);
        }
    }, [handleStylingChange, addAnnouncement]);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Accessibility announcements */}
            <AriaLiveRegion announcement={currentAnnouncement} />

            {/* Mode Selection */}
            <Card>
                <div className="p-4">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-2">
                            <Button
                                variant={state.mode === 'editor' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => handleModeChange('editor')}
                                className="flex items-center gap-2"
                            >
                                <DocumentTextIcon className="h-4 w-4" />
                                Editor
                            </Button>
                            <Button
                                variant={state.mode === 'upload' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => handleModeChange('upload')}
                                className="flex items-center gap-2"
                            >
                                <CloudArrowUpIcon className="h-4 w-4" />
                                Upload File
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setState(prev => ({ ...prev, showPreview: !prev.showPreview }))}
                                className="flex items-center gap-2"
                            >
                                <EyeIcon className="h-4 w-4" />
                                {state.showPreview ? 'Hide' : 'Show'} Preview
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleGeneratePdf}
                                disabled={state.isProcessing || !state.markdownContent.trim()}
                                className="flex items-center gap-2"
                            >
                                <DocumentArrowDownIcon className="h-4 w-4" />
                                Generate PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* File Upload Area (when in upload mode) */}
            {state.mode === 'upload' && (
                <Card>
                    <div className="p-6">
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4">
                                <label htmlFor="markdown-file" className="cursor-pointer">
                                    <span className="mt-2 block text-sm font-medium text-gray-900">
                                        Drop a markdown file here, or{' '}
                                        <span className="text-blue-600 hover:text-blue-500">browse</span>
                                    </span>
                                </label>
                                <input
                                    ref={fileInputRef}
                                    id="markdown-file"
                                    type="file"
                                    accept=".md,.markdown,.txt"
                                    onChange={handleFileInputChange}
                                    className="sr-only"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Supported formats: .md, .markdown, .txt (up to 10MB)
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Error Display */}
            {state.error && (
                <Card className="border-red-200 bg-red-50">
                    <div className="p-4 flex items-start gap-3">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{state.error}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Warnings Display */}
            {state.warnings.length > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-yellow-800">Warnings</h3>
                                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                                    {state.warnings.map((warning, index) => (
                                        <li key={index}>• {warning}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Processing Progress */}
            {state.isProcessing && state.progress && (
                <Card>
                    <div className="p-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700">{state.progress.currentStep}</span>
                                <span className="text-gray-500">{Math.round(state.progress.progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar"
                                aria-valuenow={state.progress.progress} aria-valuemin={0} aria-valuemax={100}
                                aria-label={`PDF generation progress`}>
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${state.progress.progress}%` }}
                                />
                            </div>
                            {state.progress.estimatedTimeRemaining && (
                                <div className="text-xs text-gray-500">
                                    Estimated time remaining: {Math.round(state.progress.estimatedTimeRemaining)}s
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* PDF Generation Success */}
            {state.pdfResult && (
                <Card className="border-green-200 bg-green-50">
                    <div className="p-4 flex items-start gap-3">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-green-800">PDF Generated Successfully</h3>
                            <div className="text-sm text-green-700 mt-1 space-y-1">
                                <p>Pages: {state.pdfResult.pageCount}</p>
                                <p>Size: {Math.round((state.pdfResult.fileSize || 0) / 1024)} KB</p>
                                <p>Processing time: {state.pdfResult.processingTime}ms</p>
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleDownloadPdf}
                            className="flex items-center gap-2"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </Card>
            )}

            {/* Main Editor/Preview Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Editor Area */}
                <Card>
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                            <DocumentTextIcon className="h-5 w-5" />
                            Markdown Editor
                        </h2>
                        {parseResult && (
                            <div className="mt-2 text-sm text-gray-500 flex items-center gap-4">
                                <span>{parseResult.wordCount} words</span>
                                <span>{parseResult.readingTime} min read</span>
                                {parseResult.tables > 0 && <span>{parseResult.tables} tables</span>}
                                {parseResult.codeBlocks > 0 && <span>{parseResult.codeBlocks} code blocks</span>}
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <textarea
                            ref={textareaRef}
                            value={state.markdownContent}
                            onChange={(e) => handleContentChange(e.target.value)}
                            placeholder="Type your markdown here..."
                            className="w-full h-96 p-3 border border-gray-300 rounded-md font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            aria-label="Markdown content editor"
                        />
                    </div>
                </Card>

                {/* Preview Area */}
                {state.showPreview && (
                    <Card>
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                <EyeIcon className="h-5 w-5" />
                                Live Preview
                            </h2>
                        </div>
                        <div className="p-4">
                            <div
                                ref={previewRef}
                                className="prose prose-sm max-w-none h-96 overflow-auto border border-gray-200 rounded-md p-4 bg-white"
                                dangerouslySetInnerHTML={{ __html: state.previewHtml }}
                                aria-label="Markdown preview"
                            />
                        </div>
                    </Card>
                )}
            </div>

            {/* Quick Templates */}
            <Card>
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <Cog6ToothIcon className="h-5 w-5" />
                        Quick Templates
                    </h2>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {PDF_TEMPLATES.map((template) => (
                            <Button
                                key={template.id}
                                variant="secondary"
                                size="sm"
                                onClick={() => handleApplyTemplate(template.id)}
                                className="flex flex-col items-center gap-1 h-auto py-3"
                            >
                                <span className="font-medium">{template.name}</span>
                                <span className="text-xs text-gray-500 text-center">
                                    {template.description}
                                </span>
                                {template.recommended && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                        Recommended
                                    </span>
                                )}
                            </Button>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
} 