'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdminTagListItem, AdminTagsSortOptions } from '@/types/admin/tag';
import { Button } from '@/components/ui';

interface TagTableProps {
    tags: AdminTagListItem[];
    sortOptions: AdminTagsSortOptions;
    onSort: (field: AdminTagsSortOptions['field']) => void;
    onDelete: (id: string, name: string) => Promise<void>;
}

export function TagTable({ tags, sortOptions, onSort, onDelete }: TagTableProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const handleDelete = async (id: string, name: string) => {
        try {
            setDeletingId(id);
            await onDelete(id, name);
            setShowDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting tag:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const getSortIcon = (field: AdminTagsSortOptions['field']) => {
        if (sortOptions.field !== field) {
            return (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }

        return sortOptions.direction === 'asc' ? (
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
        ) : (
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
        );
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

    if (tags.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tags found</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first tag.</p>
                <Link href="/admin/tags/create">
                    <Button>Create New Tag</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => onSort('name')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Name</span>
                                {getSortIcon('name')}
                            </div>
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => onSort('slug')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Slug</span>
                                {getSortIcon('slug')}
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => onSort('toolCount')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Tools</span>
                                {getSortIcon('toolCount')}
                            </div>
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => onSort('createdAt')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Created</span>
                                {getSortIcon('createdAt')}
                            </div>
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {tags.map((tag) => (
                        <tr key={tag.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    {tag.color && (
                                        <div
                                            className="w-4 h-4 rounded-full mr-3 border border-gray-300"
                                            style={{ backgroundColor: tag.color }}
                                            aria-label={`Tag color: ${tag.color}`}
                                        />
                                    )}
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {tag.name}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 font-mono">
                                    {tag.slug}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                    {tag.description || (
                                        <span className="text-gray-400 italic">No description</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-900">
                                        {tag.toolCount}
                                    </span>
                                    {tag.toolCount > 0 && (
                                        <div className="ml-2">
                                            <div className="flex -space-x-1">
                                                {tag.tools.slice(0, 3).map((tool) => (
                                                    <div
                                                        key={tool.id}
                                                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium border-2 border-white ${tool.isActive
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        title={`${tool.name} (${tool.isActive ? 'Active' : 'Inactive'})`}
                                                    >
                                                        {tool.name.charAt(0).toUpperCase()}
                                                    </div>
                                                ))}
                                                {tag.toolCount > 3 && (
                                                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border-2 border-white">
                                                        +{tag.toolCount - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(tag.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                    <Link
                                        href={`/admin/tags/${tag.id}/edit`}
                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => setShowDeleteConfirm(tag.id)}
                                        className="text-red-600 hover:text-red-900 transition-colors"
                                        disabled={deletingId === tag.id}
                                    >
                                        {deletingId === tag.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Tag</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete the tag "{tags.find(t => t.id === showDeleteConfirm)?.name}"?
                                    This action cannot be undone.
                                </p>
                                {((tags.find(t => t.id === showDeleteConfirm)?.toolCount ?? 0) > 0) && (
                                    <p className="text-sm text-red-600 mt-2">
                                        This tag is assigned to {tags.find(t => t.id === showDeleteConfirm)?.toolCount ?? 0} tool(s).
                                        Remove the tag from all tools before deleting.
                                    </p>
                                )}
                            </div>
                            <div className="items-center px-4 py-3">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setShowDeleteConfirm(null)}
                                        className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            const tag = tags.find(t => t.id === showDeleteConfirm);
                                            if (tag) {
                                                handleDelete(tag.id, tag.name);
                                            }
                                        }}
                                        disabled={(tags.find(t => t.id === showDeleteConfirm)?.toolCount ?? 0) > 0}
                                        className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 