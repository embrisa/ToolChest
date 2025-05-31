'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminToolListItem, AdminToolsSortOptions, AdminToolsFilters } from '@/types/admin/tool';
import { TagDTO } from '@/types/tools/tool';
import { ToolTable, ToolFilters } from '@/components/admin';
import { Button } from '@/components/ui';

export default function AdminToolsPage() {
    const [tools, setTools] = useState<AdminToolListItem[]>([]);
    const [availableTags, setAvailableTags] = useState<TagDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [sortOptions, setSortOptions] = useState<AdminToolsSortOptions>({
        field: 'displayOrder',
        direction: 'asc'
    });

    const [filters, setFilters] = useState<AdminToolsFilters>({});

    // Load tools and tags
    useEffect(() => {
        loadData();
    }, [sortOptions, filters]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load tools with current sort and filter options
            const toolsParams = new URLSearchParams({
                sortField: sortOptions.field,
                sortDirection: sortOptions.direction,
                ...(filters.search && { search: filters.search }),
                ...(typeof filters.isActive === 'boolean' && { isActive: filters.isActive.toString() }),
                ...(filters.tagIds && filters.tagIds.length > 0 && { tagIds: filters.tagIds.join(',') })
            });

            const [toolsResponse, tagsResponse] = await Promise.all([
                fetch(`/api/admin/tools?${toolsParams}`),
                fetch('/api/tags')
            ]);

            if (!toolsResponse.ok) {
                throw new Error('Failed to load tools');
            }

            if (!tagsResponse.ok) {
                throw new Error('Failed to load tags');
            }

            const toolsData = await toolsResponse.json();
            const tagsData = await tagsResponse.json();

            setTools(toolsData.tools || []);
            setAvailableTags(tagsData.tags || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: AdminToolsSortOptions['field']) => {
        setSortOptions(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleFiltersChange = (newFilters: AdminToolsFilters) => {
        setFilters(newFilters);
    };

    const handleFiltersReset = () => {
        setFilters({});
    };

    const handleDelete = async (id: string, name: string) => {
        try {
            const response = await fetch(`/api/admin/tools/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete tool');
            }

            // Reload data after successful deletion
            await loadData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete tool');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading tools...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error loading tools</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                        </div>
                        <div className="mt-4">
                            <Button onClick={loadData} variant="outline" size="sm">
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tools Management</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage your tools, their settings, and tag assignments.
                    </p>
                </div>
                <Link href="/admin/tools/create">
                    <Button>
                        Create New Tool
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <ToolFilters
                filters={filters}
                availableTags={availableTags}
                onFiltersChange={handleFiltersChange}
                onReset={handleFiltersReset}
            />

            {/* Tools Table */}
            <div className="bg-white shadow-sm rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">
                        Tools ({tools.length})
                    </h2>
                </div>
                <ToolTable
                    tools={tools}
                    sortOptions={sortOptions}
                    onSort={handleSort}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
} 