'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    UserGroupIcon,
    TagIcon
} from '@heroicons/react/24/outline';
import { Button, Loading } from '@/components/ui';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { BulkOperations } from '@/components/admin/BulkOperations';
import { MultiSelectOption } from '@/types/admin/relationship';
import { AdminToolListItem } from '@/types/admin/tool';
import { TagDTO } from '@/types/tools/tool';
import { classNames } from '@/utils';

export default function BulkOperationsPage() {
    // const searchParams = useSearchParams();
    // const initialMode = searchParams.get('mode') === 'remove' ? 'remove' : 'assign';

    const [tools, setTools] = useState<AdminToolListItem[]>([]);
    const [tags, setTags] = useState<TagDTO[]>([]);
    const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
    const [showBulkOperations, setShowBulkOperations] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load tools and tags in parallel
            const [toolsResponse, tagsResponse] = await Promise.all([
                fetch('/api/admin/tools'),
                fetch('/api/admin/tags')
            ]);

            if (!toolsResponse.ok || !tagsResponse.ok) {
                throw new Error('Failed to load data');
            }

            const [toolsData, tagsData] = await Promise.all([
                toolsResponse.json(),
                tagsResponse.json()
            ]);

            setTools(toolsData.tools || []);
            setTags(tagsData.tags || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleStartBulkOperation = () => {
        if (selectedToolIds.length === 0) {
            setError('Please select at least one tool');
            return;
        }
        setShowBulkOperations(true);
    };

    const handleOperationComplete = () => {
        setShowBulkOperations(false);
        setSelectedToolIds([]);
        // Optionally reload data or show success message
    };

    const handleCloseBulkOperations = () => {
        setShowBulkOperations(false);
    };

    // Convert tools to MultiSelect options
    const toolOptions: MultiSelectOption[] = tools.map(tool => ({
        id: tool.id,
        label: tool.name,
        description: `${tool.slug} (${tool.tagCount} tags)`,
        isActive: tool.isActive,
        metadata: {
            slug: tool.slug,
            tagCount: tool.tagCount,
            displayOrder: tool.displayOrder
        }
    }));

    const selectedTools = tools.filter(tool => selectedToolIds.includes(tool.id));

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loading size="lg" />
                    <p className="mt-4 text-gray-600">Loading tools and tags...</p>
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
                    <h1 className="text-2xl font-bold text-gray-900">Bulk Operations</h1>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Data</h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <Button onClick={loadData} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/relationships">
                    <Button variant="outline" size="sm">
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Relationships
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bulk Tag Operations</h1>
                    <p className="text-gray-600">
                        Select tools and perform bulk tag assignments or removals
                    </p>
                </div>
            </div>

            {!showBulkOperations ? (
                <>
                    {/* Tool Selection */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <UserGroupIcon className="w-5 h-5 text-gray-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Select Tools</h2>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Choose the tools you want to apply bulk tag operations to
                            </p>
                        </div>
                        <div className="p-6">
                            <MultiSelect
                                options={toolOptions}
                                selectedIds={selectedToolIds}
                                onSelectionChange={setSelectedToolIds}
                                placeholder="Search and select tools..."
                                searchable={true}
                                label="Tools"
                                description="You can select multiple tools to apply the same tag operations"
                            />

                            {selectedToolIds.length > 0 && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                    <h3 className="font-medium text-blue-900 mb-2">
                                        Selected Tools ({selectedToolIds.length})
                                    </h3>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {selectedTools.map((tool) => (
                                            <div
                                                key={tool.id}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{tool.name}</span>
                                                    <span className="text-gray-500">({tool.slug})</span>
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
                                                    <span className="text-xs text-gray-500">
                                                        {tool.tagCount} tags
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Available Data Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <UserGroupIcon className="w-6 h-6 text-blue-600" />
                                <h3 className="text-lg font-medium text-gray-900">Available Tools</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Tools</span>
                                    <span className="font-semibold">{tools.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Active Tools</span>
                                    <span className="font-semibold text-green-600">
                                        {tools.filter(t => t.isActive).length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Inactive Tools</span>
                                    <span className="font-semibold text-gray-600">
                                        {tools.filter(t => !t.isActive).length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <TagIcon className="w-6 h-6 text-purple-600" />
                                <h3 className="text-lg font-medium text-gray-900">Available Tags</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Tags</span>
                                    <span className="font-semibold">{tags.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">With Colors</span>
                                    <span className="font-semibold text-purple-600">
                                        {tags.filter(t => t.color).length}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <div className="flex flex-wrap gap-1">
                                        {tags.slice(0, 8).map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white"
                                                style={{ backgroundColor: tag.color || '#6B7280' }}
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                        {tags.length > 8 && (
                                            <span className="text-xs text-gray-500 px-2 py-1">
                                                +{tags.length - 8} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-center">
                        <Button
                            onClick={handleStartBulkOperation}
                            disabled={selectedToolIds.length === 0}
                            size="lg"
                        >
                            Start Bulk Operation
                            {selectedToolIds.length > 0 && (
                                <span className="ml-2 px-2 py-1 bg-white/20 rounded text-sm">
                                    {selectedToolIds.length} tools
                                </span>
                            )}
                        </Button>
                    </div>
                </>
            ) : (
                /* Bulk Operations Modal */
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <BulkOperations
                        selectedTools={selectedTools}
                        availableTags={tags}
                        onOperationComplete={handleOperationComplete}
                        onClose={handleCloseBulkOperations}
                    />
                </div>
            )}
        </div>
    );
} 