import type { Metadata } from 'next';
import { FaviconGeneratorTool } from '@/components/tools/FaviconGeneratorTool';

export const metadata: Metadata = {
    title: 'Favicon Generator - Create Favicons in All Sizes | ToolChest',
    description: 'Generate favicons in all standard sizes (16x16, 32x32, 180x180, 192x192, 512x512) from any image. Create complete favicon packages with PNG, ICO formats and web app manifest. Privacy-first with client-side processing.',
    keywords: [
        'favicon generator',
        'favicon creator',
        'icon generator',
        'favicon sizes',
        'favicon png',
        'favicon ico',
        'web app manifest',
        'apple touch icon',
        'android icon',
        'browser icon',
        'website icon',
        'favicon package',
        'privacy-first'
    ],
    openGraph: {
        title: 'Favicon Generator - Create Favicons in All Sizes',
        description: 'Generate complete favicon packages with all standard sizes. Privacy-first client-side processing with instant preview.',
        type: 'website',
        url: '/tools/favicon-generator',
        images: [
            {
                url: '/og-images/favicon-generator.png',
                width: 1200,
                height: 630,
                alt: 'ToolChest Favicon Generator Tool'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Favicon Generator - Create Favicons in All Sizes',
        description: 'Generate complete favicon packages with all standard sizes. Privacy-first client-side processing.',
        images: ['/og-images/favicon-generator.png']
    },
    alternates: {
        canonical: '/tools/favicon-generator'
    }
};

export default function FaviconGeneratorPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Favicon Generator
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    Generate favicons in all standard sizes from any image. Create complete favicon packages
                    with PNG, ICO formats and web app manifest. All processing happens in your browser for
                    maximum privacy and security.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <h2 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        🔒 Privacy First
                    </h2>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your images never leave your device. All favicon generation is performed locally in your browser
                        using the Canvas API for maximum security and privacy.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Browser Icons</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            16×16, 32×32, 48×48 favicons for browser tabs and bookmarks.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Apple Touch Icons</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            180×180 icons for iOS home screen and Safari bookmark icons.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Android Icons</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            192×192, 512×512 icons for Android home screen and PWA apps.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Web App Manifest</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Complete manifest.json for Progressive Web Apps.
                        </p>
                    </div>
                </div>
            </div>

            <FaviconGeneratorTool />

            <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    About Favicons
                </h2>
                <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                    <p>
                        <strong>Favicons</strong> (favorite icons) are small icons displayed in browser tabs, bookmarks,
                        and address bars. They help users identify your website quickly and improve brand recognition.
                        Modern websites require multiple favicon sizes for different devices and use cases.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Standard Sizes:</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>16×16, 32×32 - Browser tabs and bookmarks</li>
                                <li>48×48, 64×64 - Desktop shortcuts</li>
                                <li>96×96, 128×128 - High-DPI displays</li>
                                <li>180×180 - Apple touch icon</li>
                                <li>192×192, 512×512 - Android and PWA</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Best Practices:</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Use square images (1:1 aspect ratio)</li>
                                <li>Start with 512×512 source for best quality</li>
                                <li>Keep design simple and recognizable</li>
                                <li>Test on different backgrounds</li>
                                <li>Include all standard sizes</li>
                                <li>Use PNG format for transparency</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                        <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Implementation Tips:</h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Add generated favicons to your website&apos;s head section and include the manifest.json
                            for PWA support. Consider using different designs for very small sizes (16×16)
                            to maintain readability.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 