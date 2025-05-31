'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { ErrorPageProps } from '@/types/errors';
import {
    ExclamationTriangleIcon,
    HomeIcon,
    ArrowLeftIcon,
    ClipboardDocumentIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from '@heroicons/react/24/outline';

export function ErrorPage({
    statusCode,
    title,
    message,
    description,
    suggestions = [],
    recoveryActions = [],
    showContactSupport = false,
    showTechnicalDetails = false,
    technicalDetails,
}: ErrorPageProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopyTechnicalDetails = async () => {
        if (!technicalDetails) return;

        const details = [
            `Error ID: ${technicalDetails.errorId || 'N/A'}`,
            `Timestamp: ${technicalDetails.timestamp || 'N/A'}`,
            `Path: ${technicalDetails.path || 'N/A'}`,
            `User Agent: ${technicalDetails.userAgent || 'N/A'}`,
        ].join('\n');

        try {
            await navigator.clipboard.writeText(details);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = details;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const handleActionClick = (action: { type: string; onClick?: () => void; href?: string }) => {
        if (action.onClick) {
            action.onClick();
        } else if (action.href) {
            window.location.href = action.href;
        }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-2xl mx-auto text-center">
                {/* Error Code and Icon */}
                <div className="mb-8">
                    <div className="text-6xl font-bold text-red-600 mb-4" aria-hidden="true">
                        {statusCode}
                    </div>
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                            <ExclamationTriangleIcon className="w-12 h-12 text-red-600" aria-hidden="true" />
                        </div>
                    </div>
                </div>

                {/* Main Message */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {title}
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">
                        {message}
                    </p>
                    {description && (
                        <p className="text-gray-500">
                            {description}
                        </p>
                    )}
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Here&apos;s what you can do:
                        </h2>
                        <ul className="text-left space-y-2 text-gray-600 max-w-md mx-auto">
                            {suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0" aria-hidden="true"></span>
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Recovery Actions */}
                {recoveryActions.length > 0 && (
                    <div className="mb-8">
                        <div className="flex flex-wrap gap-3 justify-center">
                            {recoveryActions.map((action, index) => (
                                <Button
                                    key={index}
                                    variant={action.type === 'navigate_home' ? 'primary' : 'outline'}
                                    className="flex items-center gap-2"
                                    onClick={() => handleActionClick(action)}
                                >
                                    {action.type === 'navigate_home' && (
                                        <HomeIcon className="w-4 h-4" aria-hidden="true" />
                                    )}
                                    {action.type === 'navigate_back' && (
                                        <ArrowLeftIcon className="w-4 h-4" aria-hidden="true" />
                                    )}
                                    {action.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Technical Details Section */}
                {showTechnicalDetails && technicalDetails && (
                    <div className="mb-8 border-t pt-6">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="flex items-center gap-2 mx-auto text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                            aria-expanded={showDetails}
                            aria-controls="technical-details"
                        >
                            Technical Details
                            {showDetails ? (
                                <ChevronUpIcon className="w-4 h-4" aria-hidden="true" />
                            ) : (
                                <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
                            )}
                        </button>

                        {showDetails && (
                            <div
                                id="technical-details"
                                className="mt-4 p-4 bg-gray-50 rounded-lg text-left text-sm"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-medium text-gray-900">Error Information</h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopyTechnicalDetails}
                                        className="text-xs"
                                    >
                                        <ClipboardDocumentIcon className="w-3 h-3 mr-1" aria-hidden="true" />
                                        {copySuccess ? 'Copied!' : 'Copy'}
                                    </Button>
                                </div>
                                <dl className="space-y-2">
                                    {technicalDetails.errorId && (
                                        <>
                                            <dt className="font-medium text-gray-700">Error ID:</dt>
                                            <dd className="text-gray-600 font-mono text-xs break-all">
                                                {technicalDetails.errorId}
                                            </dd>
                                        </>
                                    )}
                                    {technicalDetails.timestamp && (
                                        <>
                                            <dt className="font-medium text-gray-700">Timestamp:</dt>
                                            <dd className="text-gray-600 font-mono text-xs">
                                                {new Date(technicalDetails.timestamp).toLocaleString()}
                                            </dd>
                                        </>
                                    )}
                                    {technicalDetails.path && (
                                        <>
                                            <dt className="font-medium text-gray-700">Path:</dt>
                                            <dd className="text-gray-600 font-mono text-xs break-all">
                                                {technicalDetails.path}
                                            </dd>
                                        </>
                                    )}
                                    {technicalDetails.userAgent && (
                                        <>
                                            <dt className="font-medium text-gray-700">User Agent:</dt>
                                            <dd className="text-gray-600 font-mono text-xs break-all">
                                                {technicalDetails.userAgent}
                                            </dd>
                                        </>
                                    )}
                                </dl>
                            </div>
                        )}
                    </div>
                )}

                {/* Contact Support */}
                {showContactSupport && (
                    <div className="pt-6 border-t">
                        <p className="text-sm text-gray-500 mb-3">
                            Need additional help? Our support team is here to assist you.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a
                                href={`mailto:support@toolchest.app?subject=Error Report - ${technicalDetails?.errorId || statusCode}`}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                Contact Support
                            </a>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                <HomeIcon className="w-4 h-4" aria-hidden="true" />
                                Return to Home
                            </Link>
                        </div>
                    </div>
                )}

                {/* Screen Reader Announcement */}
                <div className="sr-only" aria-live="polite" aria-atomic="true">
                    Error {statusCode}: {title}. {message}
                    {suggestions.length > 0 && ` ${suggestions.length} suggestions available.`}
                    {recoveryActions.length > 0 && ` ${recoveryActions.length} recovery actions available.`}
                </div>
            </div>
        </div>
    );
} 