'use client';

import { useState, useEffect } from 'react';
import { AdminTagsFilters } from '@/types/admin/tag';
import { Input, Button } from '@/components/ui';

interface TagFiltersProps {
    filters: AdminTagsFilters;
    onFiltersChange: (filters: AdminTagsFilters) => void;
    onReset: () => void;
}

export function TagFilters({ filters, onFiltersChange, onReset }: TagFiltersProps) {
    const [localFilters, setLocalFilters] = useState<AdminTagsFilters>(filters);
    const [isExpanded, setIsExpanded] = useState(false);

    // Update local filters when props change
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleFilterChange = (key: keyof AdminTagsFilters, value: any) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleReset = () => {
        setLocalFilters({});
        onReset();
        setIsExpanded(false);
    };

    const hasActiveFilters = Object.values(filters).some(value =>
        value !== undefined && value !== null && value !== ''
    );

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                    {/* Search */}
                    <div className="flex-1 max-w-md">
                        <Input
                            type="text"
                            placeholder="Search tags..."
                            value={localFilters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Quick filters */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                            </svg>
                            <span>Filters</span>
                            <svg
                                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {hasActiveFilters && (
                            <Button
                                onClick={handleReset}
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filter count indicator */}
                {hasActiveFilters && (
                    <div className="ml-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {Object.values(filters).filter(value =>
                                value !== undefined && value !== null && value !== ''
                            ).length} filter{Object.values(filters).filter(value =>
                                value !== undefined && value !== null && value !== ''
                            ).length !== 1 ? 's' : ''} active
                        </span>
                    </div>
                )}
            </div>

            {/* Expanded filters */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Has Tools Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tool Assignment
                            </label>
                            <select
                                value={localFilters.hasTools === undefined ? '' : localFilters.hasTools.toString()}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    handleFilterChange('hasTools', value === '' ? undefined : value === 'true');
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Tags</option>
                                <option value="true">Has Tools</option>
                                <option value="false">No Tools</option>
                            </select>
                        </div>

                        {/* Placeholder for future filters */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Color
                            </label>
                            <select
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                            >
                                <option>All Colors (Coming Soon)</option>
                            </select>
                        </div>

                        {/* Placeholder for future filters */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Usage
                            </label>
                            <select
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                            >
                                <option>All Usage Levels (Coming Soon)</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter actions */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Use filters to narrow down the tag list and find what you're looking for.
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                onClick={() => setIsExpanded(false)}
                                variant="outline"
                                size="sm"
                            >
                                Collapse
                            </Button>
                            {hasActiveFilters && (
                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                    Reset All
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 