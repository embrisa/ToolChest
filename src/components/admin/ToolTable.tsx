'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdminToolListItem, AdminToolsSortOptions } from '@/types/admin/tool';

interface ToolTableProps {
    tools: AdminToolListItem[];
    sortOptions: AdminToolsSortOptions;
    onSort: (field: AdminToolsSortOptions['field']) => void;
    onDelete: (id: string, name: string) => void;
}

export function ToolTable({ tools, sortOptions, onSort, onDelete }: ToolTableProps) {
    const [deletingToolId, setDeletingToolId] = useState<string | null>(null);

    const handleSort = (field: AdminToolsSortOptions['field']) => {
        onSort(field);
    };

    const handleDeleteClick = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            setDeletingToolId(id);
            onDelete(id, name);
        }
    };

    const getSortIcon = (field: AdminToolsSortOptions['field']) => {
        if (sortOptions.field !== field) {
            return '↕️';
        }
        return sortOptions.direction === 'asc' ? '↑' : '↓';
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <button
                                onClick={() => handleSort('name')}
                                className="flex items-center gap-1 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                                aria-label="Sort by name"
                            >
                                Name {getSortIcon('name')}
                            </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <button
                                onClick={() => handleSort('slug')}
                                className="flex items-center gap-1 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                                aria-label="Sort by slug"
                            >
                                Slug {getSortIcon('slug')}
                            </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tags
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <button
                                onClick={() => handleSort('displayOrder')}
                                className="flex items-center gap-1 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                                aria-label="Sort by display order"
                            >
                                Order {getSortIcon('displayOrder')}
                            </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <button
                                onClick={() => handleSort('usageCount')}
                                className="flex items-center gap-1 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                                aria-label="Sort by usage count"
                            >
                                Usage {getSortIcon('usageCount')}
                            </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <button
                                onClick={() => handleSort('updatedAt')}
                                className="flex items-center gap-1 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                                aria-label="Sort by last updated"
                            >
                                Updated {getSortIcon('updatedAt')}
                            </button>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {tools.map((tool) => (
                        <tr key={tool.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    {tool.iconClass && (
                                        <span className={`${tool.iconClass} mr-2 text-gray-600`} aria-hidden="true" />
                                    )}
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {tool.name}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 font-mono">
                                    {tool.slug}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-xs truncate" title={tool.description || 'No description'}>
                                    {tool.description || <span className="text-gray-400 italic">No description</span>}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap gap-1">
                                    {tool.tags.map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                            style={{
                                                backgroundColor: tag.color || '#e5e7eb',
                                                color: tag.color ? '#ffffff' : '#374151'
                                            }}
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                    {tool.tags.length === 0 && (
                                        <span className="text-gray-400 italic text-sm">No tags</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {tool.displayOrder}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {tool.usageCount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tool.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {tool.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(tool.updatedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        href={`/admin/tools/${tool.id}/edit`}
                                        className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteClick(tool.id, tool.name)}
                                        disabled={deletingToolId === tool.id}
                                        className="text-red-600 hover:text-red-900 focus:outline-none focus:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label={`Delete ${tool.name}`}
                                    >
                                        {deletingToolId === tool.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {tools.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No tools found. <Link href="/admin/tools/create" className="text-blue-600 hover:text-blue-800">Create your first tool</Link>.</p>
                </div>
            )}
        </div>
    );
} 