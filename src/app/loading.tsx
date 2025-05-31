import { ToolGridFallback } from '@/components/ui';

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section Skeleton */}
            <section className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center animate-pulse">
                        <div className="h-12 bg-gray-200 rounded mx-auto mb-4 w-64"></div>
                        <div className="h-6 bg-gray-200 rounded mx-auto mb-8 w-96"></div>
                        <div className="h-10 bg-gray-200 rounded mx-auto w-80"></div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-4 lg:gap-8">
                    {/* Sidebar Skeleton */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded mb-4 w-24"></div>
                            <div className="space-y-3">
                                {Array.from({ length: 6 }, (_, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <div className="h-4 w-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Tools Grid */}
                    <div className="mt-8 lg:mt-0 lg:col-span-3">
                        <ToolGridFallback count={6} message="Loading tools..." />
                    </div>
                </div>
            </main>
        </div>
    );
} 