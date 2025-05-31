'use client';

import { useState, useEffect } from 'react';
import { AdminToolsFilters } from '@/types/admin/tool';
import { TagDTO } from '@/types/tools/tool';
import { Input, Button } from '@/components/ui';

interface ToolFiltersProps {
    filters: AdminToolsFilters;
    availableTags: TagDTO[];
    onFiltersChange: (filters: AdminToolsFilters) => void;
    onReset: () => void;
}

export function ToolFilters({ filters, availableTags, onFiltersChange, onReset }: ToolFiltersProps) {
    const [searchInput, setSearchInput] = useState(filters.search || '');
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    // Debounced search
    useEffect(() => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            onFiltersChange({
                ...filters,
                search: searchInput.trim() || undefined
            });
        }, 300);

        setDebounceTimer(timer);

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [searchInput]);

    const handleActiveFilterChange = (value: string) => {
        let isActive: boolean | undefined;
        if (value === 'active') isActive = true;
        else if (value === 'inactive') isActive = false;
        else isActive = undefined;

        onFiltersChange({
            ...filters,
            isActive
        });
    };

    const handleTagToggle = (tagId: string) => {
        const currentTagIds = filters.tagIds || [];
        const newTagIds = currentTagIds.includes(tagId)
            ? currentTagIds.filter(id => id !== tagId)
            : [...currentTagIds, tagId];

        onFiltersChange({
            ...filters,
            tagIds: newTagIds.length > 0 ? newTagIds : undefined
        });
    };

    const hasFilters = filters.search ||
        typeof filters.isActive === 'boolean' ||
        (filters.tagIds && filters.tagIds.length > 0);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                    <label htmlFor="search-tools" className="block text-sm font-medium text-gray-700 mb-2">
                        Search Tools
                    </label>
                    <Input
                        id="search-tools"
                        type="text"
                        placeholder="Search by name, description, or slug..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Status Filter */}
                <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                    <select
                        id="status-filter"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={
                            typeof filters.isActive === 'boolean'
                                ? filters.isActive ? 'active' : 'inactive'
                                : 'all'
                        }
                        onChange={(e) => handleActiveFilterChange(e.target.value)}
                    >
                        <option value="all">All Tools</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>

                {/* Actions */}
                <div className="flex items-end">
                    <Button
                        onClick={onReset}
                        variant="outline"
                        disabled={!hasFilters}
                        className="mr-2"
                    >
                        Reset Filters
                    </Button>
                </div>
            </div>

            {/* Tag Filters */}
            {availableTags.length > 0 && (
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => {
                            const isSelected = filters.tagIds?.includes(tag.id) || false;
                            return (
                                <button
                                    key={tag.id}
                                    onClick={() => handleTagToggle(tag.id)}
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${isSelected
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    style={isSelected && tag.color ? {
                                        backgroundColor: tag.color,
                                        color: '#ffffff'
                                    } : {}}
                                    aria-pressed={isSelected}
                                    aria-label={`${isSelected ? 'Remove' : 'Add'} ${tag.name} filter`}
                                >
                                    {tag.name}
                                    {tag.toolCount !== undefined && (
                                        <span className="ml-1 opacity-75">
                                            ({tag.toolCount})
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Active Filters Summary */}
            {hasFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {filters.search && (
                                <span className="mr-4">
                                    <strong>Search:</strong> "{filters.search}"
                                </span>
                            )}
                            {typeof filters.isActive === 'boolean' && (
                                <span className="mr-4">
                                    <strong>Status:</strong> {filters.isActive ? 'Active' : 'Inactive'}
                                </span>
                            )}
                            {filters.tagIds && filters.tagIds.length > 0 && (
                                <span>
                                    <strong>Tags:</strong> {filters.tagIds.length} selected
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 