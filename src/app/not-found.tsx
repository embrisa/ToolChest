import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { MagnifyingGlassIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
    title: '404 - Page Not Found',
    description: 'The page you requested could not be found. Find what you\'re looking for using our navigation or search.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-2xl mx-auto text-center">
                {/* Error Code and Icon */}
                <div className="mb-8">
                    <div className="text-6xl font-bold text-blue-600 mb-4" aria-hidden="true">
                        404
                    </div>
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                            <MagnifyingGlassIcon className="w-12 h-12 text-blue-600" aria-hidden="true" />
                        </div>
                    </div>
                </div>

                {/* Main Message */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Page Not Found
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                        The page you&apos;re looking for doesn&apos;t exist. It may have been moved, deleted, or you may have typed the URL incorrectly.
                    </p>
                </div>

                {/* Suggestions */}
                <div className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Here&apos;s what you can do:
                    </h2>
                    <ul className="text-left space-y-2 text-gray-600 max-w-md mx-auto">
                        <li className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" aria-hidden="true"></span>
                            Check the URL for typos
                        </li>
                        <li className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" aria-hidden="true"></span>
                            Use the navigation menu to find what you&apos;re looking for
                        </li>
                        <li className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" aria-hidden="true"></span>
                            Return to the home page
                        </li>
                        <li className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" aria-hidden="true"></span>
                            Search for tools using the search feature
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                    <Link href="/" className="w-full sm:w-auto">
                        <Button className="w-full">
                            <HomeIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                            Go to Home
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                        Go Back
                    </Button>
                </div>

                {/* Popular Tools Section */}
                <div className="border-t pt-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Popular Tools
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                        <Link
                            href="/tools/base64"
                            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <div className="font-medium text-gray-900">Base64 Tool</div>
                            <div className="text-sm text-gray-600 mt-1">
                                Encode and decode Base64 data
                            </div>
                        </Link>
                        <Link
                            href="/tools/hash-generator"
                            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <div className="font-medium text-gray-900">Hash Generator</div>
                            <div className="text-sm text-gray-600 mt-1">
                                Generate MD5, SHA hashes
                            </div>
                        </Link>
                        <Link
                            href="/tools/favicon-generator"
                            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <div className="font-medium text-gray-900">Favicon Generator</div>
                            <div className="text-sm text-gray-600 mt-1">
                                Create favicons from images
                            </div>
                        </Link>
                        <Link
                            href="/tools/markdown-to-pdf"
                            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <div className="font-medium text-gray-900">Markdown to PDF</div>
                            <div className="text-sm text-gray-600 mt-1">
                                Convert Markdown to PDF
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Contact Support */}
                <div className="mt-8 pt-6 border-t">
                    <p className="text-sm text-gray-500">
                        Still can&apos;t find what you&apos;re looking for?{' '}
                        <a
                            href="mailto:support@toolchest.app"
                            className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                        >
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
} 