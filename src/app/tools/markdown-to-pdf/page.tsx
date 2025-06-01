import { Metadata } from "next";
import { MarkdownToPdfTool } from "@/components/tools/MarkdownToPdfTool";

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

export default function MarkdownToPdfPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30 dark:opacity-20" />
      <div className="absolute inset-0 bg-noise" />

      <div className="relative">
        <div className="container-wide py-8 sm:py-12">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl mb-6 shadow-colored">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <h1 className="text-display text-4xl sm:text-5xl lg:text-6xl mb-6">
              <span className="text-gradient bg-gradient-to-r from-warning-500 to-warning-600 bg-clip-text text-transparent">
                Markdown to PDF Converter
              </span>
            </h1>

            <p className="text-body text-lg sm:text-xl text-foreground-secondary max-w-3xl mx-auto leading-relaxed">
              Convert your markdown documents to professional PDFs with live
              preview and custom styling.
              <span className="block mt-2 text-warning-600 dark:text-warning-400 font-medium">
                All processing happens in your browser for maximum privacy.
              </span>
            </p>
          </div>

          {/* Privacy Badge */}
          <div
            className="flex justify-center mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="surface-glass rounded-xl px-6 py-3 border border-warning-200/50 dark:border-warning-800/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-warning-500 rounded-full animate-pulse-gentle" />
                <span className="text-sm font-medium text-warning-700 dark:text-warning-300">
                  🔒 Privacy-First • GitHub Flavored Markdown • Client-Side
                  Processing
                </span>
              </div>
            </div>
          </div>

          {/* Tool Component */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <MarkdownToPdfTool />
          </div>

          {/* Information Section */}
          <div
            className="mt-16 animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="card-glass p-8 sm:p-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-title text-2xl sm:text-3xl font-semibold text-foreground">
                  About Markdown to PDF Conversion
                </h2>
              </div>

              <div className="prose-custom">
                <p className="text-body text-lg text-foreground-secondary mb-8 leading-relaxed">
                  Transform your markdown documents into professional PDF files
                  with ease. Our converter supports GitHub Flavored Markdown
                  (GFM) including tables, code blocks, and task lists, giving
                  you the flexibility to create documents that maintain their
                  formatting and styling.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mt-8">
                  <div className="space-y-4">
                    <h3 className="text-heading text-xl font-semibold text-foreground flex items-center gap-3">
                      <div className="w-2 h-2 bg-warning-500 rounded-full" />
                      Key Features
                    </h3>
                    <ul className="space-y-3 text-foreground-secondary">
                      <li className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          Live markdown preview with real-time rendering
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Multiple PDF templates and themes</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>GitHub Flavored Markdown support</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Tables, code blocks, and task lists</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Custom styling and formatting options</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Multiple PDF formats (A4, Letter, etc.)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>File upload support (.md, .markdown, .txt)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Drag and drop file upload</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Real-time word count and statistics</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Professional PDF output with metadata</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-heading text-xl font-semibold text-foreground flex items-center gap-3">
                        <div className="w-2 h-2 bg-brand-500 rounded-full" />
                        Supported Markdown Features
                      </h3>
                      <div className="surface p-6 rounded-xl border border-brand-200/50 dark:border-brand-800/50 bg-brand-50/50 dark:bg-brand-950/20">
                        <ul className="space-y-2 text-sm text-foreground-secondary">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                            <span>
                              Headings (H1-H6) with automatic numbering
                            </span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                            <span>Bold and italic text formatting</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                            <span>Links and images with captions</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                            <span>Code blocks with syntax highlighting</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                            <span>Tables with proper formatting</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                            <span>Blockquotes and nested lists</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                            <span>Task lists with checkboxes</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                            <span>Auto-linking of URLs</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-heading text-xl font-semibold text-foreground flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent-500 rounded-full" />
                        PDF Templates
                      </h3>
                      <div className="surface p-6 rounded-xl border border-accent-200/50 dark:border-accent-800/50 bg-accent-50/50 dark:bg-accent-950/20">
                        <ul className="space-y-3 text-sm text-foreground-secondary">
                          <li className="flex items-start gap-3">
                            <svg
                              className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div>
                              <span className="font-medium">Default:</span>{" "}
                              Clean and simple design for general use
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <svg
                              className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div>
                              <span className="font-medium">Academic:</span>{" "}
                              Professional format for research papers
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <svg
                              className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div>
                              <span className="font-medium">Minimal:</span>{" "}
                              Clean design with lots of white space
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <svg
                              className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div>
                              <span className="font-medium">Professional:</span>{" "}
                              Business-ready with headers and footers
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security & Privacy Section */}
                <div className="mt-8 p-6 bg-gradient-to-r from-success-50 to-success-100 dark:from-success-950/20 dark:to-success-900/20 border border-success-200 dark:border-success-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-success-600 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h3 className="font-medium text-success-800 dark:text-success-200 mb-2">
                        Security & Privacy
                      </h3>
                      <ul className="text-sm text-success-700 dark:text-success-300 space-y-1 leading-relaxed">
                        <li>
                          • Client-side processing only - no markdown content
                          sent to servers
                        </li>
                        <li>
                          • Files stay on your device throughout the conversion
                          process
                        </li>
                        <li>• No data storage or logging of your documents</li>
                        <li>
                          • HTTPS encryption for security and open source
                          transparency
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* How to Use Section */}
                <div className="mt-8 p-6 bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-950/20 dark:to-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-brand-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-medium text-brand-800 dark:text-brand-200 mb-3">
                        How to Use
                      </h3>
                      <ol className="text-sm text-brand-700 dark:text-brand-300 space-y-2 leading-relaxed">
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            1
                          </span>
                          <span>
                            Choose between typing in the editor or uploading a
                            markdown file
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            2
                          </span>
                          <span>
                            Write or paste your markdown content in the editor
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            3
                          </span>
                          <span>
                            Use the live preview to see how your document will
                            look
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            4
                          </span>
                          <span>
                            Select a template or customize styling options
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            5
                          </span>
                          <span>
                            Click "Generate PDF" to create your document
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            6
                          </span>
                          <span>Download your professional PDF file</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
