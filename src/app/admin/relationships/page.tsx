import { Metadata } from 'next';
import Link from 'next/link';
import {
    TagIcon,
    WrenchScrewdriverIcon,
    ChartBarIcon,
    PlusIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';
import { TagUsageStats } from '@/components/admin/TagUsageStats';

export const metadata: Metadata = {
    title: 'Tool-Tag Relationships | Admin - ToolChest',
    description: 'Manage relationships between tools and tags with bulk operations and analytics.',
};

export default function AdminRelationshipsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tool-Tag Relationships</h1>
                    <p className="text-gray-600 mt-1">
                        Manage which tags are assigned to tools and analyze usage patterns
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/relationships/bulk">
                        <Button>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Bulk Operations
                        </Button>
                    </Link>
                    <Link href="/admin/relationships/matrix">
                        <Button variant="outline">
                            <ChartBarIcon className="w-4 h-4 mr-2" />
                            Relationship Matrix
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Tools</p>
                            <p className="text-2xl font-bold text-gray-900">--</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <WrenchScrewdriverIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link
                            href="/admin/tools"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Manage Tools →
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Tags</p>
                            <p className="text-2xl font-bold text-gray-900">--</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <TagIcon className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link
                            href="/admin/tags"
                            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                        >
                            Manage Tags →
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Relationships</p>
                            <p className="text-2xl font-bold text-gray-900">--</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <ArrowPathIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link
                            href="/admin/relationships/validation"
                            className="text-sm text-green-600 hover:text-green-800 font-medium"
                        >
                            Validate Data →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            href="/admin/relationships/bulk"
                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <PlusIcon className="w-5 h-5 text-blue-600" />
                                <h3 className="font-medium text-gray-900">Bulk Assign Tags</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                Assign multiple tags to selected tools at once
                            </p>
                        </Link>

                        <Link
                            href="/admin/relationships/bulk?mode=remove"
                            className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <ArrowPathIcon className="w-5 h-5 text-red-600" />
                                <h3 className="font-medium text-gray-900">Bulk Remove Tags</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                Remove tags from multiple tools simultaneously
                            </p>
                        </Link>

                        <Link
                            href="/admin/relationships/matrix"
                            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <ChartBarIcon className="w-5 h-5 text-purple-600" />
                                <h3 className="font-medium text-gray-900">View Matrix</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                See all tool-tag relationships in a matrix view
                            </p>
                        </Link>

                        <Link
                            href="/admin/relationships/validation"
                            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <ArrowPathIcon className="w-5 h-5 text-green-600" />
                                <h3 className="font-medium text-gray-900">Validate Relationships</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                Check for orphaned tools and tags
                            </p>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tag Usage Statistics */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Tag Usage Statistics</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Analyze how tags are being used across your tools
                    </p>
                </div>
                <div className="p-6">
                    <TagUsageStats />
                </div>
            </div>
        </div>
    );
} 