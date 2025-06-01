"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  DocumentTextIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  Cog6ToothIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { AriaLiveRegion } from "@/components/ui/AriaLiveRegion";
import { markdownToPdfService } from "@/services/tools/markdownToPdfService";
import {
  MarkdownToPdfState,
  MarkdownMode,
  PdfStylingOptions,
  DEFAULT_PDF_STYLING,
  DEFAULT_MARKDOWN_OPTIONS,
  MarkdownToPdfProgress,
  MarkdownParseResult,
  PDF_TEMPLATES,
} from "@/types/tools/markdownToPdf";

export function MarkdownToPdfTool() {
  const [state, setState] = useState<MarkdownToPdfState>({
    mode: "editor",
    markdownContent:
      '# Welcome to Markdown-to-PDF\n\nType your **markdown** here and see the live preview with comprehensive **GitHub Flavored Markdown** support.\n\n## Features\n\n- [x] GitHub Flavored Markdown (GFM) support\n- [x] Live preview with real-time updates\n- [x] Multiple PDF formats (A4, Letter, Legal)\n- [x] Custom styling and themes\n- [x] File upload support\n- [ ] Advanced features coming soon\n\n### Code Syntax Highlighting\n\nSupports multiple programming languages:\n\n```javascript\n// JavaScript example\nconst greeting = "Hello, World!";\nconsole.log(greeting);\n\nfunction fibonacci(n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n```\n\n```python\n# Python example\ndef greet(name):\n    """Print a greeting message."""\n    print(f"Hello, {name}!")\n\nif __name__ == "__main__":\n    greet("World")\n```\n\n### Tables with GFM Support\n\n| Feature | Status | Description |\n|---------|--------|-------------|\n| **Tables** | ✅ | Full GFM table support |\n| **Task Lists** | ✅ | Interactive checkboxes |\n| **Strikethrough** | ✅ | ~~Old text~~ becomes strikethrough |\n| **Syntax Highlighting** | ✅ | Multiple languages supported |\n| **Links & Images** | ✅ | Auto-linking and image embedding |\n\n### Blockquotes and Text Formatting\n\n> This is a blockquote that demonstrates how quoted text appears in the PDF output.\n> \n> It can span multiple lines and includes proper formatting.\n\n**Bold text**, *italic text*, `inline code`, and ~~strikethrough~~ are all supported.\n\n### Lists and Nested Content\n\n1. **Ordered lists** work perfectly\n   - With nested bullet points\n   - And multiple levels\n2. **Task lists** with checkboxes\n   - [x] Completed task\n   - [ ] Pending task\n3. **Mixed content** in lists:\n   \n   ```bash\n   # You can include code blocks\n   npm install markdown-it\n   ```\n   \n   And regular paragraphs with **formatting**.\n\n---\n\n*Ready to create your PDF? Edit this content or upload your own markdown file!*',
    markdownFile: null,
    pdfResult: null,
    isProcessing: false,
    progress: null,
    previewHtml: "",
    error: null,
    warnings: [],
    validationErrors: [],
    stylingOptions: DEFAULT_PDF_STYLING,
    markdownOptions: DEFAULT_MARKDOWN_OPTIONS,
    showPreview: true,
    splitPaneSize: 50,
  });

  const [currentAnnouncement, setCurrentAnnouncement] = useState<{
    message: string;
    type: "polite" | "assertive";
    timestamp: number;
  } | null>(null);
  const [parseResult, setParseResult] = useState<MarkdownParseResult | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Parse markdown and update preview
  const updatePreview = useCallback(async () => {
    try {
      const result = markdownToPdfService.parseMarkdown(
        state.markdownContent,
        state.markdownOptions,
      );
      setParseResult(result);
      setState((prev) => ({ ...prev, previewHtml: result.html, error: null }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to parse markdown";
      setState((prev) => ({ ...prev, error: errorMessage }));
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
  const addAnnouncement = useCallback(
    (message: string, type: "polite" | "assertive" = "polite") => {
      setCurrentAnnouncement({ message, type, timestamp: Date.now() });
      setTimeout(() => {
        setCurrentAnnouncement(null);
      }, 5000);
    },
    [],
  );

  // Handle mode change
  const handleModeChange = useCallback(
    (mode: MarkdownMode) => {
      setState((prev) => ({ ...prev, mode, error: null, warnings: [] }));
      addAnnouncement(`Switched to ${mode} mode`);
    },
    [addAnnouncement],
  );

  // Handle markdown content change
  const handleContentChange = useCallback((content: string) => {
    setState((prev) => ({ ...prev, markdownContent: content, error: null }));
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        setState((prev) => ({
          ...prev,
          isProcessing: true,
          error: null,
          warnings: [],
        }));
        addAnnouncement("Validating uploaded file...");

        const validation =
          await markdownToPdfService.validateMarkdownFile(file);

        if (!validation.isValid) {
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            error: validation.error || null,
          }));
          addAnnouncement(`File validation failed: ${validation.error}`);
          return;
        }

        if (validation.warnings?.length) {
          setState((prev) => ({
            ...prev,
            warnings: validation.warnings || [],
          }));
          validation.warnings.forEach((warning) =>
            addAnnouncement(`Warning: ${warning}`),
          );
        }

        // Read file content
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || "");
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsText(file);
        });

        setState((prev) => ({
          ...prev,
          markdownFile: file,
          markdownContent: content,
          isProcessing: false,
        }));

        addAnnouncement(
          `File uploaded successfully: ${validation.wordCount} words, ${validation.lineCount} lines`,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to upload file";
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          error: errorMessage,
        }));
        addAnnouncement(`Upload failed: ${errorMessage}`);
      }
    },
    [addAnnouncement],
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const file = files[0];
      await handleFileUpload(file);
    },
    [handleFileUpload],
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleFileUpload(file);
      }
    },
    [handleFileUpload],
  );

  // Generate PDF
  const handleGeneratePdf = useCallback(async () => {
    if (!state.markdownContent.trim()) {
      addAnnouncement("Please enter some markdown content first");
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        isProcessing: true,
        progress: null,
        error: null,
      }));
      addAnnouncement("Starting PDF generation...");

      const onProgress = (progress: MarkdownToPdfProgress) => {
        setState((prev) => ({ ...prev, progress }));
        addAnnouncement(progress.currentStep);
      };

      const result = await markdownToPdfService.generatePdf(
        state.previewHtml,
        state.stylingOptions,
        onProgress,
      );

      if (result.success && result.pdfBlob) {
        setState((prev) => ({
          ...prev,
          pdfResult: result,
          isProcessing: false,
          progress: null,
        }));
        addAnnouncement(
          `PDF generated successfully! ${result.pageCount} pages, ${Math.round((result.fileSize || 0) / 1024)} KB`,
        );
      } else {
        throw new Error(result.error || "PDF generation failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate PDF";
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        progress: null,
        error: errorMessage,
      }));
      addAnnouncement(`PDF generation failed: ${errorMessage}`);
    }
  }, [
    state.markdownContent,
    state.previewHtml,
    state.stylingOptions,
    addAnnouncement,
  ]);

  // Download PDF
  const handleDownloadPdf = useCallback(() => {
    if (!state.pdfResult?.pdfBlob) {
      addAnnouncement("No PDF available to download");
      return;
    }

    try {
      const downloadOptions = markdownToPdfService.createDownloadOptions(
        state.pdfResult.pdfBlob,
        undefined,
        state.pdfResult.metadata,
      );

      markdownToPdfService.downloadPdf(downloadOptions);
      addAnnouncement(`PDF downloaded: ${downloadOptions.filename}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Download failed";
      setState((prev) => ({ ...prev, error: errorMessage }));
      addAnnouncement(`Download failed: ${errorMessage}`);
    }
  }, [state.pdfResult, addAnnouncement]);

  // Handle styling option changes
  const handleStylingChange = useCallback(
    (updates: Partial<PdfStylingOptions>) => {
      setState((prev) => ({
        ...prev,
        stylingOptions: { ...prev.stylingOptions, ...updates },
      }));
    },
    [],
  );

  // Handle markdown option changes (for future use)
  // const handleMarkdownOptionsChange = useCallback((updates: Partial<MarkdownOptions>) => {
  //     setState(prev => ({
  //         ...prev,
  //         markdownOptions: { ...prev.markdownOptions, ...updates }
  //     }));
  // }, []);

  // Apply template
  const handleApplyTemplate = useCallback(
    (templateId: string) => {
      const template = PDF_TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        handleStylingChange(template.stylingOptions);
        addAnnouncement(`Applied ${template.name} template`);
      }
    },
    [handleStylingChange, addAnnouncement],
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Accessibility announcements */}
      <AriaLiveRegion announcement={currentAnnouncement} />

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="tool-icon tool-icon-markdown mx-auto">
          <span className="text-2xl">📄</span>
        </div>
        <div>
          <h1 className="text-display text-4xl font-bold text-gradient-brand mb-2">
            Markdown to PDF
          </h1>
          <p className="text-body text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Convert your Markdown documents to beautiful PDFs with custom
            styling. Full GitHub Flavored Markdown support with live preview.
          </p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1">
          <Button
            variant={state.mode === "editor" ? "primary" : "ghost"}
            size="sm"
            onClick={() => handleModeChange("editor")}
            className="rounded-lg"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Editor
          </Button>
          <Button
            variant={state.mode === "upload" ? "primary" : "ghost"}
            size="sm"
            onClick={() => handleModeChange("upload")}
            className="rounded-lg"
          >
            <CloudArrowUpIcon className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>
      </div>

      {/* File Upload Area (when in upload mode) */}
      {state.mode === "upload" && (
        <Card className="tool-card tool-card-markdown">
          <div className="p-8">
            <div
              className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-2xl p-12 text-center hover:border-warning-400 hover:bg-warning-50/50 dark:hover:bg-warning-950/10 transition-all duration-200"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center mb-6">
                <CloudArrowUpIcon className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="markdown-file" className="cursor-pointer">
                    <span className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                      Drop your markdown file here, or{" "}
                      <span className="text-warning-600 dark:text-warning-400 hover:text-warning-700 dark:hover:text-warning-300">
                        browse files
                      </span>
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
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Supported formats: .md, .markdown, .txt • Max 10MB
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {state.error && (
        <Card className="border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-950/20 animate-fade-in-up">
          <div className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-error-100 dark:bg-error-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-error-600 dark:text-error-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-error-900 dark:text-error-100">
                Error
              </h3>
              <p className="text-error-700 dark:text-error-300 mt-1">
                {state.error}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Warnings Display */}
      {state.warnings.length > 0 && (
        <Card className="border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-950/20 animate-fade-in-up">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-warning-100 dark:bg-warning-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-warning-900 dark:text-warning-100">
                  Warnings
                </h3>
                <ul className="text-warning-700 dark:text-warning-300 mt-2 space-y-1">
                  {state.warnings.map((warning, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-warning-500 rounded-full mr-3"></span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Processing Progress */}
      {state.isProcessing && state.progress && (
        <Card className="border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-950/20 animate-fade-in-up">
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/50 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-warning-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-title text-lg font-semibold text-warning-900 dark:text-warning-100">
                    {state.progress.currentStep}
                  </h3>
                  <p className="text-warning-700 dark:text-warning-300 text-sm mt-1">
                    Processing your markdown document...
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                    {Math.round(state.progress.progress)}%
                  </div>
                  <div className="text-sm text-warning-600 dark:text-warning-400">
                    Complete
                  </div>
                </div>
              </div>

              <div
                className="w-full bg-warning-200 dark:bg-warning-800 rounded-full h-3 overflow-hidden"
                role="progressbar"
                aria-valuenow={state.progress.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="PDF generation progress"
              >
                <div
                  className="bg-gradient-to-r from-warning-500 to-warning-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${state.progress.progress}%` }}
                />
              </div>

              {state.progress.estimatedTimeRemaining &&
                state.progress.estimatedTimeRemaining > 1 && (
                  <div className="flex items-center justify-center gap-2 text-warning-700 dark:text-warning-300">
                    <ClockIcon className="h-4 w-4" />
                    <span className="text-sm">
                      Estimated time remaining:{" "}
                      {Math.round(state.progress.estimatedTimeRemaining)}s
                    </span>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Generation Success */}
      {state.pdfResult && (
        <Card className="border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-950/20 animate-fade-in-up">
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-title text-lg font-semibold text-success-900 dark:text-success-100">
                  PDF Generated Successfully!
                </h3>
                <div className="text-success-700 dark:text-success-300 mt-2 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-success-100 dark:bg-success-900/30 rounded-lg">
                    <div className="font-semibold">
                      {state.pdfResult.pageCount}
                    </div>
                    <div className="text-sm">Pages</div>
                  </div>
                  <div className="text-center p-3 bg-success-100 dark:bg-success-900/30 rounded-lg">
                    <div className="font-semibold">
                      {Math.round((state.pdfResult.fileSize || 0) / 1024)} KB
                    </div>
                    <div className="text-sm">File Size</div>
                  </div>
                  <div className="text-center p-3 bg-success-100 dark:bg-success-900/30 rounded-lg">
                    <div className="font-semibold">
                      {state.pdfResult.processingTime}ms
                    </div>
                    <div className="text-sm">Processing</div>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleDownloadPdf}
                size="lg"
                className="bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 flex items-center gap-2"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Editor/Preview Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Area */}
        <Card className="tool-card tool-card-markdown">
          <CardHeader>
            <h2 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-warning-100 dark:bg-warning-900/50 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
              Markdown Editor
            </h2>
            {parseResult && (
              <div className="mt-3 flex flex-wrap gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {parseResult.wordCount} words
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-brand-100 dark:bg-brand-900/50 text-sm font-medium text-brand-700 dark:text-brand-300">
                  {parseResult.readingTime} min read
                </span>
                {parseResult.tables > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-success-100 dark:bg-success-900/50 text-sm font-medium text-success-700 dark:text-success-300">
                    {parseResult.tables} tables
                  </span>
                )}
                {parseResult.codeBlocks > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-accent-100 dark:bg-accent-900/50 text-sm font-medium text-accent-700 dark:text-accent-300">
                    {parseResult.codeBlocks} code blocks
                  </span>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <textarea
              ref={textareaRef}
              value={state.markdownContent}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Type your markdown here..."
              className="w-full h-96 p-4 border border-neutral-300 dark:border-neutral-600 rounded-xl text-code text-sm resize-none focus:ring-2 focus:ring-warning-500/50 focus:border-warning-400 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-all duration-200"
              aria-label="Markdown content editor"
            />
            <div className="mt-4 flex justify-between items-center text-sm text-neutral-500 dark:text-neutral-400">
              <span>GitHub Flavored Markdown supported</span>
              <span>{state.markdownContent.length} characters</span>
            </div>
          </CardContent>
        </Card>

        {/* Preview Area */}
        {state.showPreview && (
          <Card className="tool-card tool-card-markdown">
            <CardHeader>
              <h2 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/50 rounded-lg flex items-center justify-center">
                  <EyeIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                Live Preview
              </h2>
              <p className="text-body text-neutral-600 dark:text-neutral-400 mt-2">
                Real-time preview of your formatted document
              </p>
            </CardHeader>
            <CardContent>
              <div
                ref={previewRef}
                className="prose prose-sm dark:prose-invert max-w-none h-96 overflow-auto surface rounded-xl p-6 shadow-soft border border-neutral-200 dark:border-neutral-700"
                dangerouslySetInnerHTML={{ __html: state.previewHtml }}
                aria-label="Markdown preview"
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Generate PDF Button */}
      <div className="text-center">
        <Button
          onClick={handleGeneratePdf}
          disabled={!state.markdownContent.trim() || state.isProcessing}
          size="lg"
          className="min-w-48 bg-gradient-to-r from-warning-500 to-warning-600 hover:from-warning-600 hover:to-warning-700"
        >
          {state.isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Generating PDF...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <DocumentArrowDownIcon className="h-5 w-5" />
              Generate PDF
            </div>
          )}
        </Button>
        {!state.markdownContent.trim() && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            Enter some markdown content to generate your PDF
          </p>
        )}
      </div>

      {/* Quick Templates */}
      <Card className="tool-card tool-card-markdown">
        <CardHeader>
          <h2 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-100 dark:bg-accent-900/50 rounded-lg flex items-center justify-center">
              <Cog6ToothIcon className="h-5 w-5 text-accent-600 dark:text-accent-400" />
            </div>
            Quick Templates
          </h2>
          <p className="text-body text-neutral-600 dark:text-neutral-400 mt-2">
            Apply pre-configured styling templates for professional PDFs
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PDF_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleApplyTemplate(template.id)}
                className="group p-4 text-center border-2 border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-warning-400 hover:bg-warning-50/50 dark:hover:bg-warning-950/10 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-warning-500/50"
              >
                <div className="space-y-2">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {template.name}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {template.description}
                  </div>
                  {template.recommended && (
                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-success-100 dark:bg-success-900/50 text-xs font-medium text-success-700 dark:text-success-300">
                      Recommended
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
