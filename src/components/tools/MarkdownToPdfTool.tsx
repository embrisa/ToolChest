"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  DocumentTextIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
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

const MODE_OPTIONS = [
  { value: "editor", label: "Editor" },
  { value: "upload", label: "Upload File" },
];

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
                  className="prose prose-sm max-w-none h-96 overflow-auto surface rounded-xl p-6 shadow-soft border border-neutral-200"
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
      </div>
    </ErrorBoundary>
  );
}
