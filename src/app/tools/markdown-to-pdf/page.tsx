import { Metadata } from 'next';
import { MarkdownToPdfTool } from '@/components/tools/MarkdownToPdfTool';

export const metadata: Metadata = {
    title: 'Markdown to PDF Converter | ToolChest',
    description: 'Free online Markdown to PDF converter with live preview. Convert markdown documents to professional PDFs with custom styling options. Supports GitHub Flavored Markdown, tables, code blocks, and more.',
    keywords: [
        'markdown',
        'pdf',
        'converter',
        'markdown to pdf',
        'document',
        'export',
        'github flavored markdown',
        'gfm',
        'live preview',
        'styling',
        'templates',
        'online tool',
        'free',
        'privacy'
    ],
    openGraph: {
        title: 'Markdown to PDF Converter | ToolChest',
        description: 'Convert markdown documents to professional PDFs with live preview and custom styling options. Privacy-first client-side processing.',
        type: 'website',
        url: '/tools/markdown-to-pdf',
    },
    twitter: {
        card: 'summary',
        title: 'Markdown to PDF Converter | ToolChest',
        description: 'Convert markdown documents to professional PDFs with live preview and custom styling.',
    },
    alternates: {
        canonical: '/tools/markdown-to-pdf',
    },
};

export default function MarkdownToPdfPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        Markdown to PDF Converter
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                        Convert your markdown documents to professional PDFs with live preview and custom styling.
                        All processing happens in your browser for maximum privacy.
                    </p>
                </div>

                {/* Tool Component */}
                <MarkdownToPdfTool />

                {/* Information Section */}
                <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        About Markdown to PDF Conversion
                    </h2>
                    <div className="prose text-gray-600 max-w-none">
                        <p className="mb-4">
                            Transform your markdown documents into professional PDF files with ease. Our converter
                            supports GitHub Flavored Markdown (GFM) including tables, code blocks, and task lists,
                            giving you the flexibility to create documents that maintain their formatting and styling.
                        </p>
                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Features:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Live markdown preview</li>
                                    <li>Multiple PDF templates and themes</li>
                                    <li>GitHub Flavored Markdown support</li>
                                    <li>Tables, code blocks, and task lists</li>
                                    <li>Custom styling and formatting options</li>
                                    <li>Multiple PDF formats (A4, Letter, etc.)</li>
                                    <li>File upload support (.md, .markdown, .txt)</li>
                                    <li>Drag and drop file upload</li>
                                    <li>Real-time word count and statistics</li>
                                    <li>Professional PDF output with metadata</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Supported Markdown Features:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Headings (H1-H6)</li>
                                    <li>Bold and italic text</li>
                                    <li>Links and images</li>
                                    <li>Code blocks with syntax highlighting</li>
                                    <li>Tables with proper formatting</li>
                                    <li>Blockquotes and lists</li>
                                    <li>Horizontal rules</li>
                                    <li>Task lists (checkboxes)</li>
                                    <li>Line breaks and paragraphs</li>
                                    <li>Auto-linking of URLs</li>
                                </ul>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">PDF Templates:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li><strong>Default:</strong> Clean and simple design</li>
                                    <li><strong>Academic:</strong> Professional format for research</li>
                                    <li><strong>Minimal:</strong> Clean design with lots of white space</li>
                                    <li><strong>Professional:</strong> Business-ready with headers/footers</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Security & Privacy:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Client-side processing only</li>
                                    <li>No markdown content sent to servers</li>
                                    <li>Files stay on your device</li>
                                    <li>No data storage or logging</li>
                                    <li>HTTPS encryption for security</li>
                                    <li>Open source and transparent</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-medium text-blue-900 mb-2">How to Use:</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                                <li>Choose between typing in the editor or uploading a markdown file</li>
                                <li>Write or paste your markdown content in the editor</li>
                                <li>Use the live preview to see how your document will look</li>
                                <li>Select a template or customize styling options</li>
                                <li>Click &quot;Generate PDF&quot; to create your document</li>
                                <li>Download your professional PDF file</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 