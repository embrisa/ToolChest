import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { ToolCard } from '@/components/tools';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ServiceFactory } from '@/services/core/serviceFactory';
import { ToolService } from '@/services/tools';
import { ToolDTO } from '@/types/tools/tool';

// Enable ISR with 5 minute revalidation
export const revalidate = 300;

export const metadata: Metadata = {
    title: 'All Tools',
    description: 'Browse all available utility tools including Base64 encoding, hash generation, favicon creation, and more.',
    openGraph: {
        title: 'All Tools | ToolChest',
        description: 'Browse all available utility tools including Base64 encoding, hash generation, favicon creation, and more.',
    },
};

// Static data fetching with ISR
async function getTools(): Promise<ToolDTO[]> {
    try {
        const prisma = ServiceFactory.getInstance().getPrisma();
        const toolService = new ToolService(prisma);
        return await toolService.getAllTools();
    } catch (error) {
        console.error('Error fetching tools for static generation:', error);
        return [];
    }
}

function ToolGrid({ tools }: { tools: ToolDTO[] }) {
    if (tools.length === 0) {
        return (
            <div className="text-center py-12">
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5l-1-1z"
                    />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tools available</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Tools are being loaded. Please check back soon.
                </p>
            </div>
        );
    }

    return (
        <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            role="grid"
            aria-label="Available tools"
        >
            {tools.map((tool, index) => (
                <div key={tool.id} role="gridcell">
                    <ToolCard
                        tool={tool}
                        showUsageCount={true}
                        priority={index < 6} // Prioritize first 6 tools for loading
                        className="h-full"
                    />
                </div>
            ))}
        </div>
    );
}

function LoadingGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <SkeletonLoader
                    key={i}
                    variant="card"
                    className="h-48"
                />
            ))}
        </div>
    );
}

export default async function ToolsPage() {
    // Get tools at build time with ISR
    const tools = await getTools();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            All Tools
                        </h1>
                        <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
                            Explore our complete collection of utility tools designed to make your development workflow more efficient.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tools Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">
                                Available Tools
                            </h2>
                            <p className="text-sm text-gray-500">
                                {tools.length} tools available
                            </p>
                        </div>
                    </div>
                </div>

                <Suspense fallback={<LoadingGrid />}>
                    <ToolGrid tools={tools} />
                </Suspense>
            </main>
        </div>
    );
} 