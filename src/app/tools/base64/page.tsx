import { Metadata } from 'next';
import { Base64Tool } from '@/components/tools/Base64Tool';

export const metadata: Metadata = {
    title: 'Base64 Encoder & Decoder | ToolChest',
    description: 'Free online Base64 encoder and decoder. Convert text to Base64 and decode Base64 to text. Supports file encoding/decoding with URL-safe options. Privacy-first with client-side processing.',
    keywords: [
        'base64',
        'encoder',
        'decoder',
        'encode',
        'decode',
        'text',
        'file',
        'url-safe',
        'online tool',
        'free',
        'privacy'
    ],
    openGraph: {
        title: 'Base64 Encoder & Decoder | ToolChest',
        description: 'Free online Base64 encoder and decoder with file support and URL-safe options. Privacy-first client-side processing.',
        type: 'website',
        url: '/tools/base64',
    },
    twitter: {
        card: 'summary',
        title: 'Base64 Encoder & Decoder | ToolChest',
        description: 'Free online Base64 encoder and decoder with file support and URL-safe options.',
    },
    alternates: {
        canonical: '/tools/base64',
    },
};

export default function Base64Page() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        Base64 Encoder & Decoder
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                        Encode and decode Base64 data with support for text and files.
                        All processing happens in your browser for maximum privacy.
                    </p>
                </div>

                {/* Tool Component */}
                <Base64Tool />

                {/* Information Section */}
                <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        About Base64 Encoding
                    </h2>
                    <div className="prose text-gray-600 max-w-none">
                        <p className="mb-4">
                            Base64 is a binary-to-text encoding scheme that converts binary data into a text format
                            using a set of 64 characters. It&apos;s commonly used for encoding data in email, web pages,
                            and data URLs.
                        </p>
                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Features:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Text and file encoding/decoding</li>
                                    <li>URL-safe Base64 encoding option</li>
                                    <li>Client-side processing for privacy</li>
                                    <li>Copy to clipboard functionality</li>
                                    <li>Download encoded/decoded results</li>
                                    <li>Real-time encoding/decoding</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Security & Privacy:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>No data sent to servers</li>
                                    <li>Processing happens in your browser</li>
                                    <li>Files stay on your device</li>
                                    <li>No data storage or logging</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 