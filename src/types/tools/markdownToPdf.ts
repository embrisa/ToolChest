/**
 * Markdown-to-PDF operation mode
 */
export type MarkdownMode = "editor" | "upload";

/**
 * PDF output format options
 */
export type PdfFormat = "a4" | "letter" | "legal" | "a3" | "a5";

/**
 * PDF orientation
 */
export type PdfOrientation = "portrait" | "landscape";

/**
 * PDF styling theme
 */
export type PdfTheme =
  | "default"
  | "github"
  | "academic"
  | "minimal"
  | "dark"
  | "professional";

/**
 * Markdown syntax highlighting theme
 */
export type SyntaxTheme =
  | "github"
  | "monokai"
  | "vs"
  | "atom-one-dark"
  | "rainbow";

/**
 * Progress tracking for PDF generation
 */
export interface MarkdownToPdfProgress {
  stage: "parsing" | "rendering" | "generating" | "complete";
  progress: number; // 0-100
  currentStep: string;
  estimatedTimeRemaining?: number; // in seconds
}

/**
 * PDF generation result
 */
export interface PdfGenerationResult {
  success: boolean;
  pdfBlob?: Blob;
  pdfDataUrl?: string;
  error?: string;
  warnings?: string[];
  pageCount?: number;
  fileSize?: number; // in bytes
  processingTime?: number; // in milliseconds
  metadata?: PdfMetadata;
}

/**
 * PDF metadata for generation
 */
export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator: string;
  producer: string;
  creationDate: Date;
  htmlContent?: string; // Source HTML for reference
}

/**
 * Font family options for PDF generation
 */
export type PdfFontFamily =
  | "serif"
  | "sans-serif"
  | "monospace"
  | "times"
  | "helvetica"
  | "courier";

/**
 * Header/footer content template variables
 */
export interface HeaderFooterVariables {
  title?: string;
  author?: string;
  date?: string;
  pageNumber?: string;
  totalPages?: string;
  filename?: string;
}

/**
 * PDF styling options with enhanced customization
 */
export interface PdfStylingOptions {
  theme: PdfTheme;
  format: PdfFormat;
  orientation: PdfOrientation;

  // Typography options
  fontSize: number; // 8-24
  lineHeight: number; // 1.0-2.0
  fontFamily: PdfFontFamily;
  headingScale: number; // 1.0-2.0, multiplier for heading sizes

  // Color and layout
  backgroundColor?: string; // Background color for PDF
  textColor?: string; // Primary text color
  linkColor?: string; // Link color

  // Margins with accessibility considerations
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  // Enhanced header options
  header?: {
    enabled: boolean;
    content?: string;
    fontSize?: number;
    fontFamily?: PdfFontFamily;
    alignment?: "left" | "center" | "right";
    borderBottom?: boolean;
    backgroundColor?: string;
    textColor?: string;
    height?: number; // in mm
    variables?: HeaderFooterVariables;
  };

  // Enhanced footer options
  footer?: {
    enabled: boolean;
    content?: string;
    fontSize?: number;
    fontFamily?: PdfFontFamily;
    alignment?: "left" | "center" | "right";
    includePageNumbers?: boolean;
    pageNumberFormat?: "page-of-total" | "page-only" | "total-only";
    borderTop?: boolean;
    backgroundColor?: string;
    textColor?: string;
    height?: number; // in mm
    variables?: HeaderFooterVariables;
  };

  // Enhanced table of contents
  tableOfContents?: {
    enabled: boolean;
    title?: string;
    maxDepth?: number; // 1-6
    includePageNumbers?: boolean;
    dotFill?: boolean; // Add dots between title and page number
    fontSize?: number;
    fontFamily?: PdfFontFamily;
    indentSize?: number; // Indent per level in mm
    pageBreakAfter?: boolean;
  };

  // Syntax highlighting options
  syntaxHighlighting?: {
    enabled: boolean;
    theme: SyntaxTheme;
    fontSize?: number;
    fontFamily?: PdfFontFamily;
    lineNumbers?: boolean;
    highlightLines?: number[]; // Line numbers to highlight
  };

  // Page options
  pageNumbers?: {
    enabled: boolean;
    position: "header" | "footer";
    alignment: "left" | "center" | "right";
    format: "page-of-total" | "page-only" | "total-only";
    startNumber?: number;
    fontSize?: number;
    fontFamily?: PdfFontFamily;
  };

  // Advanced accessibility options
  accessibility?: {
    highContrast?: boolean;
    fontSize?: "small" | "normal" | "large" | "x-large";
    reducedMotion?: boolean;
    altTextForImages?: boolean;
    structuredHeadings?: boolean;
  };

  // Custom CSS for advanced styling
  customCss?: string;
}

/**
 * Markdown processing options
 */
export interface MarkdownOptions {
  enableGfm: boolean; // GitHub Flavored Markdown
  enableTables: boolean;
  enableTaskLists: boolean;
  enableMath: boolean; // KaTeX for math equations
  enableMermaid: boolean; // Mermaid diagrams
  sanitize: boolean;
  breaks: boolean; // Convert \n to <br>
  linkify: boolean; // Auto-convert URLs to links
}

/**
 * Markdown-to-PDF state
 */
export interface MarkdownToPdfState {
  mode: MarkdownMode;
  markdownContent: string;
  markdownFile: File | null;
  pdfResult: PdfGenerationResult | null;
  isProcessing: boolean;
  progress: MarkdownToPdfProgress | null;
  previewHtml: string;
  error: string | null;
  warnings: string[];
  validationErrors: ValidationError[];
  stylingOptions: PdfStylingOptions;
  markdownOptions: MarkdownOptions;
  showPreview: boolean;
  splitPaneSize: number; // 10-90, percentage for editor vs preview
}

/**
 * File validation result for markdown files
 */
export interface MarkdownFileValidation {
  isValid: boolean;
  error?: string;
  warnings?: string[];
  fileSize?: number;
  encoding?: string;
  lineCount?: number;
  wordCount?: number;
  isLargeFile?: boolean; // >1MB
}

/**
 * Validation error with accessibility support
 */
export interface ValidationError {
  field: string;
  message: string;
  type: "error" | "warning" | "info";
  code: string;
  line?: number; // For markdown syntax errors
  column?: number;
}

/**
 * Download options for PDF results
 */
export interface PdfDownloadOptions {
  filename: string;
  blob: Blob;
  metadata: PdfMetadata;
}

/**
 * Template preset for quick styling
 */
export interface PdfTemplate {
  id: string;
  name: string;
  description: string;
  preview?: string; // Preview image URL
  stylingOptions: Partial<PdfStylingOptions>;
  recommended?: boolean;
}

/**
 * Markdown parsing result
 */
export interface MarkdownParseResult {
  html: string;
  headings: MarkdownHeading[];
  wordCount: number;
  readingTime: number; // estimated minutes
  links: string[];
  images: string[];
  tables: number;
  codeBlocks: number;
  warnings?: string[];
}

/**
 * Markdown heading for table of contents
 */
export interface MarkdownHeading {
  level: number; // 1-6
  text: string;
  id: string;
  anchor: string;
}

/**
 * Accessibility announcement types
 */
export type A11yAnnouncementType = "polite" | "assertive";

/**
 * Accessibility announcement
 */
export interface A11yAnnouncement {
  message: string;
  type: A11yAnnouncementType;
  timestamp: number;
}

/**
 * Usage statistics
 */
export interface MarkdownToPdfUsageStats {
  totalConversions: number;
  totalPages: number;
  popularThemes: Record<PdfTheme, number>;
  popularFormats: Record<PdfFormat, number>;
  averageFileSize: number;
  lastUsed: Date;
}

/**
 * Default styling options
 */
export const DEFAULT_PDF_STYLING: PdfStylingOptions = {
  theme: "default",
  format: "a4",
  orientation: "portrait",
  fontSize: 12,
  lineHeight: 1.5,
  fontFamily: "sans-serif",
  headingScale: 1.2,
  backgroundColor: "#ffffff",
  textColor: "#000000",
  linkColor: "#0066cc",
  margin: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
  header: {
    enabled: false,
    alignment: "center",
    fontSize: 10,
    fontFamily: "sans-serif",
    borderBottom: false,
    height: 15,
  },
  footer: {
    enabled: true,
    alignment: "center",
    fontSize: 10,
    fontFamily: "sans-serif",
    includePageNumbers: true,
    pageNumberFormat: "page-of-total",
    borderTop: false,
    height: 15,
  },
  tableOfContents: {
    enabled: false,
    title: "Table of Contents",
    maxDepth: 3,
    includePageNumbers: true,
    dotFill: true,
    fontSize: 12,
    fontFamily: "sans-serif",
    indentSize: 10,
    pageBreakAfter: true,
  },
  syntaxHighlighting: {
    enabled: true,
    theme: "github",
    fontSize: 11,
    fontFamily: "monospace",
    lineNumbers: false,
  },
  pageNumbers: {
    enabled: true,
    position: "footer",
    alignment: "center",
    format: "page-of-total",
    startNumber: 1,
    fontSize: 10,
    fontFamily: "sans-serif",
  },
  accessibility: {
    highContrast: false,
    fontSize: "normal",
    reducedMotion: false,
    altTextForImages: true,
    structuredHeadings: true,
  },
};

/**
 * Default markdown options
 */
export const DEFAULT_MARKDOWN_OPTIONS: MarkdownOptions = {
  enableGfm: true,
  enableTables: true,
  enableTaskLists: true,
  enableMath: false,
  enableMermaid: false,
  sanitize: true,
  breaks: true,
  linkify: true,
};

/**
 * PDF format dimensions in mm
 */
export const PDF_FORMAT_DIMENSIONS: Record<
  PdfFormat,
  { width: number; height: number }
> = {
  a4: { width: 210, height: 297 },
  letter: { width: 216, height: 279 },
  legal: { width: 216, height: 356 },
  a3: { width: 297, height: 420 },
  a5: { width: 148, height: 210 },
};

/**
 * Predefined PDF templates with enhanced customization
 */
export const PDF_TEMPLATES: PdfTemplate[] = [
  {
    id: "default",
    name: "Default",
    description: "Clean and simple design suitable for most documents",
    recommended: true,
    stylingOptions: {
      theme: "default",
      fontSize: 12,
      lineHeight: 1.5,
      fontFamily: "sans-serif",
      headingScale: 1.2,
    },
  },
  {
    id: "academic",
    name: "Academic",
    description:
      "Professional format for research papers and academic documents",
    stylingOptions: {
      theme: "academic",
      fontSize: 11,
      lineHeight: 1.6,
      fontFamily: "serif",
      headingScale: 1.3,
      tableOfContents: {
        enabled: true,
        includePageNumbers: true,
        dotFill: true,
        pageBreakAfter: true,
      },
      header: {
        enabled: true,
        content: "{{title}}",
        borderBottom: true,
        fontFamily: "serif",
      },
      footer: {
        enabled: true,
        includePageNumbers: true,
        pageNumberFormat: "page-of-total",
        alignment: "center",
      },
      accessibility: {
        structuredHeadings: true,
        altTextForImages: true,
      },
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean minimal design with lots of white space",
    stylingOptions: {
      theme: "minimal",
      fontSize: 13,
      lineHeight: 1.7,
      fontFamily: "sans-serif",
      headingScale: 1.1,
      margin: { top: 30, right: 30, bottom: 30, left: 30 },
      syntaxHighlighting: {
        enabled: true,
        theme: "vs",
        fontFamily: "monospace",
      },
      pageNumbers: {
        enabled: false,
        position: "footer",
        alignment: "center",
        format: "page-of-total",
      },
    },
  },
  {
    id: "professional",
    name: "Professional",
    description: "Business-ready format with headers and footers",
    stylingOptions: {
      theme: "professional",
      fontSize: 11,
      lineHeight: 1.4,
      fontFamily: "sans-serif",
      headingScale: 1.25,
      header: {
        enabled: true,
        content: "{{title}} | {{date}}",
        alignment: "left",
        borderBottom: true,
        fontFamily: "sans-serif",
        fontSize: 9,
      },
      footer: {
        enabled: true,
        content: "{{author}}",
        includePageNumbers: true,
        alignment: "right",
        pageNumberFormat: "page-of-total",
        borderTop: true,
        fontFamily: "sans-serif",
        fontSize: 9,
      },
      tableOfContents: {
        enabled: true,
        includePageNumbers: true,
        dotFill: true,
      },
    },
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    description:
      "Accessibility-focused design with high contrast and larger text",
    stylingOptions: {
      theme: "default",
      fontSize: 14,
      lineHeight: 1.6,
      fontFamily: "sans-serif",
      headingScale: 1.4,
      backgroundColor: "#ffffff",
      textColor: "#000000",
      linkColor: "#0000ee",
      accessibility: {
        highContrast: true,
        fontSize: "large",
        structuredHeadings: true,
        altTextForImages: true,
      },
      syntaxHighlighting: {
        enabled: true,
        theme: "github",
        fontFamily: "monospace",
        fontSize: 13,
      },
    },
  },
  {
    id: "dark",
    name: "Dark Theme",
    description: "Dark background design for reduced eye strain",
    stylingOptions: {
      theme: "dark",
      fontSize: 12,
      lineHeight: 1.5,
      fontFamily: "sans-serif",
      headingScale: 1.2,
      backgroundColor: "#1a1a1a",
      textColor: "#e0e0e0",
      linkColor: "#4da6ff",
      syntaxHighlighting: {
        enabled: true,
        theme: "atom-one-dark",
        fontFamily: "monospace",
      },
      accessibility: {
        reducedMotion: true,
      },
    },
  },
];
