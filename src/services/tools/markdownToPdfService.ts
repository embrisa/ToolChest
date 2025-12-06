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
import type { PluginWithOptions } from "markdown-it";
let markdownItTaskLists: PluginWithOptions<Record<string, unknown>> | null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  markdownItTaskLists = require("markdown-it-task-lists");
} catch (error) {
  console.warn("Failed to load markdown-it-task-lists plugin:", error);
  markdownItTaskLists = null;
}
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
    try {
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
    } catch (error) {
      console.warn(
        "Failed to configure highlight.js, syntax highlighting will be limited:",
        error,
      );
    }

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
   * Return CSS used for rendering preview so the live preview matches the PDF output
   */
  public getPreviewCss(
    options: PdfStylingOptions = DEFAULT_PDF_STYLING,
  ): string {
    return this.generatePdfCss(options);
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
      // Special handling for hljs-related errors including isSpace
      if (
        error instanceof Error &&
        (error.message.includes("isSpace") ||
          error.message.includes("highlight") ||
          error.stack?.includes("hljs") ||
          error.stack?.includes("highlight.js"))
      ) {
        console.warn(
          "Syntax highlighting compatibility issue detected, falling back to basic markdown parsing:",
          error.message,
        );
        return this.parseMarkdownFallback(content, options);
      }

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
    // Calculate a chunk height that equals one PDF page of content (in pixels)
    const dims = PDF_FORMAT_DIMENSIONS[stylingOptions.format];
    const pdfHeightMm =
      stylingOptions.orientation === "landscape" ? dims.width : dims.height;

    const headerHeightMm = stylingOptions.header?.enabled
      ? stylingOptions.header.height || 0
      : 0;
    const footerHeightMm = stylingOptions.footer?.enabled
      ? stylingOptions.footer.height || 0
      : 0;
    const contentHeightMm =
      pdfHeightMm -
      stylingOptions.margin.top -
      stylingOptions.margin.bottom -
      headerHeightMm -
      footerHeightMm;

    const mmToPx = (mm: number) => (mm * 96) / 25.4;
    const chunkHeight = Math.max(400, Math.floor(mmToPx(contentHeightMm))); // at least 400px

    const totalHeight = container.scrollHeight;
    const totalChunks = Math.ceil(totalHeight / chunkHeight);

    // Initialize PDF
    const pdf = this.initPdf(stylingOptions);

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
      chunkContainer.style.height = `${chunkHeight}px`;
      chunkContainer.style.overflow = "hidden";

      // Offset the content using scroll rather than CSS positioning.
      // Using a negative top value caused html2canvas to capture the first
      // page repeatedly. Scrolling ensures each chunk renders its unique
      // portion of the document.
      chunkContainer.scrollTop = startY;

      document.body.appendChild(chunkContainer);

      try {
        // Render this chunk to canvas
        const canvas = await html2canvas(chunkContainer, {
          allowTaint: true,
          useCORS: true,
          scale: 2, // Higher quality for crisp text
          backgroundColor: stylingOptions.backgroundColor || "#ffffff",
          logging: false,
          width: container.scrollWidth,
          height: chunkHeight,
          windowWidth: 1200,
          windowHeight: 800,
          y: 0, // Start from top of chunk
        });

        if (i > 0) {
          pdf.addPage();
        }

        this.placeCanvasOnPdf(pdf, canvas, stylingOptions);
        this.drawHeaderFooterAndPageNumbers(
          pdf,
          stylingOptions,
          i + 1,
          totalChunks,
        );

        // Clean up canvas to free memory
        canvas.width = 0;
        canvas.height = 0;
      } finally {
        // Clean up temporary container
        document.body.removeChild(chunkContainer);
      }

      // Force garbage collection hint
      if (typeof window !== "undefined" && "gc" in window) {
        (window as Window & { gc: () => void }).gc();
      }
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
      const container = this.createRenderContainer(styledHtml, stylingOptions);
      document.body.appendChild(container);

      try {
        // Always paginate using chunked rendering to maintain 1:1 page scale and spacing
        const pdf = await this.generatePdfInChunks(
          container,
          stylingOptions,
          onProgress,
        );

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
    if (options.enableTaskLists && markdownItTaskLists) {
      try {
        this.markdownProcessor.use(markdownItTaskLists, {
          enabled: true,
          label: true,
          labelAfter: true,
        });
      } catch (error) {
        console.warn("Failed to configure task lists plugin:", error);
        // Continue without task lists
      }
    }

    // Configure table rendering for better PDF output
    if (options.enableTables) {
      // Tables are enabled by default in markdown-it
      // Enhanced table processing happens in post-processing
    }

    // Configure syntax highlighting with better error handling
    this.markdownProcessor.set({
      highlight: (str: string, lang: string) => {
        try {
          // Check if hljs is properly initialized and language exists
          let hasValidLanguage = false;
          try {
            hasValidLanguage = !!(lang && hljs.getLanguage(lang));
          } catch (langError) {
            console.warn("Failed to check language support:", langError);
            hasValidLanguage = false;
          }

          if (hasValidLanguage) {
            try {
              const result = hljs.highlight(str, {
                language: lang,
                ignoreIllegals: true,
              });
              return `<pre class="hljs"><code class="hljs language-${lang}">${result.value}</code></pre>`;
            } catch (highlightError) {
              // If specific language highlighting fails, try auto-detection
              console.warn(
                "Language-specific highlighting failed:",
                highlightError,
              );
              try {
                const autoResult = hljs.highlightAuto(str);
                const detectedLang = autoResult.language || "plaintext";
                return `<pre class="hljs"><code class="hljs language-${detectedLang}">${autoResult.value}</code></pre>`;
              } catch (autoError) {
                // If auto-detection also fails, return escaped content
                console.warn("Auto-detection highlighting failed:", autoError);
                return `<pre class="hljs"><code class="hljs">${this.escapeHtml(str)}</code></pre>`;
              }
            }
          }
          // No language specified or language not found
          return `<pre class="hljs"><code class="hljs">${this.escapeHtml(str)}</code></pre>`;
        } catch (error) {
          // Catch any hljs-related errors including isSpace issues
          console.warn("Syntax highlighting failed:", error);
          return `<pre class="hljs"><code class="hljs">${this.escapeHtml(str)}</code></pre>`;
        }
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
        // First try to find task items created by the plugin
        const taskItems = tempDiv.querySelectorAll(".task-list-item");
        taskItems.forEach((li) => {
          li.classList.add("pdf-task-item");
          const checkbox = li.querySelector(".task-list-item-checkbox");
          if (checkbox) {
            checkbox.classList.add("pdf-task-checkbox");
          }
        });

        // Fallback: manually process task lists if plugin didn't work
        if (taskItems.length === 0) {
          this.processTaskListsFallback(tempDiv);
        }
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

    // Professional color palette for a polished look
    const accentColor = "#2563eb"; // Professional blue
    const subtleGray = "#64748b";
    const borderColor = "#e2e8f0";
    const surfaceColor = "#f8fafc";
    const codeBgColor = "#1e293b"; // Dark slate for code blocks
    const codeTextColor = "#e2e8f0";

    return `
            @page {
                size: ${width}mm ${height}mm;
                margin: ${margin.top}mm ${margin.right}mm ${margin.bottom}mm ${margin.left}mm;
            }
            
            * {
                box-sizing: border-box;
            }
            
            body {
                font-family: ${fontFamilyCSS};
                font-size: ${enhancedFontSize}px;
                line-height: ${lineHeight};
                color: ${colors.text};
                margin: 0;
                padding: 20px;
                background: ${colors.background};
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                text-rendering: optimizeLegibility;
                ${accessibility?.reducedMotion ? "scroll-behavior: auto;" : ""}
            }
            
            .pdf-content {
                max-width: 100%;
                word-wrap: break-word;
                overflow-wrap: break-word;
            }
            
            /* Professional heading styles with elegant typography */
            .pdf-heading {
                margin-top: 2em;
                margin-bottom: 0.75em;
                font-weight: 700;
                line-height: 1.3;
                page-break-after: avoid;
                letter-spacing: -0.02em;
                ${accessibility?.structuredHeadings ? "outline: none;" : ""}
            }
            
            .pdf-heading-h1 { 
                font-size: ${2.25 * headingScale}em; 
                color: ${colors.text};
                margin-top: 0;
                margin-bottom: 1em;
                padding-bottom: 0.5em;
                border-bottom: 3px solid ${accentColor};
                letter-spacing: -0.03em;
            }
            
            .pdf-heading-h2 { 
                font-size: ${1.75 * headingScale}em; 
                color: ${colors.text};
                padding-bottom: 0.4em;
                border-bottom: 2px solid ${borderColor};
                margin-top: 2.5em;
            }
            
            .pdf-heading-h3 { 
                font-size: ${1.35 * headingScale}em; 
                color: ${colors.text};
                padding-left: 0.75em;
                border-left: 4px solid ${accentColor};
                margin-top: 2em;
            }
            
            .pdf-heading-h4 { 
                font-size: ${1.15 * headingScale}em; 
                color: ${subtleGray};
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .pdf-heading-h5 { 
                font-size: ${1 * headingScale}em; 
                color: ${subtleGray};
                font-weight: 600;
            }
            
            .pdf-heading-h6 { 
                font-size: ${0.9 * headingScale}em; 
                color: ${subtleGray};
                font-weight: 600;
                font-style: italic;
            }
            
            .pdf-paragraph {
                margin-top: 0;
                margin-bottom: 1.25em;
                text-align: left;
                max-width: 100%;
            }
            
            /* Elegant blockquote styling */
            .pdf-blockquote {
                border-left: 4px solid ${accentColor};
                padding: 1em 1.5em;
                margin: 1.5em 0;
                background: linear-gradient(135deg, ${surfaceColor} 0%, #ffffff 100%);
                border-radius: 0 8px 8px 0;
                color: ${subtleGray};
                font-style: italic;
                position: relative;
            }
            
            .pdf-blockquote::before {
                content: '"';
                position: absolute;
                top: -10px;
                left: 15px;
                font-size: 4em;
                color: ${borderColor};
                font-family: Georgia, serif;
                line-height: 1;
            }
            
            .pdf-blockquote p {
                margin: 0;
                position: relative;
                z-index: 1;
            }
            
            /* Professional table styling */
            .pdf-table, .gfm-table {
                border-spacing: 0;
                border-collapse: separate;
                margin: 1.5em 0;
                display: table;
                width: 100%;
                max-width: 100%;
                overflow: hidden;
                page-break-inside: avoid;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
                border: 1px solid ${borderColor};
            }
            
            .pdf-table-cell {
                padding: 12px 16px;
                border-bottom: 1px solid ${borderColor};
                text-align: left;
                vertical-align: top;
            }
            
            .pdf-table-header {
                background: linear-gradient(180deg, ${surfaceColor} 0%, #f1f5f9 100%);
            }
            
            .pdf-table-header .pdf-table-cell {
                font-weight: 600;
                color: ${colors.text};
                text-transform: uppercase;
                font-size: 0.85em;
                letter-spacing: 0.05em;
                border-bottom: 2px solid ${borderColor};
                padding: 14px 16px;
            }
            
            .pdf-table-row-striped .pdf-table-cell {
                background-color: ${surfaceColor};
            }
            
            tbody tr:last-child .pdf-table-cell {
                border-bottom: none;
            }
            
            /* Modern code block styling - dark theme */
            .pdf-code-block {
                background: ${codeBgColor};
                border-radius: 10px;
                padding: 1.25em 1.5em;
                overflow-x: auto;
                margin: 1.5em 0;
                page-break-inside: avoid;
                position: relative;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.05);
                ${syntaxHighlighting?.lineNumbers ? "counter-reset: line-numbering;" : ""}
            }
            
            .pdf-code-block::before {
                content: '';
                position: absolute;
                top: 12px;
                left: 16px;
                width: 12px;
                height: 12px;
                background: #ef4444;
                border-radius: 50%;
                box-shadow: 20px 0 0 #eab308, 40px 0 0 #22c55e;
            }
            
            .pdf-code-language {
                position: absolute;
                top: 8px;
                right: 12px;
                background: rgba(255,255,255,0.1);
                color: ${codeTextColor};
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-family: ${this.getFontFamilyCSS(syntaxHighlighting?.fontFamily || "monospace")};
                backdrop-filter: blur(4px);
            }
            
            .pdf-code {
                background-color: transparent;
                padding: 0;
                padding-top: 1.5em;
                border-radius: 0;
                font-family: ${this.getFontFamilyCSS(syntaxHighlighting?.fontFamily || "monospace")};
                font-size: ${syntaxHighlighting?.fontSize || Math.round(enhancedFontSize * 0.85)}px;
                line-height: 1.6;
                color: ${codeTextColor};
                display: block;
                white-space: pre;
                tab-size: 2;
            }
            
            .pdf-inline-code {
                background-color: ${surfaceColor};
                border: 1px solid ${borderColor};
                padding: 0.2em 0.5em;
                border-radius: 5px;
                font-family: ${this.getFontFamilyCSS(syntaxHighlighting?.fontFamily || "monospace")};
                font-size: 0.875em;
                color: #c026d3;
                font-weight: 500;
            }
            
            ${
              syntaxHighlighting?.lineNumbers
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
                color: ${codeTextColor}60;
                border-right: 1px solid rgba(255,255,255,0.1);
                padding-right: 0.75em;
                user-select: none;
            }
            `
                : ""
            }
            
            /* Enhanced strikethrough support (GFM) */
            .pdf-strikethrough {
                text-decoration: line-through;
                color: ${subtleGray};
                opacity: 0.7;
            }
            
            /* Modern task list styling */
            .pdf-task-item {
                list-style: none;
                margin-left: -1.6em;
                position: relative;
                padding: 0.35em 0;
            }
            
            .pdf-task-checkbox {
                margin-right: 0.75em;
                margin-left: 0.2em;
                vertical-align: middle;
                pointer-events: none;
                width: 16px;
                height: 16px;
                accent-color: ${accentColor};
            }
            
            /* Enhanced list styling */
            .pdf-list {
                margin-top: 0;
                margin-bottom: 1.25em;
                padding-left: 1.75em;
            }
            
            ul.pdf-list {
                list-style-type: none;
            }
            
            ul.pdf-list > .pdf-list-item::before {
                content: '•';
                color: ${accentColor};
                font-weight: bold;
                display: inline-block;
                width: 1em;
                margin-left: -1em;
                font-size: 1.2em;
                line-height: 1;
                vertical-align: middle;
            }
            
            ol.pdf-list {
                list-style-type: decimal;
                list-style-position: outside;
            }
            
            ol.pdf-list > .pdf-list-item::marker {
                color: ${accentColor};
                font-weight: 600;
            }
            
            .pdf-list-item {
                margin-bottom: 0.5em;
                word-wrap: break-word;
                padding-left: 0.25em;
            }
            
            .pdf-list .pdf-list {
                margin-top: 0.5em;
                margin-bottom: 0.5em;
            }
            
            /* Nested list different bullet styles */
            ul.pdf-list ul.pdf-list > .pdf-list-item::before {
                content: '◦';
            }
            
            ul.pdf-list ul.pdf-list ul.pdf-list > .pdf-list-item::before {
                content: '▪';
                font-size: 0.8em;
            }
            
            /* Enhanced link styling */
            .pdf-link {
                color: ${colors.link || accentColor};
                text-decoration: none;
                border-bottom: 1px solid transparent;
                transition: border-color 0.2s ease;
            }
            
            .pdf-link:hover {
                border-bottom-color: ${colors.link || accentColor};
            }
            
            /* Enhanced image styling */
            .pdf-image {
                max-width: 100%;
                height: auto;
                box-sizing: border-box;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
                page-break-inside: avoid;
                margin: 1.5em 0;
            }
            
            /* Elegant horizontal rules */
            hr {
                height: 0;
                padding: 0;
                margin: 2.5em 0;
                background: transparent;
                border: 0;
                border-top: 2px solid ${borderColor};
                position: relative;
            }
            
            hr::after {
                content: '§';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: ${colors.background};
                padding: 0 1em;
                color: ${borderColor};
                font-size: 1.25em;
            }
            
            /* Definition lists */
            dl {
                padding: 0;
                margin: 1.25em 0;
            }
            
            dl dt {
                padding: 0;
                margin-top: 1.25em;
                font-size: 1em;
                font-weight: 700;
                color: ${colors.text};
            }
            
            dl dd {
                padding: 0.5em 0 0.5em 1.5em;
                margin-bottom: 0.75em;
                border-left: 3px solid ${borderColor};
                color: ${subtleGray};
            }
            
            /* Strong and emphasis */
            strong, b {
                font-weight: 700;
                color: ${colors.text};
            }
            
            em, i {
                font-style: italic;
            }
            
            /* Print-specific optimizations */
            @media print {
                body {
                    padding: 0;
                }
                
                .pdf-content {
                    color: black !important;
                }
                
                .pdf-link {
                    color: black !important;
                    text-decoration: underline !important;
                }
                
                .pdf-code-block {
                    background-color: #f3f4f6 !important;
                    color: #1f2937 !important;
                    border: 1px solid #d1d5db !important;
                    box-shadow: none !important;
                }
                
                .pdf-code-block::before {
                    display: none;
                }
                
                .pdf-code {
                    color: #1f2937 !important;
                }
                
                .pdf-table {
                    box-shadow: none !important;
                }
                
                .pdf-table-cell {
                    border-color: black !important;
                }
                
                .pdf-image {
                    box-shadow: none !important;
                }
                
                hr::after {
                    display: none;
                }
            }
            
            ${syntaxCss}
            ${options.customCss || ""}
        `;
  }

  /**
   * Get syntax highlighting CSS for the specified theme
   * All themes are optimized for dark code block backgrounds
   */
  private getSyntaxHighlightingCss(theme: SyntaxTheme): string {
    // Base styles for all themes - optimized for dark backgrounds
    const baseStyles = `
                    .hljs {
                        background: transparent;
                        padding: 0;
                    }
                    .hljs code {
                        background: transparent;
                    }
                `;

    switch (theme) {
      case "github":
        // GitHub Dark theme colors
        return (
          baseStyles +
          `
                    .hljs {
                        color: #e6edf3;
                    }
                    .hljs-comment,
                    .hljs-quote {
                        color: #8b949e;
                        font-style: italic;
                    }
                    .hljs-keyword,
                    .hljs-selector-tag,
                    .hljs-type {
                        color: #ff7b72;
                    }
                    .hljs-string,
                    .hljs-attr {
                        color: #a5d6ff;
                    }
                    .hljs-number,
                    .hljs-literal {
                        color: #79c0ff;
                    }
                    .hljs-variable,
                    .hljs-template-variable {
                        color: #ffa657;
                    }
                    .hljs-title,
                    .hljs-title.class_,
                    .hljs-title.function_ {
                        color: #d2a8ff;
                    }
                    .hljs-function {
                        color: #d2a8ff;
                    }
                    .hljs-tag {
                        color: #7ee787;
                    }
                    .hljs-name {
                        color: #7ee787;
                    }
                    .hljs-attribute {
                        color: #79c0ff;
                    }
                    .hljs-built_in {
                        color: #ffa657;
                    }
                    .hljs-params {
                        color: #e6edf3;
                    }
                    .hljs-meta {
                        color: #8b949e;
                    }
                    .hljs-regexp {
                        color: #a5d6ff;
                    }
                    .hljs-selector-class,
                    .hljs-selector-id {
                        color: #7ee787;
                    }
                `
        );
      case "monokai":
        return (
          baseStyles +
          `
                    .hljs {
                        color: #f8f8f2;
                    }
                    .hljs-comment,
                    .hljs-quote {
                        color: #75715e;
                        font-style: italic;
                    }
                    .hljs-keyword,
                    .hljs-selector-tag {
                        color: #f92672;
                    }
                    .hljs-string,
                    .hljs-attr {
                        color: #e6db74;
                    }
                    .hljs-number,
                    .hljs-literal {
                        color: #ae81ff;
                    }
                    .hljs-variable,
                    .hljs-template-variable {
                        color: #fd971f;
                    }
                    .hljs-title,
                    .hljs-title.class_,
                    .hljs-title.function_ {
                        color: #a6e22e;
                    }
                    .hljs-function {
                        color: #66d9ef;
                    }
                    .hljs-tag {
                        color: #f92672;
                    }
                    .hljs-name {
                        color: #f92672;
                    }
                    .hljs-attribute {
                        color: #a6e22e;
                    }
                    .hljs-built_in {
                        color: #66d9ef;
                    }
                    .hljs-params {
                        color: #fd971f;
                    }
                    .hljs-type {
                        color: #66d9ef;
                        font-style: italic;
                    }
                `
        );
      case "vs":
        // VS Code Dark+ theme
        return (
          baseStyles +
          `
                    .hljs {
                        color: #d4d4d4;
                    }
                    .hljs-comment,
                    .hljs-quote {
                        color: #6a9955;
                        font-style: italic;
                    }
                    .hljs-keyword {
                        color: #569cd6;
                    }
                    .hljs-selector-tag {
                        color: #569cd6;
                    }
                    .hljs-string,
                    .hljs-attr {
                        color: #ce9178;
                    }
                    .hljs-number,
                    .hljs-literal {
                        color: #b5cea8;
                    }
                    .hljs-variable,
                    .hljs-template-variable {
                        color: #9cdcfe;
                    }
                    .hljs-title,
                    .hljs-title.class_,
                    .hljs-title.function_ {
                        color: #dcdcaa;
                    }
                    .hljs-function {
                        color: #dcdcaa;
                    }
                    .hljs-tag {
                        color: #569cd6;
                    }
                    .hljs-name {
                        color: #4ec9b0;
                    }
                    .hljs-attribute {
                        color: #9cdcfe;
                    }
                    .hljs-built_in {
                        color: #4ec9b0;
                    }
                    .hljs-type {
                        color: #4ec9b0;
                    }
                    .hljs-params {
                        color: #9cdcfe;
                    }
                `
        );
      default:
        // Default to GitHub Dark style
        return (
          baseStyles +
          `
                    .hljs {
                        color: #e6edf3;
                    }
                    .hljs-comment,
                    .hljs-quote {
                        color: #8b949e;
                        font-style: italic;
                    }
                    .hljs-keyword {
                        color: #ff7b72;
                    }
                    .hljs-string {
                        color: #a5d6ff;
                    }
                    .hljs-number {
                        color: #79c0ff;
                    }
                    .hljs-title {
                        color: #d2a8ff;
                    }
                    .hljs-function {
                        color: #d2a8ff;
                    }
                `
        );
    }
  }

  /**
   * Create temporary container for rendering
   */
  private createRenderContainer(
    html: string,
    options: PdfStylingOptions,
  ): HTMLElement {
    const container = document.createElement("div");
    container.innerHTML = html;
    container.style.position = "absolute";
    container.style.top = "-9999px";
    container.style.left = "-9999px";

    // Compute content width in mm: page width minus margins
    const dims = PDF_FORMAT_DIMENSIONS[options.format];
    const pageWidthMm =
      options.orientation === "landscape" ? dims.height : dims.width;
    const contentWidthMm =
      pageWidthMm - options.margin.left - options.margin.right;
    container.style.width = `${contentWidthMm}mm`;

    container.style.background = "white";
    container.style.fontSize = `${options.fontSize}px`;
    container.style.lineHeight = `${options.lineHeight}`;
    container.style.padding = "0"; // margins are handled by PDF placement
    container.style.boxSizing = "content-box";

    // Improve print-like layout by constraining images and avoiding collapsed margins
    const contentEl = container.querySelector(
      ".pdf-content",
    ) as HTMLElement | null;
    if (contentEl) {
      contentEl.style.margin = "0";
      contentEl.style.padding = "0";
    }

    return container;
  }

  /**
   * Create PDF from canvas
   */
  private initPdf(options: PdfStylingOptions): jsPDF {
    const { format, orientation } = options;
    const dimensions = PDF_FORMAT_DIMENSIONS[format];
    const pdfWidth =
      orientation === "landscape" ? dimensions.height : dimensions.width;
    const pdfHeight =
      orientation === "landscape" ? dimensions.width : dimensions.height;

    return new jsPDF({
      orientation: orientation === "landscape" ? "l" : "p",
      unit: "mm",
      format: [pdfWidth, pdfHeight],
    });
  }

  private placeCanvasOnPdf(
    pdf: jsPDF,
    canvas: HTMLCanvasElement,
    options: PdfStylingOptions,
  ): void {
    const { format, orientation } = options;
    const dims = PDF_FORMAT_DIMENSIONS[format];
    const pdfWidth = orientation === "landscape" ? dims.height : dims.width;
    const pdfHeight = orientation === "landscape" ? dims.width : dims.height;

    const headerHeight = options.header?.enabled
      ? options.header.height || 0
      : 0;
    const footerHeight = options.footer?.enabled
      ? options.footer.height || 0
      : 0;

    const contentX = options.margin.left;
    const contentY = options.margin.top + headerHeight;
    const contentWidth = pdfWidth - options.margin.left - options.margin.right;
    const contentHeight =
      pdfHeight -
      options.margin.top -
      options.margin.bottom -
      headerHeight -
      footerHeight;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    let imgWidth = contentWidth;
    let imgHeight = imgWidth / ratio;
    if (imgHeight > contentHeight) {
      imgHeight = contentHeight;
      imgWidth = imgHeight * ratio;
    }

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", contentX, contentY, imgWidth, imgHeight);
  }

  private drawHeaderFooterAndPageNumbers(
    pdf: jsPDF,
    options: PdfStylingOptions,
    pageNumber: number,
    totalPages: number,
  ): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const headerEnabled = options.header?.enabled;
    const footerEnabled = options.footer?.enabled;

    const headerHeight = headerEnabled ? options.header?.height || 0 : 0;
    const footerHeight = footerEnabled ? options.footer?.height || 0 : 0;

    const contentWidth = pageWidth - options.margin.left - options.margin.right;

    // Helper to align text
    const drawAlignedText = (
      text: string,
      xLeft: number,
      y: number,
      width: number,
      align: "left" | "center" | "right" = "center",
    ) => {
      if (!text) return;
      const prevSize =
        typeof pdf.getFontSize === "function" ? pdf.getFontSize() : 12;
      const size =
        options.pageNumbers?.fontSize ||
        options.header?.fontSize ||
        options.footer?.fontSize ||
        10;
      pdf.setFontSize(size);
      let x = xLeft;
      if (align === "center") x = xLeft + width / 2;
      if (align === "right") x = xLeft + width;
      pdf.text(text, x, y, { align });
      pdf.setFontSize(prevSize);
    };

    // Header
    if (headerEnabled && headerHeight > 0) {
      const y = options.margin.top - 1 + headerHeight / 2; // visually centered
      const headerAlign = options.header?.alignment || "center";
      const headerTextRaw = options.header?.content || "";
      const headerText = this.applyTemplate(headerTextRaw, {
        ...options.header?.variables,
        pageNumber: String(pageNumber),
        totalPages: String(totalPages),
        date: new Date().toLocaleDateString(),
      });
      if (options.header?.backgroundColor) {
        pdf.setFillColor(options.header.backgroundColor);
        pdf.rect(
          options.margin.left,
          options.margin.top - headerHeight,
          contentWidth,
          headerHeight,
          "F",
        );
      }
      drawAlignedText(
        headerText,
        options.margin.left,
        y,
        contentWidth,
        headerAlign,
      );

      if (options.header?.borderBottom) {
        const lineY = options.margin.top + headerHeight - 0.5;
        pdf.setLineWidth(0.2);
        pdf.line(
          options.margin.left,
          lineY,
          pageWidth - options.margin.right,
          lineY,
        );
      }
    }

    // Page numbers (can be configured via pageNumbers or footer)
    const pageNumbersEnabled =
      options.pageNumbers?.enabled || options.footer?.includePageNumbers;
    if (pageNumbersEnabled) {
      const fmt =
        options.pageNumbers?.format ||
        options.footer?.pageNumberFormat ||
        "page-of-total";
      const text = this.formatPageNumber(fmt, pageNumber, totalPages);
      const position = options.pageNumbers?.position || "footer";
      const align = options.pageNumbers?.alignment || "center";

      if (position === "header" && headerEnabled) {
        const y =
          options.margin.top - 1 + (headerHeight > 0 ? headerHeight / 2 : 6);
        drawAlignedText(text, options.margin.left, y, contentWidth, align);
      } else if (footerEnabled) {
        const y =
          pageHeight -
          options.margin.bottom -
          (footerHeight > 0 ? footerHeight / 2 : 6);
        drawAlignedText(text, options.margin.left, y, contentWidth, align);
      }
    }

    // Footer
    if (footerEnabled && footerHeight > 0) {
      const y = pageHeight - options.margin.bottom - footerHeight / 2;
      const footerAlign = options.footer?.alignment || "center";
      const footerTextRaw = options.footer?.content || "";
      const footerText = this.applyTemplate(footerTextRaw, {
        ...options.footer?.variables,
        pageNumber: String(pageNumber),
        totalPages: String(totalPages),
        date: new Date().toLocaleDateString(),
      });
      if (options.footer?.backgroundColor) {
        pdf.setFillColor(options.footer.backgroundColor);
        pdf.rect(
          options.margin.left,
          pageHeight - options.margin.bottom - footerHeight,
          contentWidth,
          footerHeight,
          "F",
        );
      }
      drawAlignedText(
        footerText,
        options.margin.left,
        y,
        contentWidth,
        footerAlign,
      );

      if (options.footer?.borderTop) {
        const lineY = pageHeight - options.margin.bottom - footerHeight + 0.5;
        pdf.setLineWidth(0.2);
        pdf.line(
          options.margin.left,
          lineY,
          pageWidth - options.margin.right,
          lineY,
        );
      }
    }
  }

  private formatPageNumber(
    format: "page-of-total" | "page-only" | "total-only",
    current: number,
    total: number,
  ): string {
    switch (format) {
      case "page-only":
        return `${current}`;
      case "total-only":
        return `${total}`;
      default:
        return `${current} / ${total}`;
    }
  }

  private applyTemplate(
    template: string,
    vars: Record<string, string | number | undefined>,
  ): string {
    return template.replace(/{{\s*(\w+)\s*}}/g, (_m, key) => {
      const val = vars[key];
      return val !== undefined ? String(val) : "";
    });
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

  /**
   * Escape HTML characters to prevent XSS
   */
  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Fallback method to manually process task lists when plugin fails
   */
  private processTaskListsFallback(container: Element): void {
    const listItems = container.querySelectorAll("li");
    listItems.forEach((li) => {
      const text = li.textContent || "";
      const isTaskItem = text.match(/^\s*\[[ xX]\]\s/);

      if (isTaskItem) {
        const isChecked = text.match(/^\s*\[[xX]\]\s/);
        li.classList.add("pdf-task-item", "task-list-item");

        // Create checkbox element
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !!isChecked;
        checkbox.disabled = true;
        checkbox.classList.add("pdf-task-checkbox", "task-list-item-checkbox");

        // Remove the markdown checkbox syntax from text
        const cleanText = text.replace(/^\s*\[[ xX]\]\s/, "");
        li.innerHTML = "";
        li.appendChild(checkbox);
        li.appendChild(document.createTextNode(" " + cleanText));
      }
    });
  }

  /**
   * Fallback markdown parsing without any potentially problematic libraries
   */
  private parseMarkdownFallback(
    content: string,
    options: MarkdownOptions,
  ): MarkdownParseResult {
    try {
      // Try to use a safe MarkdownIt configuration first
      const fallbackProcessor = new MarkdownIt({
        html: false, // Disable HTML to avoid issues
        xhtmlOut: true,
        breaks: options.breaks,
        linkify: options.linkify,
        typographer: false, // Disable typographer to avoid issues
      });

      // Don't enable any plugins or features that might cause issues
      // Use a completely safe highlight function that doesn't call hljs
      fallbackProcessor.set({
        highlight: (str: string, lang: string) => {
          // Simple highlighting without hljs to avoid isSpace issues
          const escapedStr = this.escapeHtml(str);
          return `<pre class="hljs"><code class="hljs language-${lang || "plaintext"}">${escapedStr}</code></pre>`;
        },
      });

      // Parse markdown with ultra-minimal processor
      const html = fallbackProcessor.render(content);

      // Skip post-processing that might cause issues
      const processedHtml = html;

      // Extract headings and statistics (safe operations)
      const headings = this.extractHeadings(content);
      const wordCount = this.calculateWordCount(content);
      const readingTime = Math.ceil(wordCount / 200);

      // Simple regex-based extraction to avoid DOM issues
      const links: string[] = [];
      const images: string[] = [];
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
        warnings: [
          "Used minimal fallback parser. Some features (syntax highlighting, task lists, etc.) are disabled.",
        ],
      };
    } catch (error) {
      // If even the minimal MarkdownIt parser fails, use the emergency manual fallback
      console.warn(
        "MarkdownIt fallback failed, using emergency manual parser:",
        error,
      );
      return this.createBasicFallbackResult(content);
    }
  }

  /**
   * Create a basic fallback result without any markdown libraries - completely manual parsing
   */
  private createBasicFallbackResult(content: string): MarkdownParseResult {
    try {
      // Convert basic markdown manually without any libraries
      let html = this.escapeHtml(content);

      // Handle code blocks first (before other processing)
      html = html.replace(
        /```(\w+)?\n([\s\S]*?)\n```/g,
        (match, lang, code) => {
          const language = lang || "plaintext";
          return `<pre class="hljs"><code class="hljs language-${language}">${code}</code></pre>`;
        },
      );

      // Convert basic markdown features manually
      html = html
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
        .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
        .replace(/`([^`]+)`/g, '<code class="pdf-inline-code">$1</code>') // Inline code
        .replace(
          /^#{6}\s+(.*$)/gm,
          '<h6 class="pdf-heading pdf-heading-h6">$1</h6>',
        ) // H6
        .replace(
          /^#{5}\s+(.*$)/gm,
          '<h5 class="pdf-heading pdf-heading-h5">$1</h5>',
        ) // H5
        .replace(
          /^#{4}\s+(.*$)/gm,
          '<h4 class="pdf-heading pdf-heading-h4">$1</h4>',
        ) // H4
        .replace(
          /^#{3}\s+(.*$)/gm,
          '<h3 class="pdf-heading pdf-heading-h3">$1</h3>',
        ) // H3
        .replace(
          /^#{2}\s+(.*$)/gm,
          '<h2 class="pdf-heading pdf-heading-h2">$1</h2>',
        ) // H2
        .replace(
          /^#{1}\s+(.*$)/gm,
          '<h1 class="pdf-heading pdf-heading-h1">$1</h1>',
        ) // H1
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" class="pdf-link">$1</a>',
        ) // Links
        .replace(
          /!\[([^\]]*)\]\(([^)]+)\)/g,
          '<img src="$2" alt="$1" class="pdf-image">',
        ) // Images
        .replace(/~~(.*?)~~/g, '<del class="pdf-strikethrough">$1</del>') // Strikethrough
        .replace(/---/g, "<hr>") // Horizontal rules
        .replace(
          /^\> (.*$)/gm,
          '<blockquote class="pdf-blockquote">$1</blockquote>',
        ) // Blockquotes
        .replace(/^\* (.*$)/gm, '<li class="pdf-list-item">$1</li>') // Unordered lists
        .replace(/^\d+\. (.*$)/gm, '<li class="pdf-list-item">$1</li>') // Ordered lists
        .replace(
          /^- \[[ ]\] (.*$)/gm,
          '<li class="pdf-task-item"><input type="checkbox" disabled class="pdf-task-checkbox"> $1</li>',
        ) // Unchecked tasks
        .replace(
          /^- \[[xX]\] (.*$)/gm,
          '<li class="pdf-task-item"><input type="checkbox" checked disabled class="pdf-task-checkbox"> $1</li>',
        ); // Checked tasks

      // Handle paragraphs - split by double newlines and wrap in <p> tags
      const paragraphs = html.split(/\n\s*\n/);
      const processedParagraphs = paragraphs
        .map((paragraph) => {
          paragraph = paragraph.trim();
          if (!paragraph) return "";

          // Don't wrap if it's already a block element
          if (paragraph.match(/^<(h[1-6]|pre|blockquote|hr|li|ul|ol)/)) {
            return paragraph;
          }

          // Handle line breaks within paragraphs
          paragraph = paragraph.replace(/\n/g, "<br>");

          return `<p class="pdf-paragraph">${paragraph}</p>`;
        })
        .filter((p) => p);

      // Wrap list items in proper list containers
      html = processedParagraphs
        .join("\n")
        .replace(
          /(<li[^>]*>.*?<\/li>)\s*(<li[^>]*>.*?<\/li>)/g,
          (match, li1, li2) => {
            // Group consecutive list items
            return li1 + "\n" + li2;
          },
        );

      // Wrap consecutive list items in ul/ol tags
      html = html.replace(
        /(<li[^>]*>.*?<\/li>(?:\s*<li[^>]*>.*?<\/li>)*)/gs,
        (match) => {
          if (match.includes("pdf-task-item")) {
            return `<ul class="pdf-list task-list">${match}</ul>`;
          }
          return `<ul class="pdf-list">${match}</ul>`;
        },
      );

      // Basic statistics
      const wordCount = this.calculateWordCount(content);
      const readingTime = Math.ceil(wordCount / 200);
      const headings = this.extractHeadings(content);

      // Count features
      const tables = 0; // Manual parser doesn't support tables
      const codeBlocks = (content.match(/```/g) || []).length / 2;

      return {
        html,
        headings,
        wordCount,
        readingTime,
        links: [],
        images: [],
        tables,
        codeBlocks,
        warnings: [
          "Used emergency manual parser. Advanced features like tables are not supported, but basic formatting is preserved.",
        ],
      };
    } catch (error) {
      // If even the manual parsing fails, return minimal content
      console.error("Emergency manual parser failed:", error);
      const escapedContent = this.escapeHtml(content);
      return {
        html: `<div class="pdf-content"><pre>${escapedContent}</pre></div>`,
        headings: [],
        wordCount: this.calculateWordCount(content),
        readingTime: Math.ceil(this.calculateWordCount(content) / 200),
        links: [],
        images: [],
        tables: 0,
        codeBlocks: 0,
        warnings: [
          "All markdown parsing failed. Content displayed as plain text.",
        ],
      };
    }
  }
}

// Export a singleton instance
export const markdownToPdfService = new MarkdownToPdfService();
