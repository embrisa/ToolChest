import type { Metadata } from 'next';
import { HashGeneratorTool } from '@/components/tools/HashGeneratorTool';

export const metadata: Metadata = {
    title: 'Hash Generator - Generate MD5, SHA-1, SHA-256, SHA-512 Hashes | ToolChest',
    description: 'Generate secure cryptographic hashes (MD5, SHA-1, SHA-256, SHA-512) from text or files. Fast, secure, and privacy-focused hash generation tool.',
    keywords: [
        'hash generator',
        'MD5 hash',
        'SHA-1 hash',
        'SHA-256 hash',
        'SHA-512 hash',
        'cryptographic hash',
        'checksum',
        'file hash',
        'text hash',
        'secure hash',
        'hash calculator'
    ],
    openGraph: {
        title: 'Hash Generator - Generate Secure Cryptographic Hashes',
        description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text or files. Privacy-focused with client-side processing.',
        type: 'website',
        url: '/tools/hash-generator',
        images: [
            {
                url: '/og-images/hash-generator.png',
                width: 1200,
                height: 630,
                alt: 'ToolChest Hash Generator Tool'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Hash Generator - Generate Secure Cryptographic Hashes',
        description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text or files. Privacy-focused with client-side processing.',
        images: ['/og-images/hash-generator.png']
    },
    alternates: {
        canonical: '/tools/hash-generator'
    }
};

export default function HashGeneratorPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Hash Generator
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    Generate secure cryptographic hashes (MD5, SHA-1, SHA-256, SHA-512) from text or files.
                    All processing happens in your browser for maximum privacy and security.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <h2 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        🔒 Privacy First
                    </h2>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your data never leaves your device. All hash generation is performed locally in your browser
                        using the Web Crypto API for maximum security and privacy.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">MD5</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            128-bit hash function. Fast but not cryptographically secure.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">SHA-1</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            160-bit hash function. Legacy algorithm, use SHA-256+ for security.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">SHA-256</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            256-bit hash function. Secure and widely used standard.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">SHA-512</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            512-bit hash function. Maximum security for sensitive data.
                        </p>
                    </div>
                </div>
            </div>

            <HashGeneratorTool />

            <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    About Hash Functions
                </h2>
                <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                    <p>
                        <strong>Hash functions</strong> are mathematical algorithms that convert input data of any size
                        into a fixed-size string of characters. They are widely used for data integrity verification,
                        password storage, and digital signatures.
                    </p>
                    <p>
                        <strong>Use cases:</strong> File integrity checking, password hashing, digital forensics,
                        blockchain technology, and data deduplication.
                    </p>
                    <p>
                        <strong>Security note:</strong> MD5 and SHA-1 are considered cryptographically broken and
                        should not be used for security-critical applications. Use SHA-256 or SHA-512 for secure applications.
                    </p>
                </div>
            </div>
        </div>
    );
} 