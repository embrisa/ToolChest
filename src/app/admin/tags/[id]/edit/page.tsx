'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminTagFormData, AdminTagValidationErrors } from '@/types/admin/tag';
import { TagDTO } from '@/types/tools/tool';
import { TagForm } from '@/components/admin';
import { Button } from '@/components/ui';

interface EditTagPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function EditTagPage({ params }: EditTagPageProps) {
    const router = useRouter();
    const [tag, setTag] = useState<TagDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<AdminTagValidationErrors>({});
    const [loadError, setLoadError] = useState<string | null>(null);
    const [tagId, setTagId] = useState<string | null>(null);

    useEffect(() => {
        const loadParams = async () => {
            const resolvedParams = await params;
            setTagId(resolvedParams.id);
        };
        loadParams();
    }, [params]);

    useEffect(() => {
        if (tagId) {
            loadTag();
        }
    }, [tagId]);

    const loadTag = async () => {
        try {
            setLoading(true);
            setLoadError(null);

            const response = await fetch(`/api/admin/tags/${tagId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    setLoadError('Tag not found');
                } else {
                    setLoadError('Failed to load tag');
                }
                return;
            }

            const data = await response.json();
            setTag(data.tag);
        } catch (error) {
            setLoadError('An error occurred while loading the tag');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: AdminTagFormData) => {
        try {
            setIsSubmitting(true);
            setErrors({});

            const response = await fetch(`/api/admin/tags/${tagId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.errors) {
                    setErrors(result.errors);
                } else {
                    setErrors({ general: result.message || 'Failed to update tag' });
                }
                return;
            }

            // Success - redirect to tags list
            router.push('/admin/tags');
        } catch (error) {
            setErrors({ general: 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/admin/tags');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading tag...</p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error loading tag</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{loadError}</p>
                        </div>
                        <div className="mt-4">
                            <Button onClick={loadTag} variant="outline" size="sm">
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!tag) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tag not found</h3>
                <p className="text-gray-600 mb-4">The tag you're looking for doesn't exist.</p>
                <Button onClick={() => router.push('/admin/tags')}>
                    Back to Tags
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Tag</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Update the details for "{tag.name}".
                </p>
            </div>

            {/* General Error */}
            {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error updating tag</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{errors.general}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Form */}
            <TagForm
                initialData={{
                    name: tag.name,
                    slug: tag.slug,
                    description: tag.description || '',
                    color: tag.color || '#3B82F6'
                }}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isEditing={true}
                isLoading={isSubmitting}
                errors={errors}
            />
        </div>
    );
} 