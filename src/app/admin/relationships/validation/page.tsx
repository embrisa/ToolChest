'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    InformationCircleIcon,
    WrenchScrewdriverIcon,
    TagIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { Button, Loading } from '@/components/ui';
import {
    RelationshipValidationResult,
    OrphanedEntityCheck,
    BulkOperationResult
} from '@/types/admin/relationship';
import { classNames } from '@/utils';

interface ValidationData {
    validation: RelationshipValidationResult;
    orphans: OrphanedEntityCheck;
}

export default function RelationshipValidationPage() {
    const [validationData, setValidationData] = useState<ValidationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [autoResolving, setAutoResolving] = useState(false);
    const [autoResolveResult, setAutoResolveResult] = useState<BulkOperationResult | null>(null);

    useEffect(() => {
        runValidation();
    }, []);

    const runValidation = async () => {
        try {
            setLoading(true);
            setError(null);
            setAutoResolveResult(null);

            // Run validation and orphan checks in parallel
            const [validationResponse, orphansResponse] = await Promise.all([
                fetch('/api/admin/relationships/validation'),
                fetch('/api/admin/relationships/orphans')
            ]);

            if (!validationResponse.ok || !orphansResponse.ok) {
                throw new Error('Failed to run validation checks');
            }

            const [validationResult, orphanResult] = await Promise.all([
                validationResponse.json(),
                orphansResponse.json()
            ]);

            setValidationData({
                validation: validationResult,
                orphans: orphanResult
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to run validation');
        } finally {
            setLoading(false);
        }
    };

    const handleAutoResolve = async () => {
        try {
            setAutoResolving(true);
            setError(null);

            const response = await fetch('/api/admin/relationships/auto-resolve', {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to auto-resolve orphans');
            }

            const result: BulkOperationResult = await response.json();
            setAutoResolveResult(result);

            // Re-run validation after auto-resolve
            if (result.success) {
                setTimeout(() => {
                    runValidation();
                }, 1000);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to auto-resolve');
        } finally {
            setAutoResolving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/relationships">
                        <Button variant="outline" size="sm">
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />
                            Back to Relationships
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Relationship Validation</h1>
                </div>

                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loading size="lg" />
                        <p className="mt-4 text-gray-600">Running validation checks...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/relationships">
                        <Button variant="outline" size="sm">
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />
                            Back to Relationships
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Relationship Validation</h1>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Validation Error</h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <Button onClick={runValidation} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!validationData) {
        return null;
    }

    const { validation, orphans } = validationData;
    const hasIssues = !validation.isValid || validation.warnings.length > 0 ||
        orphans.orphanedTools.length > 0 || orphans.orphanedTags.length > 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/relationships">
                        <Button variant="outline" size="sm">
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />
                            Back to Relationships
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Relationship Validation</h1>
                        <p className="text-gray-600">
                            Check data integrity and resolve orphaned entities
                        </p>
                    </div>
                </div>
                <Button onClick={runValidation} variant="outline">
                    Re-run Validation
                </Button>
            </div>

            {/* Overall Status */}
            <div className={classNames(
                'rounded-lg p-6 border',
                hasIssues
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-green-50 border-green-200'
            )}>
                <div className="flex items-center gap-3 mb-3">
                    {hasIssues ? (
                        <ExclamationTriangleIcon className="w-8 h-8 text-amber-600" />
                    ) : (
                        <CheckCircleIcon className="w-8 h-8 text-green-600" />
                    )}
                    <div>
                        <h2 className={classNames(
                            'text-xl font-semibold',
                            hasIssues ? 'text-amber-800' : 'text-green-800'
                        )}>
                            {hasIssues ? 'Issues Found' : 'All Checks Passed'}
                        </h2>
                        <p className={classNames(
                            'text-sm',
                            hasIssues ? 'text-amber-700' : 'text-green-700'
                        )}>
                            {hasIssues
                                ? 'Your tool-tag relationships have some issues that may need attention'
                                : 'Your tool-tag relationships are properly configured'
                            }
                        </p>
                    </div>
                </div>

                {hasIssues && orphans.canAutoResolve && (
                    <div className="mt-4">
                        <Button
                            onClick={handleAutoResolve}
                            disabled={autoResolving}
                            isLoading={autoResolving}
                            variant="primary"
                        >
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            Auto-Resolve Issues
                        </Button>
                        <p className="text-sm text-amber-600 mt-2">
                            Automatically assign popular tags to untagged tools
                        </p>
                    </div>
                )}
            </div>

            {/* Auto-Resolve Result */}
            {autoResolveResult && (
                <div className={classNames(
                    'rounded-lg p-4 border',
                    autoResolveResult.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                )}>
                    <div className="flex items-center gap-2 mb-2">
                        {autoResolveResult.success ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        ) : (
                            <XCircleIcon className="w-5 h-5 text-red-600" />
                        )}
                        <h3 className={classNames(
                            'font-medium',
                            autoResolveResult.success ? 'text-green-800' : 'text-red-800'
                        )}>
                            Auto-Resolve {autoResolveResult.success ? 'Completed' : 'Failed'}
                        </h3>
                    </div>

                    {autoResolveResult.success && (
                        <div className="grid grid-cols-3 gap-4 text-center mt-3">
                            <div>
                                <div className="text-lg font-bold text-green-600">
                                    {autoResolveResult.totalChanges}
                                </div>
                                <div className="text-sm text-green-700">Changes Made</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-blue-600">
                                    {autoResolveResult.toolsAffected}
                                </div>
                                <div className="text-sm text-blue-700">Tools Updated</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-purple-600">
                                    {autoResolveResult.tagsAffected}
                                </div>
                                <div className="text-sm text-purple-700">Tags Assigned</div>
                            </div>
                        </div>
                    )}

                    {autoResolveResult.warnings.length > 0 && (
                        <div className="mt-3">
                            <h4 className="text-sm font-medium text-amber-800 mb-1">Warnings:</h4>
                            <ul className="text-sm text-amber-700 space-y-1">
                                {autoResolveResult.warnings.map((warning, index) => (
                                    <li key={index}>• {warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {autoResolveResult.errors.length > 0 && (
                        <div className="mt-3">
                            <h4 className="text-sm font-medium text-red-800 mb-1">Errors:</h4>
                            <ul className="text-sm text-red-700 space-y-1">
                                {autoResolveResult.errors.map((error, index) => (
                                    <li key={index}>• {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Validation Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Errors */}
                {validation.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <XCircleIcon className="w-5 h-5 text-red-600" />
                            <h3 className="text-lg font-medium text-red-800">
                                Critical Errors ({validation.errors.length})
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {validation.errors.map((error, index) => (
                                <div key={index} className="text-sm">
                                    <div className="font-medium text-red-800">{error.code}</div>
                                    <div className="text-red-700">{error.message}</div>
                                    {error.affectedIds && error.affectedIds.length > 0 && (
                                        <div className="text-red-600 text-xs mt-1">
                                            Affected: {error.affectedIds.length} item(s)
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Warnings */}
                {validation.warnings.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                            <h3 className="text-lg font-medium text-amber-800">
                                Warnings ({validation.warnings.length})
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {validation.warnings.map((warning, index) => (
                                <div key={index} className="text-sm">
                                    <div className="font-medium text-amber-800">{warning.code}</div>
                                    <div className="text-amber-700">{warning.message}</div>
                                    {warning.affectedIds && warning.affectedIds.length > 0 && (
                                        <div className="text-amber-600 text-xs mt-1">
                                            Affected: {warning.affectedIds.length} item(s)
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Suggestions */}
                {validation.suggestions.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-medium text-blue-800">
                                Suggestions ({validation.suggestions.length})
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {validation.suggestions.map((suggestion, index) => (
                                <div key={index} className="text-sm">
                                    <div className="font-medium text-blue-800">{suggestion.code}</div>
                                    <div className="text-blue-700">{suggestion.message}</div>
                                    {suggestion.affectedIds && suggestion.affectedIds.length > 0 && (
                                        <div className="text-blue-600 text-xs mt-1">
                                            Affected: {suggestion.affectedIds.length} item(s)
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Orphaned Entities */}
            {(orphans.orphanedTools.length > 0 || orphans.orphanedTags.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Orphaned Tools */}
                    {orphans.orphanedTools.length > 0 && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <WrenchScrewdriverIcon className="w-5 h-5 text-gray-600" />
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Untagged Tools ({orphans.orphanedTools.length})
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    Tools that don&apos;t have any tags assigned
                                </p>
                            </div>
                            <div className="p-6 max-h-64 overflow-y-auto">
                                <div className="space-y-3">
                                    {orphans.orphanedTools.map((tool) => (
                                        <div
                                            key={tool.id}
                                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-900">{tool.name}</div>
                                                <div className="text-sm text-gray-500">{tool.slug}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={classNames(
                                                    'px-2 py-1 text-xs rounded',
                                                    tool.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                )}>
                                                    {tool.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                <Link
                                                    href={`/admin/tools/${tool.id}/edit`}
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Orphaned Tags */}
                    {orphans.orphanedTags.length > 0 && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <TagIcon className="w-5 h-5 text-gray-600" />
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Unused Tags ({orphans.orphanedTags.length})
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    Tags that aren&apos;t assigned to any tools
                                </p>
                            </div>
                            <div className="p-6 max-h-64 overflow-y-auto">
                                <div className="space-y-3">
                                    {orphans.orphanedTags.map((tag) => (
                                        <div
                                            key={tag.id}
                                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded-full border border-gray-300"
                                                    style={{ backgroundColor: tag.color || '#6B7280' }}
                                                />
                                                <div>
                                                    <div className="font-medium text-gray-900">{tag.name}</div>
                                                    <div className="text-sm text-gray-500">{tag.slug}</div>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/admin/tags/${tag.id}/edit`}
                                                className="text-xs text-blue-600 hover:text-blue-800"
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Suggested Actions */}
            {orphans.suggestedActions.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Suggested Actions</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Recommended steps to improve your tool-tag relationships
                        </p>
                    </div>
                    <div className="p-6">
                        <ul className="space-y-2">
                            {orphans.suggestedActions.map((action, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <InformationCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <span className="text-gray-700">{action}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
} 