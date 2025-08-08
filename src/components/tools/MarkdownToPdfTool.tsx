"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  DocumentTextIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { AriaLiveRegion } from "@/components/ui/AriaLiveRegion";
import { ToolHeader } from "@/components/ui/ToolHeader";
import { FileUpload } from "@/components/ui/FileUpload";
import { FileInfo } from "@/components/ui/FileInfo";
import { OptionGroup } from "@/components/ui/OptionGroup";
import { ResultsPanel, ResultBadge } from "@/components/ui/ResultsPanel";
import { ProgressCard } from "@/components/ui/ProgressCard";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { Loading } from "@/components/ui/Loading";
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

// MODE_OPTIONS will be dynamically generated using translations

const DEFAULT_MARKDOWN_CONTENT = `# Welcome to Markdown-to-PDF

Type your **markdown** here and see the live preview with comprehensive **GitHub Flavored Markdown** support.

## Features

- [x] GitHub Flavored Markdown (GFM) support
- [x] Live preview with real-time updates
- [x] Multiple PDF formats (A4, Letter, Legal)
- [x] Custom styling and themes
- [x] File upload support
- [ ] Advanced features coming soon

### Code Syntax Highlighting

Supports multiple programming languages:

\`\`\`javascript
// JavaScript example
const greeting = "Hello, World!";
console.log(greeting);

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

\`\`\`python
# Python example
def greet(name):
    """Print a greeting message."""
    print(f"Hello, {name}!")

if __name__ == "__main__":
    greet("World")
\`\`\`

### Tables with GFM Support

| Feature | Status | Description |
|---------|--------|-------------|
| **Tables** | ✅ | Full GFM table support |
| **Task Lists** | ✅ | Interactive checkboxes |
| **Strikethrough** | ✅ | ~~Old text~~ becomes strikethrough |
| **Syntax Highlighting** | ✅ | Multiple languages supported |
| **Links & Images** | ✅ | Auto-linking and image embedding |

### Blockquotes and Text Formatting

> This is a blockquote that demonstrates how quoted text appears in the PDF output.
> 
> It can span multiple lines and includes proper formatting.

**Bold text**, *italic text*, \`inline code\`, and ~~strikethrough~~ are all supported.

### Lists and Nested Content

1. **Ordered lists** work perfectly
   - With nested bullet points
   - And multiple levels
2. **Task lists** with checkboxes
   - [x] Completed task
   - [ ] Pending task
3. **Mixed content** in lists:
   
   \`\`\`bash
   # You can include code blocks
   npm install markdown-it
   \`\`\`
   
   And regular paragraphs with **formatting**.

---

*Ready to create your PDF? Edit this content or upload your own markdown file!*`;

export function MarkdownToPdfTool() {
  const tCommon = useTranslations("tools.common");

  const MODE_OPTIONS = [
    { value: "editor", label: "Editor" },
    { value: "upload", label: tCommon("ui.inputTypes.upload") },
  ];

  const [state, setState] = useState<MarkdownToPdfState>({
    mode: "editor",
    markdownContent: DEFAULT_MARKDOWN_CONTENT,
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
        error instanceof Error
          ? error.message
          : tCommon("errors.processingFailed");
      setState((prev) => ({ ...prev, error: errorMessage }));
    }
  }, [state.markdownContent, state.markdownOptions, tCommon]);

  // Update preview when content or options change
  useEffect(() => {
    if (state.markdownContent) {
      const timeoutId = setTimeout(updatePreview, 300); // Debounce
      return () => clearTimeout(timeoutId);
    }
  }, [state.markdownContent, state.markdownOptions, updatePreview]);

  // Update preview CSS to match current styling options so preview == PDF
  const previewCss = markdownToPdfService.getPreviewCss(state.stylingOptions);

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
    (mode: string) => {
      setState((prev) => ({
        ...prev,
        mode: mode as MarkdownMode,
        error: null,
        warnings: [],
      }));
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
        addAnnouncement(tCommon("ui.status.processing"));

        const validation =
          await markdownToPdfService.validateMarkdownFile(file);

        if (!validation.isValid) {
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            error: validation.error || null,
          }));
          addAnnouncement(
            `${tCommon("errors.processingFailed")}: ${validation.error}`,
          );
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
          error instanceof Error ? error.message : tCommon("ui.status.error");
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          error: errorMessage,
        }));
        addAnnouncement(`${tCommon("ui.status.error")}: ${errorMessage}`);
      }
    },
    [addAnnouncement, tCommon],
  );

  // Handle file remove
  const handleFileRemove = useCallback(() => {
    setState((prev) => ({
      ...prev,
      markdownFile: null,
      markdownContent: DEFAULT_MARKDOWN_CONTENT,
    }));
    addAnnouncement("File removed");
  }, [addAnnouncement]);

  // Generate PDF
  const handleGeneratePdf = useCallback(async () => {
    if (!state.markdownContent.trim()) {
      addAnnouncement(tCommon("validation.emptyInput"));
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        isProcessing: true,
        progress: null,
        error: null,
      }));
      addAnnouncement(`${tCommon("ui.status.processing")} PDF generation...`);

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
        throw new Error(result.error || tCommon("ui.status.error"));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : tCommon("ui.status.error");
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        progress: null,
        error: errorMessage,
      }));
      addAnnouncement(
        `PDF generation ${tCommon("ui.status.error").toLowerCase()}: ${errorMessage}`,
      );
    }
  }, [
    state.markdownContent,
    state.previewHtml,
    state.stylingOptions,
    addAnnouncement,
    tCommon,
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
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Accessibility announcements */}
        <AriaLiveRegion announcement={currentAnnouncement} />

        {/* Tool Header */}
        <ToolHeader
          title="Markdown to PDF"
          description="Convert your Markdown documents to beautiful PDFs with custom styling. Full GitHub Flavored Markdown support with live preview."
          iconText="📄"
        />

        {/* Mode Selection */}
        <div className="flex justify-center">
          <OptionGroup
            label="Mode"
            value={state.mode}
            options={MODE_OPTIONS}
            onChange={handleModeChange}
          />
        </div>

        {/* File Upload Area (when in upload mode) */}
        {state.mode === "upload" && (
          <Card>
            <CardContent className="p-8">
              {state.markdownFile ? (
                <FileInfo
                  file={state.markdownFile}
                  onRemove={handleFileRemove}
                />
              ) : (
                <FileUpload
                  onFileSelect={handleFileUpload}
                  accept=".md,.markdown,.txt"
                  maxSize={10}
                  subtitle="Supported formats: .md, .markdown, .txt • Max 10MB"
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {state.error && (
          <Alert variant="error" title="Error">
            {state.error}
          </Alert>
        )}

        {/* Warnings Display */}
        {state.warnings.length > 0 && (
          <Alert variant="warning" title="Warnings">
            <ul className="space-y-1">
              {state.warnings.map((warning, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-warning-500 rounded-full mr-3"></span>
                  {warning}
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Main Editor/Preview Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-5 w-5 text-warning-600" />
                </div>
                Markdown Editor
              </CardTitle>
              {parseResult && (
                <div className="mt-3 flex flex-wrap gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-neutral-100 text-sm font-medium text-neutral-800">
                    {parseResult.wordCount} words
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-brand-100 text-sm font-medium text-brand-800">
                    {parseResult.readingTime} min read
                  </span>
                  {parseResult.tables > 0 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-success-100 text-sm font-medium text-success-800">
                      {parseResult.tables} tables
                    </span>
                  )}
                  {parseResult.codeBlocks > 0 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-accent-100 text-sm font-medium text-accent-800">
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
                className="w-full h-96 p-4 border border-neutral-300 rounded-xl text-code text-sm resize-none focus:ring-2 focus:ring-warning-500/50 focus:border-warning-400 bg-white text-neutral-900 transition-all duration-200"
                aria-label="Markdown content editor"
              />
              <div className="mt-4 flex justify-between items-center text-sm text-neutral-600">
                <span>GitHub Flavored Markdown supported</span>
                <span>{state.markdownContent.length} characters</span>
              </div>
            </CardContent>
          </Card>

          {/* Preview Area */}
          {state.showPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                    <EyeIcon className="h-5 w-5 text-brand-600" />
                  </div>
                  Live Preview
                </CardTitle>
                <p className="text-body text-neutral-700 mt-2">
                  Real-time preview of your formatted document
                </p>
              </CardHeader>
              <CardContent>
                <div
                  ref={previewRef}
                  className="max-w-none h-96 overflow-auto surface rounded-xl p-0 shadow-soft border border-neutral-200"
                  dangerouslySetInnerHTML={{ __html: `<!DOCTYPE html><html><head><style>${previewCss}</style></head><body><div class=\"pdf-content\">${state.previewHtml}</div></body></html>` }}
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
            variant="primary"
            className="min-w-48"
          >
            {state.isProcessing ? (
              <div className="flex items-center gap-2">
                <Loading size="sm" />
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
            <p className="text-sm text-neutral-600 mt-2">
              Enter some markdown content to generate your PDF
            </p>
          )}
        </div>

        {/* Processing Progress */}
        {state.isProcessing && state.progress && (
          <ProgressCard
            progress={{
              progress: state.progress.progress,
              stage: state.progress.currentStep,
              estimatedTimeRemaining: state.progress.estimatedTimeRemaining,
            }}
            title="Processing your markdown document..."
          />
        )}

        {/* PDF Generation Success */}
        {state.pdfResult && (
          <ResultsPanel
            title="PDF Generated Successfully!"
            description="Your markdown document has been converted to a professional PDF."
            variant="file"
            metadata={[
              { label: "Pages", value: state.pdfResult.pageCount || 0 },
              {
                label: "File Size",
                value: `${Math.round((state.pdfResult.fileSize || 0) / 1024)} KB`,
              },
              {
                label: "Processing Time",
                value: `${state.pdfResult.processingTime}ms`,
              },
            ]}
            onDownload={handleDownloadPdf}
            downloadLabel="Download PDF"
            badges={[
              <ResultBadge key="pages" variant="success">
                {state.pdfResult.pageCount} Pages
              </ResultBadge>,
              <ResultBadge key="size" variant="default">
                {Math.round((state.pdfResult.fileSize || 0) / 1024)} KB
              </ResultBadge>,
            ]}
          />
        )}

        {/* Quick Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                <Cog6ToothIcon className="h-5 w-5 text-accent-600" />
              </div>
              Quick Templates
            </CardTitle>
            <p className="text-body text-neutral-700 mt-2">
              Apply pre-configured styling templates for professional PDFs
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PDF_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleApplyTemplate(template.id)}
                  className="group p-4 text-center border-2 border-neutral-200 rounded-xl hover:border-warning-400 hover:bg-warning-50/50 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-warning-500/50"
                >
                  <div className="space-y-2">
                    <div className="font-bold text-neutral-900">
                      {template.name}
                    </div>
                    <div className="text-sm font-medium text-neutral-800">
                      {template.description}
                    </div>
                    {template.recommended && (
                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-success-100 text-xs font-medium text-success-700">
                        Recommended
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Styling Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                <Cog6ToothIcon className="h-5 w-5 text-brand-600" />
              </div>
              Styling Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                type="number"
                min={8}
                max={24}
                value={state.stylingOptions.fontSize}
                onChange={(e) => handleStylingChange({ fontSize: Number(e.target.value) })}
                label="Font Size (px)"
              />
              <Input
                type="number"
                step="0.05"
                min={1}
                max={2}
                value={state.stylingOptions.lineHeight}
                onChange={(e) => handleStylingChange({ lineHeight: Number(e.target.value) })}
                label="Line Height"
              />
              <Input
                type="number"
                min={5}
                max={40}
                value={state.stylingOptions.margin.top}
                onChange={(e) => handleStylingChange({ margin: { ...state.stylingOptions.margin, top: Number(e.target.value) } })}
                label="Margin Top (mm)"
              />
              <Input
                type="number"
                min={5}
                max={40}
                value={state.stylingOptions.margin.right}
                onChange={(e) => handleStylingChange({ margin: { ...state.stylingOptions.margin, right: Number(e.target.value) } })}
                label="Margin Right (mm)"
              />
              <Input
                type="number"
                min={5}
                max={40}
                value={state.stylingOptions.margin.bottom}
                onChange={(e) => handleStylingChange({ margin: { ...state.stylingOptions.margin, bottom: Number(e.target.value) } })}
                label="Margin Bottom (mm)"
              />
              <Input
                type="number"
                min={5}
                max={40}
                value={state.stylingOptions.margin.left}
                onChange={(e) => handleStylingChange({ margin: { ...state.stylingOptions.margin, left: Number(e.target.value) } })}
                label="Margin Left (mm)"
              />
              <Input
                type="text"
                value={state.stylingOptions.header?.content || ""}
                onChange={(e) => handleStylingChange({ header: { ...(state.stylingOptions.header || { enabled: true, height: 12 }), content: e.target.value, enabled: true } })}
                label="Header Text (supports {{title}} {{date}} {{pageNumber}} {{totalPages}})"
              />
              <Input
                type="number"
                min={8}
                max={20}
                value={state.stylingOptions.header?.fontSize || 11}
                onChange={(e) => handleStylingChange({ header: { ...(state.stylingOptions.header || { enabled: true }), fontSize: Number(e.target.value), enabled: true } })}
                label="Header Font Size"
              />
              <Input
                type="number"
                min={8}
                max={20}
                value={state.stylingOptions.footer?.fontSize || 11}
                onChange={(e) => handleStylingChange({ footer: { ...(state.stylingOptions.footer || { enabled: true }), fontSize: Number(e.target.value), enabled: true } })}
                label="Footer Font Size"
              />
              <Input
                type="text"
                value={state.stylingOptions.footer?.content || ""}
                onChange={(e) => handleStylingChange({ footer: { ...(state.stylingOptions.footer || { enabled: true, height: 12 }), content: e.target.value, enabled: true } })}
                label="Footer Text"
              />
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.stylingOptions.footer?.includePageNumbers ?? true}
                  onChange={(e) => handleStylingChange({ footer: { ...(state.stylingOptions.footer || { enabled: true }), includePageNumbers: e.target.checked, enabled: true } })}
                />
                <span>Include Page Numbers</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.stylingOptions.header?.enabled ?? false}
                  onChange={(e) => handleStylingChange({ header: { ...(state.stylingOptions.header || {}), enabled: e.target.checked } })}
                />
                <span>Show Header</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.stylingOptions.footer?.enabled ?? true}
                  onChange={(e) => handleStylingChange({ footer: { ...(state.stylingOptions.footer || {}), enabled: e.target.checked } })}
                />
                <span>Show Footer</span>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
