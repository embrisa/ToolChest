'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminTagListItem, AdminTagsSortOptions, AdminTagsFilters } from '@/types/admin/tag';
import { TagTable, TagFilters } from '@/components/admin';
import { Button } from '@/components/ui';

export default function AdminTagsPage() {
    const [tags, setTags] = useState<AdminTagListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [sortOptions, setSortOptions] = useState<AdminTagsSortOptions>({
        field: 'name',
        direction: 'asc'
    });

    const [filters, setFilters] = useState<AdminTagsFilters>({});

    // Load tags
    useEffect(() => {
        loadData();
    }, [sortOptions, filters]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load tags with current sort and filter options
            const tagsParams = new URLSearchParams({
                sortField: sortOptions.field,
                sortDirection: sortOptions.direction,
                ...(filters.search && { search: filters.search }),
                ...(typeof filters.hasTools === 'boolean' && { hasTools: filters.hasTools.toString() })
            });

            const response = await fetch(`/api/admin/tags?${tagsParams}`);

            if (!response.ok) {
                throw new Error('Failed to load tags');
            }

            const data = await response.json();
            setTags(data.tags || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: AdminTagsSortOptions['field']) => {
        setSortOptions(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleFiltersChange = (newFilters: AdminTagsFilters) => {
        setFilters(newFilters);
    };

    const handleFiltersReset = () => {
        setFilters({});
    };

    const handleDelete = async (id: string, name: string) => {
        try {
            const response = await fetch(`/api/admin/tags/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete tag');
            }

            // Reload data after successful deletion
            await loadData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete tag');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading tags...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error loading tags</h3>
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
                    <h1 className="text-2xl font-bold text-gray-900">Tags Management</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage your tags and their assignments to tools.
                    </p>
                </div>
                <Link href="/admin/tags/create">
                    <Button>
                        Create New Tag
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <TagFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleFiltersReset}
            />

            {/* Tags Table */}
            <div className="bg-white shadow-sm rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">
                        Tags ({tags.length})
                    </h2>
                </div>
                <TagTable
                    tags={tags}
                    sortOptions={sortOptions}
                    onSort={handleSort}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
} 