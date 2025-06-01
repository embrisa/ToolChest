import MarkdownIt from "markdown-it";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import hljs from "highlight.js";
// Import specific languages for better performance
import "highlight.js/lib/languages/javascript";
import "highlight.js/lib/languages/typescript";
import "highlight.js/lib/languages/python";
import "highlight.js/lib/languages/java";
import "highlight.js/lib/languages/cpp";
import "highlight.js/lib/languages/bash";
import "highlight.js/lib/languages/json";
import "highlight.js/lib/languages/xml";
import "highlight.js/lib/languages/css";
import "highlight.js/lib/languages/sql";
import "highlight.js/lib/languages/go";
import "highlight.js/lib/languages/rust";
import "highlight.js/lib/languages/php";
import "highlight.js/lib/languages/markdown";
// Import markdown-it plugins for GFM support
// eslint-disable-next-line @typescript-eslint/no-require-imports
const markdownItTaskLists = require("markdown-it-task-lists");
import {
  MarkdownToPdfProgress,
  PdfGenerationResult,
  MarkdownOptions,
  PdfStylingOptions,
  MarkdownParseResult,
  MarkdownFileValidation,
  MarkdownHeading,
  PdfMetadata,
  PdfDownloadOptions,
  SyntaxTheme,
  PdfFontFamily,
  DEFAULT_PDF_STYLING,
  DEFAULT_MARKDOWN_OPTIONS,
  PDF_FORMAT_DIMENSIONS,
} from "@/types/tools/markdownToPdf";

/**
 * Service for handling markdown-to-PDF conversions with privacy-first client-side processing
 * Enhanced with comprehensive GitHub Flavored Markdown support
 */
export class MarkdownToPdfService {
  private markdownProcessor: MarkdownIt;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly LARGE_FILE_THRESHOLD = 1 * 1024 * 1024; // 1MB
  private readonly CHUNK_SIZE = 50000; // Characters per chunk for large documents

  constructor() {
    // Configure highlight.js with security considerations and extended language support
    hljs.configure({
      ignoreUnescapedHTML: true,
      throwUnescapedHTML: false,
      languages: [
        "javascript",
        "typescript",
        "python",
        "java",
        "cpp",
        "c",
        "bash",
        "shell",
        "json",
        "xml",
        "html",
        "css",
        "sql",
        "go",
        "rust",
        "php",
        "markdown",
        "yaml",
        "dockerfile",
        "kotlin",
        "swift",
        "ruby",
        "perl",
        "scala",
        "dart",
        "lua",
        "r",
        "matlab",
        "powershell",
        "vim",
        "makefile",
      ],
    });

    // Initialize with enhanced GFM-compatible configuration
    this.markdownProcessor = new MarkdownIt({
      html: true,
      xhtmlOut: true,
      breaks: true,
      linkify: true,
      typographer: true,
    });

    // Configure markdown processor with GFM plugins
    this.configureMarkdownProcessor(DEFAULT_MARKDOWN_OPTIONS);
  }

  /**
   * Parse markdown content to HTML with analysis and syntax highlighting
   * Optimized for large documents with chunking support
   */
  public parseMarkdown(
    content: string,
    options: MarkdownOptions = DEFAULT_MARKDOWN_OPTIONS,
  ): MarkdownParseResult {
    try {
      // Configure markdown processor based on options
      this.configureMarkdownProcessor(options);

      // Check if content is large and needs chunking
      const isLargeDocument = content.length > this.CHUNK_SIZE;
      let html: string;

      if (isLargeDocument) {
        // Process large documents in chunks to prevent memory issues
        html = this.parseMarkdownInChunks(content, options);
      } else {
        // Parse markdown to HTML with syntax highlighting
        html = this.markdownProcessor.render(content);
      }

      // Post-process HTML for better PDF rendering
      const processedHtml = this.postProcessHtml(html, options);

      // Extract headings for table of contents
      const headings = this.extractHeadings(content);

      // Calculate statistics
      const wordCount = this.calculateWordCount(content);
      const readingTime = Math.ceil(wordCount / 200); // Average reading speed
      const links = this.extractLinks(processedHtml);
      const images = this.extractImages(processedHtml);
      const tables = (processedHtml.match(/<table/gi) || []).length;
      const codeBlocks = (content.match(/```/g) || []).length / 2;

      return {
        html: processedHtml,
        headings,
        wordCount,
        readingTime,
        links,
        images,
        tables,
        codeBlocks,
        warnings: isLargeDocument
          ? ["Large document processed in chunks for optimal performance"]
          : undefined,
      };
    } catch (error) {
      throw new Error(
        `Failed to parse markdown: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Parse large markdown documents in chunks to prevent memory issues
   */
  private parseMarkdownInChunks(
    content: string,
    _options: MarkdownOptions,
  ): string {
    const chunks: string[] = [];
    let currentPosition = 0;

    while (currentPosition < content.length) {
      // Find a good breaking point (end of line or paragraph)
      let chunkEnd = Math.min(
        currentPosition + this.CHUNK_SIZE,
        content.length,
      );

      // If not at the end, try to break at a paragraph or line boundary
      if (chunkEnd < content.length) {
        const nextParagraph = content.indexOf("\n\n", chunkEnd - 1000);
        const nextLine = content.indexOf("\n", chunkEnd - 100);

        if (nextParagraph > 0 && nextParagraph < chunkEnd + 1000) {
          chunkEnd = nextParagraph + 2; // Include the paragraph break
        } else if (nextLine > 0 && nextLine < chunkEnd + 100) {
          chunkEnd = nextLine + 1; // Include the line break
        }
      }

      const chunk = content.slice(currentPosition, chunkEnd);
      const chunkHtml = this.markdownProcessor.render(chunk);
      chunks.push(chunkHtml);

      currentPosition = chunkEnd;
    }

    return chunks.join("");
  }

  /**
   * Generate PDF in chunks for large documents to prevent memory issues
   */
  private async generatePdfInChunks(
    container: HTMLElement,
    stylingOptions: PdfStylingOptions,
    onProgress?: (progress: MarkdownToPdfProgress) => void,
  ): Promise<jsPDF> {
    const chunkHeight = 2000; // Process 2000px at a time
    const totalHeight = container.scrollHeight;
    const totalChunks = Math.ceil(totalHeight / chunkHeight);

    // Initialize PDF with first chunk
    let pdf: jsPDF | null = null;

    for (let i = 0; i < totalChunks; i++) {
      const startY = i * chunkHeight;

      // Update progress
      const chunkProgress = 30 + (40 * (i + 1)) / totalChunks; // 30-70% range
      onProgress?.({
        stage: "rendering",
        progress: chunkProgress,
        currentStep: `Processing chunk ${i + 1} of ${totalChunks}...`,
      });

      // Create a temporary container for this chunk
      const chunkContainer = container.cloneNode(true) as HTMLElement;
      chunkContainer.style.position = "absolute";
      chunkContainer.style.top = `-${startY}px`;
      chunkContainer.style.height = `${chunkHeight}px`;
      chunkContainer.style.overflow = "hidden";
      document.body.appendChild(chunkContainer);

      try {
        // Render this chunk to canvas
        const canvas = await html2canvas(chunkContainer, {
          allowTaint: true,
          useCORS: true,
          scale: 1.5, // Slightly lower scale for memory efficiency
          backgroundColor: stylingOptions.backgroundColor || "#ffffff",
          logging: false,
          width: container.scrollWidth,
          height: chunkHeight,
          windowWidth: 1200,
          windowHeight: 800,
          y: 0, // Start from top of chunk
        });

        if (i === 0) {
          // Create PDF with first chunk
          pdf = this.createPdfFromCanvas(canvas, stylingOptions);
        } else if (pdf) {
          // Add new page and append chunk
          pdf.addPage();
          const imgData = canvas.toDataURL("image/png");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        }

        // Clean up canvas to free memory
        canvas.width = 0;
        canvas.height = 0;
      } finally {
        // Clean up temporary container
        document.body.removeChild(chunkContainer);
      }

      // Force garbage collection hint
      if (typeof window !== "undefined" && "gc" in window) {
        (window as any).gc();
      }
    }

    if (!pdf) {
      throw new Error("Failed to generate PDF from chunks");
    }

    return pdf;
  }

  /**
   * Generate PDF from HTML content with enhanced options and memory optimization
   */
  public async generatePdf(
    html: string,
    stylingOptions: PdfStylingOptions = DEFAULT_PDF_STYLING,
    onProgress?: (progress: MarkdownToPdfProgress) => void,
  ): Promise<PdfGenerationResult> {
    const startTime = Date.now();

    try {
      // Report parsing stage
      onProgress?.({
        stage: "parsing",
        progress: 10,
        currentStep: "Preparing HTML content with syntax highlighting...",
      });

      // Create styled HTML for PDF generation with enhanced styling
      const styledHtml = this.createStyledHtml(html, stylingOptions);

      // Report rendering stage
      onProgress?.({
        stage: "rendering",
        progress: 30,
        currentStep: "Rendering HTML to high-quality canvas...",
      });

      // Create temporary container for rendering
      const container = this.createRenderContainer(styledHtml);
      document.body.appendChild(container);

      try {
        // Check if document is large and needs chunked rendering
        const isLargeDocument = container.scrollHeight > 5000; // 5000px threshold
        let pdf: jsPDF;

        if (isLargeDocument) {
          // Use chunked rendering for large documents to prevent memory issues
          pdf = await this.generatePdfInChunks(
            container,
            stylingOptions,
            onProgress,
          );
        } else {
          // Convert HTML to canvas with enhanced options for smaller documents
          const canvas = await html2canvas(container, {
            allowTaint: true,
            useCORS: true,
            scale: 2, // Higher quality for crisp text
            backgroundColor: stylingOptions.backgroundColor || "#ffffff",
            logging: false, // Disable logging for cleaner output
            width: container.scrollWidth,
            height: container.scrollHeight,
            windowWidth: 1200, // Standard width for consistent rendering
            windowHeight: 800,
            removeContainer: false, // We'll handle cleanup
          });

          // Report generating stage
          onProgress?.({
            stage: "generating",
            progress: 70,
            currentStep: "Creating optimized PDF document...",
          });

          // Create PDF from canvas with enhanced options
          pdf = this.createPdfFromCanvas(canvas, stylingOptions);
        }

        // Generate comprehensive metadata
        const metadata = this.generatePdfMetadata(stylingOptions, html);

        // Get PDF as blob and data URL
        const pdfBlob = pdf.output("blob");
        const pdfDataUrl = pdf.output("datauristring");

        // Report completion
        onProgress?.({
          stage: "complete",
          progress: 100,
          currentStep: "PDF generation complete with syntax highlighting!",
        });

        const processingTime = Date.now() - startTime;

        return {
          success: true,
          pdfBlob,
          pdfDataUrl,
          pageCount: pdf.getNumberOfPages(),
          fileSize: pdfBlob.size,
          processingTime,
          metadata,
        };
      } finally {
        // Clean up temporary container
        document.body.removeChild(container);
      }
    } catch (error) {
      const processingTime = Date.now() - startTime;
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        processingTime,
      };
    }
  }

  /**
   * Validate markdown file
   */
  public async validateMarkdownFile(
    file: File,
  ): Promise<MarkdownFileValidation> {
    const validation: MarkdownFileValidation = {
      isValid: true,
      fileSize: file.size,
      isLargeFile: file.size > this.LARGE_FILE_THRESHOLD,
    };

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      validation.isValid = false;
      validation.error = `File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(this.MAX_FILE_SIZE)})`;
      return validation;
    }

    // Check file type
    const allowedTypes = [".md", ".markdown", ".txt"];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedTypes.some((ext) =>
      fileName.endsWith(ext),
    );

    if (!hasValidExtension) {
      validation.warnings = validation.warnings || [];
      validation.warnings.push(
        "File extension is not a common markdown format. Supported: .md, .markdown, .txt",
      );
    }

    try {
      // Read file content to validate and analyze
      const content = await this.readFileAsText(file);

      validation.lineCount = content.split("\n").length;
      validation.wordCount = this.calculateWordCount(content);

      // Check for common encoding issues
      if (content.includes("�")) {
        validation.warnings = validation.warnings || [];
        validation.warnings.push(
          "File may have encoding issues. Some characters may not display correctly.",
        );
      }

      // Detect encoding (simplified)
      validation.encoding = "UTF-8"; // Assumption for simplicity
    } catch {
      validation.isValid = false;
      validation.error =
        "Unable to read file content. File may be corrupted or in an unsupported format.";
    }

    return validation;
  }

  /**
   * Create download options for PDF
   */
  public createDownloadOptions(
    pdfBlob: Blob,
    filename?: string,
    metadata?: PdfMetadata,
  ): PdfDownloadOptions {
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:-]/g, "");
    const defaultFilename = `tool-chest_markdown_${timestamp}.pdf`;

    return {
      filename: filename || defaultFilename,
      blob: pdfBlob,
      metadata: metadata || this.generatePdfMetadata(DEFAULT_PDF_STYLING, ""),
    };
  }

  /**
   * Download PDF file
   */
  public downloadPdf(options: PdfDownloadOptions): void {
    try {
      const url = URL.createObjectURL(options.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = options.filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      throw new Error(
        `Failed to download PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Read file as text
   */
  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(new Error("File reading error"));
      reader.readAsText(file, "UTF-8");
    });
  }

  /**
   * Configure markdown processor based on options with comprehensive GFM support
   */
  private configureMarkdownProcessor(options: MarkdownOptions): void {
    // Reset to default configuration with GFM-compatible settings
    this.markdownProcessor = new MarkdownIt({
      html: !options.sanitize,
      xhtmlOut: true,
      breaks: options.breaks,
      linkify: options.linkify,
      typographer: true,
    });

    // Enable GFM features based on options
    if (options.enableGfm) {
      // Enable strikethrough (built-in GFM feature)
      this.markdownProcessor.enable(["strikethrough"]);

      // Enable table support (built-in GFM feature)
      if (options.enableTables) {
        this.markdownProcessor.enable(["table"]);
      }
    }

    // Enable task lists with proper plugin
    if (options.enableTaskLists) {
      this.markdownProcessor.use(markdownItTaskLists, {
        enabled: true,
        label: true,
        labelAfter: true,
      });
    }

    // Configure table rendering for better PDF output
    if (options.enableTables) {
      // Tables are enabled by default in markdown-it
      // Enhanced table processing happens in post-processing
    }

    // Configure syntax highlighting
    this.markdownProcessor.set({
      highlight: (str: string, lang: string) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            const result = hljs.highlight(str, {
              language: lang,
              ignoreIllegals: true,
            });
            return `<pre class="hljs"><code class="hljs language-${lang}">${result.value}</code></pre>`;
          } catch {
            // Fallback to auto-detection
            try {
              const autoResult = hljs.highlightAuto(str);
              const detectedLang = autoResult.language || "plaintext";
              return `<pre class="hljs"><code class="hljs language-${detectedLang}">${autoResult.value}</code></pre>`;
            } catch {
              // Return escaped content if highlighting fails
              return `<pre class="hljs"><code class="hljs">${this.markdownProcessor.utils.escapeHtml(str)}</code></pre>`;
            }
          }
        }
        return `<pre class="hljs"><code class="hljs">${this.markdownProcessor.utils.escapeHtml(str)}</code></pre>`;
      },
    });
  }

  /**
   * Post-process HTML for enhanced PDF rendering with comprehensive GFM support
   */
  private postProcessHtml(html: string, options: MarkdownOptions): string {
    try {
      // Create a temporary DOM element to process the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      // Enhanced table processing for better PDF rendering
      const tables = tempDiv.querySelectorAll("table");
      tables.forEach((table) => {
        table.classList.add("pdf-table", "gfm-table");

        // Add accessibility attributes
        if (!table.getAttribute("role")) {
          table.setAttribute("role", "table");
        }

        // Enhanced table styling for PDF
        const thead = table.querySelector("thead");
        if (thead) {
          thead.classList.add("pdf-table-header");
        }

        const tbody = table.querySelector("tbody");
        if (tbody) {
          tbody.classList.add("pdf-table-body");
        }

        // Style table cells
        const cells = table.querySelectorAll("th, td");
        cells.forEach((cell) => {
          cell.classList.add("pdf-table-cell");
        });

        // Add striped rows for better readability
        const rows = table.querySelectorAll("tbody tr");
        rows.forEach((row, index) => {
          if (index % 2 === 1) {
            row.classList.add("pdf-table-row-striped");
          }
        });
      });

      // Enhanced task list processing (plugin handles most of the work)
      if (options.enableTaskLists) {
        const taskItems = tempDiv.querySelectorAll(".task-list-item");
        taskItems.forEach((li) => {
          li.classList.add("pdf-task-item");
          const checkbox = li.querySelector(".task-list-item-checkbox");
          if (checkbox) {
            checkbox.classList.add("pdf-task-checkbox");
          }
        });
      }

      // Enhanced code block processing for better PDF rendering
      const codeBlocks = tempDiv.querySelectorAll("pre.hljs");
      codeBlocks.forEach((pre) => {
        pre.classList.add("pdf-code-block");
        const code = pre.querySelector("code");
        if (code) {
          code.classList.add("pdf-code");

          // Add language label if detected
          const languageMatch = code.className.match(/language-(\w+)/);
          if (languageMatch) {
            const language = languageMatch[1];
            const label = document.createElement("div");
            label.className = "pdf-code-language";
            label.textContent = language.toUpperCase();
            pre.insertBefore(label, code);
          }
        }
      });

      // Enhanced inline code styling
      const inlineCodes = tempDiv.querySelectorAll("code:not(pre code)");
      inlineCodes.forEach((code) => {
        code.classList.add("pdf-inline-code");
      });

      // Enhanced strikethrough support (GFM feature)
      const strikethroughs = tempDiv.querySelectorAll("s, del");
      strikethroughs.forEach((s) => {
        s.classList.add("pdf-strikethrough");
      });

      // Add PDF-specific classes for better styling
      const headings = tempDiv.querySelectorAll("h1, h2, h3, h4, h5, h6");
      headings.forEach((heading) => {
        heading.classList.add("pdf-heading");

        // Add heading level class
        const level = heading.tagName.toLowerCase();
        heading.classList.add(`pdf-heading-${level}`);
      });

      const paragraphs = tempDiv.querySelectorAll("p");
      paragraphs.forEach((p) => {
        p.classList.add("pdf-paragraph");
      });

      const blockquotes = tempDiv.querySelectorAll("blockquote");
      blockquotes.forEach((bq) => {
        bq.classList.add("pdf-blockquote");
      });

      // Enhanced list styling
      const lists = tempDiv.querySelectorAll("ul, ol");
      lists.forEach((list) => {
        list.classList.add("pdf-list");
        const items = list.querySelectorAll("li:not(.task-list-item)");
        items.forEach((item) => {
          item.classList.add("pdf-list-item");
        });
      });

      // Enhanced link styling
      const links = tempDiv.querySelectorAll("a");
      links.forEach((link) => {
        link.classList.add("pdf-link");
      });

      // Enhanced image styling
      const images = tempDiv.querySelectorAll("img");
      images.forEach((img) => {
        img.classList.add("pdf-image");
      });

      return tempDiv.innerHTML;
    } catch (error) {
      console.warn("HTML post-processing failed:", error);
      return html; // Return original HTML if processing fails
    }
  }

  /**
   * Extract headings from markdown content
   */
  private extractHeadings(content: string): MarkdownHeading[] {
    const headings: MarkdownHeading[] = [];
    const lines = content.split("\n");

    lines.forEach((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        const anchor = `#${id}`;

        headings.push({
          level,
          text,
          id,
          anchor,
        });
      }
    });

    return headings;
  }

  /**
   * Calculate word count
   */
  private calculateWordCount(content: string): number {
    // Remove markdown syntax and count words
    const cleanContent = content
      .replace(/```[\s\S]*?```/g, "") // Remove code blocks
      .replace(/`[^`]+`/g, "") // Remove inline code
      .replace(/[#*_~\[\]()]/g, "") // Remove markdown syntax
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    return cleanContent ? cleanContent.split(" ").length : 0;
  }

  /**
   * Extract links from HTML
   */
  private extractLinks(html: string): string[] {
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
    const links: string[] = [];
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      links.push(match[1]);
    }

    return [...new Set(links)]; // Remove duplicates
  }

  /**
   * Extract images from HTML
   */
  private extractImages(html: string): string[] {
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const images: string[] = [];
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      images.push(match[1]);
    }

    return [...new Set(images)]; // Remove duplicates
  }

  /**
   * Create styled HTML for PDF generation
   */
  private createStyledHtml(html: string, options: PdfStylingOptions): string {
    const css = this.generatePdfCss(options);

    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>${css}</style>
            </head>
            <body>
                <div class="pdf-content">
                    ${html}
                </div>
            </body>
            </html>
        `;
  }

  /**
   * Generate enhanced CSS for PDF styling with comprehensive customization support
   */
  private generatePdfCss(options: PdfStylingOptions): string {
    const {
      format,
      orientation,
      fontSize,
      lineHeight,
      fontFamily,
      headingScale,
      margin,
      syntaxHighlighting,
      backgroundColor,
      textColor,
      linkColor,
      accessibility,
    } = options;

    const dimensions = PDF_FORMAT_DIMENSIONS[format];
    const width =
      orientation === "landscape" ? dimensions.height : dimensions.width;
    const height =
      orientation === "landscape" ? dimensions.width : dimensions.height;

    // Get font family CSS
    const fontFamilyCSS = this.getFontFamilyCSS(fontFamily);

    // Get accessibility-enhanced font size
    const enhancedFontSize = this.getAccessibilityFontSize(
      fontSize,
      accessibility?.fontSize,
    );

    // Get high contrast colors if enabled
    const colors = this.getAccessibilityColors(
      backgroundColor,
      textColor,
      linkColor,
      accessibility?.highContrast,
    );

    const syntaxCss = syntaxHighlighting?.enabled
      ? this.getSyntaxHighlightingCss(syntaxHighlighting.theme)
      : "";

    return `
            @page {
                size: ${width}mm ${height}mm;
                margin: ${margin.top}mm ${margin.right}mm ${margin.bottom}mm ${margin.left}mm;
            }
            
            body {
                font-family: ${fontFamilyCSS};
                font-size: ${enhancedFontSize}px;
                line-height: ${lineHeight};
                color: ${colors.text};
                margin: 0;
                padding: 0;
                background: ${colors.background};
                ${accessibility?.reducedMotion ? "scroll-behavior: auto;" : ""}
            }
            
            .pdf-content {
                max-width: 100%;
                word-wrap: break-word;
                overflow-wrap: break-word;
            }
            
            /* Enhanced heading styles with customizable scaling */
            .pdf-heading {
                margin-top: 24px;
                margin-bottom: 16px;
                font-weight: 600;
                line-height: 1.25;
                page-break-after: avoid;
                ${accessibility?.structuredHeadings ? "outline: none;" : ""}
            }
            
            .pdf-heading-h1 { 
                font-size: ${2 * headingScale}em; 
                color: ${colors.text};
                border-bottom: 1px solid ${colors.text}40;
                padding-bottom: 0.3em;
            }
            .pdf-heading-h2 { 
                font-size: ${1.5 * headingScale}em; 
                color: ${colors.text};
                border-bottom: 1px solid ${colors.text}40;
                padding-bottom: 0.3em;
            }
            .pdf-heading-h3 { font-size: ${1.25 * headingScale}em; color: ${colors.text}; }
            .pdf-heading-h4 { font-size: ${1 * headingScale}em; color: ${colors.text}; }
            .pdf-heading-h5 { font-size: ${0.875 * headingScale}em; color: ${colors.text}BB; }
            .pdf-heading-h6 { font-size: ${0.85 * headingScale}em; color: ${colors.text}BB; }
            
            .pdf-paragraph {
                margin-top: 0;
                margin-bottom: 16px;
                text-align: left;
            }
            
            .pdf-blockquote {
                border-left: 0.25em solid #d1d9e0;
                padding: 0 1em;
                margin: 16px 0;
                color: #656d76;
            }
            
            /* Enhanced GFM table styling */
            .pdf-table, .gfm-table {
                border-spacing: 0;
                border-collapse: collapse;
                margin: 16px 0;
                display: table;
                width: max-content;
                max-width: 100%;
                overflow: auto;
                page-break-inside: avoid;
            }
            
            .pdf-table-cell {
                padding: 6px 13px;
                border: 1px solid #d1d9e0;
            }
            
            .pdf-table-header .pdf-table-cell {
                background-color: #f6f8fa;
                font-weight: 600;
                border-bottom: 2px solid #d1d9e0;
            }
            
            .pdf-table-row-striped .pdf-table-cell {
                background-color: #f6f8fa;
            }
            
            /* Enhanced code styling with customizable options */
            .pdf-code-block {
                background-color: #f6f8fa;
                border-radius: 6px;
                padding: 16px;
                overflow: auto;
                margin: 16px 0;
                page-break-inside: avoid;
                position: relative;
                ${syntaxHighlighting?.lineNumbers ? "counter-reset: line-numbering;" : ""}
            }
            
            .pdf-code-language {
                position: absolute;
                top: 8px;
                right: 8px;
                background: ${colors.text};
                color: ${colors.background};
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                font-family: ${this.getFontFamilyCSS(syntaxHighlighting?.fontFamily || "monospace")};
            }
            
            .pdf-code {
                background-color: transparent;
                padding: 0;
                border-radius: 0;
                font-family: ${this.getFontFamilyCSS(syntaxHighlighting?.fontFamily || "monospace")};
                font-size: ${syntaxHighlighting?.fontSize || enhancedFontSize * 0.85}px;
                line-height: 1.45;
                color: ${colors.text};
            }
            
            .pdf-inline-code {
                background-color: ${colors.text}20;
                padding: 0.2em 0.4em;
                border-radius: 6px;
                font-family: ${this.getFontFamilyCSS(syntaxHighlighting?.fontFamily || "monospace")};
                font-size: 85%;
                color: ${colors.text};
            }
            
            ${syntaxHighlighting?.lineNumbers
        ? `
            .pdf-code-block .hljs {
                counter-reset: line-numbering;
            }
            
            .pdf-code-block .hljs .hljs-ln-line {
                counter-increment: line-numbering;
                position: relative;
            }
            
            .pdf-code-block .hljs .hljs-ln-line::before {
                content: counter(line-numbering);
                position: absolute;
                left: -3em;
                width: 2.5em;
                text-align: right;
                color: ${colors.text}60;
                border-right: 1px solid ${colors.text}20;
                padding-right: 0.5em;
                user-select: none;
            }
            `
        : ""
      }
            
            /* Enhanced strikethrough support (GFM) */
            .pdf-strikethrough {
                text-decoration: line-through;
                color: #656d76;
            }
            
            /* Enhanced task list styling */
            .pdf-task-item {
                list-style: none;
                margin-left: -1.6em;
                position: relative;
            }
            
            .pdf-task-checkbox {
                margin-right: 0.5em;
                margin-left: 0.2em;
                vertical-align: middle;
                pointer-events: none;
            }
            
            /* Enhanced list styling */
            .pdf-list {
                margin-top: 0;
                margin-bottom: 16px;
                padding-left: 2em;
            }
            
            .pdf-list-item {
                margin-bottom: 0.25em;
                word-wrap: break-all;
            }
            
            .pdf-list .pdf-list {
                margin-top: 0;
                margin-bottom: 0;
            }
            
            /* Enhanced link styling with customizable colors */
            .pdf-link {
                color: ${colors.link};
                text-decoration: none;
            }
            
            .pdf-link:hover {
                text-decoration: underline;
            }
            
            /* Enhanced image styling */
            .pdf-image {
                max-width: 100%;
                height: auto;
                box-sizing: content-box;
                background-color: #ffffff;
                border-style: none;
                page-break-inside: avoid;
            }
            
            /* Horizontal rules */
            hr {
                height: 0.25em;
                padding: 0;
                margin: 24px 0;
                background-color: #d1d9e0;
                border: 0;
            }
            
            /* Definition lists */
            dl {
                padding: 0;
            }
            
            dl dt {
                padding: 0;
                margin-top: 16px;
                font-size: 1em;
                font-style: italic;
                font-weight: 600;
            }
            
            dl dd {
                padding: 0 16px;
                margin-bottom: 16px;
            }
            
            /* Print-specific optimizations */
            @media print {
                .pdf-content {
                    color: black !important;
                }
                
                .pdf-link {
                    color: black !important;
                    text-decoration: underline !important;
                }
                
                .pdf-code-block {
                    background-color: #f8f9fa !important;
                    border: 1px solid #e1e4e8 !important;
                }
                
                .pdf-table-cell {
                    border-color: black !important;
                }
            }
            
            ${syntaxCss}
            ${options.customCss || ""}
        `;
  }

  /**
   * Get syntax highlighting CSS for the specified theme
   */
  private getSyntaxHighlightingCss(theme: SyntaxTheme): string {
    switch (theme) {
      case "github":
        return `
                    .hljs {
                        color: #24292e;
                        background: #f6f8fa;
                    }
                    .hljs-comment,
                    .hljs-quote {
                        color: #6a737d;
                        font-style: italic;
                    }
                    .hljs-keyword,
                    .hljs-selector-tag,
                    .hljs-type {
                        color: #d73a49;
                    }
                    .hljs-string,
                    .hljs-attr {
                        color: #032f62;
                    }
                    .hljs-number,
                    .hljs-literal {
                        color: #005cc5;
                    }
                    .hljs-variable,
                    .hljs-title {
                        color: #6f42c1;
                    }
                    .hljs-function {
                        color: #6f42c1;
                    }
                    .hljs-tag {
                        color: #22863a;
                    }
                `;
      case "monokai":
        return `
                    .hljs {
                        color: #f8f8f2;
                        background: #272822;
                    }
                    .hljs-comment,
                    .hljs-quote {
                        color: #75715e;
                    }
                    .hljs-keyword,
                    .hljs-selector-tag {
                        color: #f92672;
                    }
                    .hljs-string {
                        color: #e6db74;
                    }
                    .hljs-number {
                        color: #ae81ff;
                    }
                    .hljs-variable,
                    .hljs-title {
                        color: #a6e22e;
                    }
                    .hljs-function {
                        color: #66d9ef;
                    }
                `;
      case "vs":
        return `
                    .hljs {
                        color: #000;
                        background: #fff;
                    }
                    .hljs-comment,
                    .hljs-quote {
                        color: #008000;
                    }
                    .hljs-keyword {
                        color: #0000ff;
                    }
                    .hljs-string {
                        color: #a31515;
                    }
                    .hljs-number {
                        color: #000;
                    }
                `;
      default:
        return "";
    }
  }

  /**
   * Create temporary container for rendering
   */
  private createRenderContainer(html: string): HTMLElement {
    const container = document.createElement("div");
    container.innerHTML = html;
    container.style.position = "absolute";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    container.style.width = "210mm"; // A4 width
    container.style.background = "white";
    container.style.fontSize = "12px";
    container.style.lineHeight = "1.5";
    container.style.padding = "20mm";

    return container;
  }

  /**
   * Create PDF from canvas
   */
  private createPdfFromCanvas(
    canvas: HTMLCanvasElement,
    options: PdfStylingOptions,
  ): jsPDF {
    const { format, orientation } = options;
    const dimensions = PDF_FORMAT_DIMENSIONS[format];

    const pdfWidth =
      orientation === "landscape" ? dimensions.height : dimensions.width;
    const pdfHeight =
      orientation === "landscape" ? dimensions.width : dimensions.height;

    const pdf = new jsPDF({
      orientation: orientation === "landscape" ? "l" : "p",
      unit: "mm",
      format: [pdfWidth, pdfHeight],
    });

    // Calculate scaling to fit content
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    const availableWidth =
      pdfWidth - options.margin.left - options.margin.right;
    const availableHeight =
      pdfHeight - options.margin.top - options.margin.bottom;

    let imgWidth = availableWidth;
    let imgHeight = imgWidth / ratio;

    if (imgHeight > availableHeight) {
      imgHeight = availableHeight;
      imgWidth = imgHeight * ratio;
    }

    // Add image to PDF
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(
      imgData,
      "PNG",
      options.margin.left,
      options.margin.top,
      imgWidth,
      imgHeight,
    );

    return pdf;
  }

  /**
   * Generate PDF metadata
   */
  private generatePdfMetadata(
    options: PdfStylingOptions,
    html: string,
  ): PdfMetadata {
    return {
      title: "Markdown Document",
      creator: "tool-chest Markdown-to-PDF",
      producer: "tool-chest",
      creationDate: new Date(),
      htmlContent: html,
    };
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]} `;
  }

  /**
   * Get CSS font family string for PDF styling
   */
  private getFontFamilyCSS(fontFamily: PdfFontFamily): string {
    switch (fontFamily) {
      case "serif":
        return 'Georgia, "Times New Roman", serif';
      case "sans-serif":
        return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
      case "monospace":
        return '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, "Courier New", monospace';
      case "times":
        return '"Times New Roman", Times, serif';
      case "helvetica":
        return "Helvetica, Arial, sans-serif";
      case "courier":
        return '"Courier New", Courier, monospace';
      default:
        return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    }
  }

  /**
   * Get accessibility-enhanced font size
   */
  private getAccessibilityFontSize(
    baseFontSize: number,
    accessibilityFontSize?: "small" | "normal" | "large" | "x-large",
  ): number {
    if (!accessibilityFontSize || accessibilityFontSize === "normal") {
      return baseFontSize;
    }

    const multipliers = {
      small: 0.85,
      normal: 1.0,
      large: 1.15,
      "x-large": 1.3,
    };

    return Math.round(baseFontSize * multipliers[accessibilityFontSize]);
  }

  /**
   * Get accessibility-enhanced colors
   */
  private getAccessibilityColors(
    backgroundColor?: string,
    textColor?: string,
    linkColor?: string,
    highContrast?: boolean,
  ): { background: string; text: string; link: string } {
    if (highContrast) {
      return {
        background: "#ffffff",
        text: "#000000",
        link: "#0000ee",
      };
    }

    return {
      background: backgroundColor || "#ffffff",
      text: textColor || "#24292f",
      link: linkColor || "#0969da",
    };
  }
}

// Export a singleton instance
export const markdownToPdfService = new MarkdownToPdfService();
