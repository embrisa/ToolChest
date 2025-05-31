import { Metadata } from 'next';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';

export const metadata: Metadata = {
    title: 'Analytics - ToolChest Admin',
    description: 'View comprehensive analytics and system performance metrics for ToolChest',
};

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Monitor tool usage, system performance, and user engagement metrics.
                </p>
            </div>

            {/* Analytics Dashboard */}
            <AnalyticsDashboard />
        </div>
    );
} 