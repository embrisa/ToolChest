'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminToolFormData, AdminToolValidationErrors } from '@/types/admin/tool';
import { TagDTO, ToolDTO } from '@/types/tools/tool';
import { ToolForm } from '@/components/admin';

export default function EditToolPage() {
    const router = useRouter();
    const params = useParams();
    const toolId = params.id as string;

    const [tool, setTool] = useState<ToolDTO | null>(null);
    const [availableTags, setAvailableTags] = useState<TagDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errors, setErrors] = useState<AdminToolValidationErrors>({});
    const [notFound, setNotFound] = useState(false);

    // Load tool data and available tags
    useEffect(() => {
        if (toolId) {
            loadData();
        }
    }, [toolId]);

    const loadData = async () => {
        try {
            setInitialLoading(true);
            setNotFound(false);

            const [toolResponse, tagsResponse] = await Promise.all([
                fetch(`/api/admin/tools/${toolId}`),
                fetch('/api/tags')
            ]);

            if (toolResponse.status === 404) {
                setNotFound(true);
                return;
            }

            if (!toolResponse.ok) {
                throw new Error('Failed to load tool');
            }

            if (!tagsResponse.ok) {
                throw new Error('Failed to load tags');
            }

            const toolData = await toolResponse.json();
            const tagsData = await tagsResponse.json();

            setTool(toolData.tool);
            setAvailableTags(tagsData.tags || []);
        } catch (err) {
            console.error('Failed to load data:', err);
            setErrors({ general: 'Failed to load tool data' });
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (formData: AdminToolFormData) => {
        try {
            setLoading(true);
            setErrors({});

            const response = await fetch(`/api/admin/tools/${toolId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || 'Failed to update tool' });
                }
                return;
            }

            // Success - redirect to tools list
            router.push('/admin/tools');
        } catch (err) {
            setErrors({
                general: err instanceof Error ? err.message : 'An unexpected error occurred'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/admin/tools');
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading tool...</p>
                </div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Tool Not Found</h1>
                <p className="text-gray-600 mb-6">The tool you're looking for doesn't exist or has been deleted.</p>
                <button
                    onClick={() => router.push('/admin/tools')}
                    className="text-blue-600 hover:text-blue-800 underline"
                >
                    Back to Tools
                </button>
            </div>
        );
    }

    if (!tool) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-red-800">Error loading tool</h3>
                <div className="mt-2 text-sm text-red-700">
                    <p>Failed to load tool data. Please try again.</p>
                </div>
                <div className="mt-4">
                    <button
                        onClick={loadData}
                        className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Prepare initial form data
    const initialData: Partial<AdminToolFormData> = {
        name: tool.name,
        slug: tool.slug,
        description: tool.description || '',
        iconClass: tool.iconClass || '',
        displayOrder: tool.displayOrder,
        isActive: tool.isActive,
        tagIds: tool.tags?.map(tag => tag.id) || []
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Edit Tool</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Update the settings and configuration for "{tool.name}".
                </p>
            </div>

            <ToolForm
                initialData={initialData}
                availableTags={availableTags}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isEditing={true}
                isLoading={loading}
                errors={errors}
            />
        </div>
    );
} 