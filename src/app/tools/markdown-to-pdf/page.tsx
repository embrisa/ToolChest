import { Metadata } from "next";
import { MarkdownToPdfTool } from "@/components/tools/MarkdownToPdfTool";
import { ToolPageTemplate } from "@/components/ui/ToolPageTemplate";

export const metadata: Metadata = {
  title: "Markdown to PDF Converter | tool-chest",
  description:
    "Convert Markdown to professional PDF documents with syntax highlighting, custom styling, and support for tables, code blocks, and images. Privacy-first client-side processing.",
  keywords: [
    "markdown to pdf",
    "markdown converter",
    "pdf generator",
    "markdown pdf",
    "syntax highlighting",
    "code blocks",
    "tables",
    "document converter",
    "markdown export",
    "free tool",
  ],
  openGraph: {
    title: "Markdown to PDF Converter | tool-chest",
    description:
      "Convert Markdown to professional PDF documents with syntax highlighting and custom styling. Privacy-first client-side processing.",
    type: "website",
    url: "/tools/markdown-to-pdf",
  },
  alternates: {
    canonical: "/tools/markdown-to-pdf",
  },
};

const features = [
  {
    id: "live-preview",
    title: "Live Preview",
    description: "Real-time markdown preview with instant rendering",
    icon: "👁️",
  },
  {
    id: "templates",
    title: "Multiple Templates",
    description: "PDF templates and themes for different use cases",
    icon: "🎨",
  },
  {
    id: "gfm-support",
    title: "GitHub Flavored Markdown",
    description: "Full GFM support including tables and task lists",
    icon: "📝",
  },
  {
    id: "syntax-highlighting",
    title: "Syntax Highlighting",
    description: "Code blocks with syntax highlighting for multiple languages",
    icon: "💻",
  },
  {
    id: "custom-styling",
    title: "Custom Styling",
    description: "Customize fonts, colors, and layout options",
    icon: "⚙️",
  },
  {
    id: "file-upload",
    title: "File Upload",
    description: "Upload .md, .markdown, or .txt files directly",
    icon: "📁",
  },
  {
    id: "professional-output",
    title: "Professional Output",
    description: "High-quality PDF generation with metadata",
    icon: "📄",
  },
  {
    id: "privacy-first",
    title: "Privacy-First",
    description: "All processing happens in your browser",
    icon: "🔒",
  },
];

const infoSection = {
  title: "About Markdown to PDF Conversion",
  description:
    "Transform your markdown documents into professional PDF files with ease. Our converter supports GitHub Flavored Markdown (GFM) including tables, code blocks, and task lists, giving you the flexibility to create documents that maintain their formatting and styling.",
  sections: [
    {
      title: "Key Features",
      items: [
        { text: "Live markdown preview with real-time rendering" },
        { text: "Multiple PDF templates and themes" },
        { text: "GitHub Flavored Markdown support" },
        { text: "Tables, code blocks, and task lists" },
        { text: "Custom styling and formatting options" },
        { text: "Multiple PDF formats (A4, Letter, etc.)" },
        { text: "File upload support (.md, .markdown, .txt)" },
        { text: "Drag and drop file upload" },
        { text: "Real-time word count and statistics" },
        { text: "Professional PDF output with metadata" },
      ],
      titleIcon: {
        color: "bg-warning-500",
      },
    },
    {
      title: "Supported Markdown Features",
      items: [
        { text: "Headings (H1-H6) with automatic numbering" },
        { text: "Bold and italic text formatting" },
        { text: "Links and images with captions" },
        { text: "Code blocks with syntax highlighting" },
        { text: "Tables with proper formatting" },
        { text: "Blockquotes and nested lists" },
        { text: "Task lists with checkboxes" },
        { text: "Auto-linking of URLs" },
      ],
      titleIcon: {
        color: "bg-brand-500",
      },
    },
    {
      title: "PDF Templates",
      items: [
        { text: "Default: Clean and simple design for general use" },
        { text: "Academic: Professional format for research papers" },
        { text: "Minimal: Clean design with lots of white space" },
        { text: "Professional: Business-ready with headers and footers" },
      ],
      titleIcon: {
        color: "bg-accent-500",
      },
    },
    {
      title: "How to Use",
      items: [
        { text: "Choose between typing in the editor or uploading a markdown file" },
        { text: "Write or paste your markdown content in the editor" },
        { text: "Use the live preview to see how your document will look" },
        { text: "Select a template or customize styling options" },
        { text: "Click 'Generate PDF' to create your document" },
        { text: "Download your professional PDF file" },
      ],
      titleIcon: {
        color: "bg-success-500",
      },
    },
  ],
};

export default function MarkdownToPdfPage() {
  return (
    <ToolPageTemplate
      title="Markdown to PDF Converter"
      description="Convert your markdown documents to professional PDFs with live preview and custom styling."
      iconText="📄"
      iconClassName="bg-gradient-to-br from-warning-500 to-warning-600"
      featureGrid={{ features }}
      infoSection={infoSection}
      privacyMessage="🔒 Privacy-First • GitHub Flavored Markdown • Client-Side Processing"
      privacyColors={{
        iconColor: "bg-warning-500",
        textColor: "text-warning-700 dark:text-warning-300",
        borderColor: "border-warning-200/50 dark:border-warning-800/50",
      }}
    >
      <MarkdownToPdfTool />
    </ToolPageTemplate>
  );
}
