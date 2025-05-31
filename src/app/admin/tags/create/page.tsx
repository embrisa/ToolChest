'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminTagFormData, AdminTagValidationErrors } from '@/types/admin/tag';
import { TagForm } from '@/components/admin';

export default function CreateTagPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<AdminTagValidationErrors>({});

    const handleSubmit = async (data: AdminTagFormData) => {
        try {
            setIsLoading(true);
            setErrors({});

            const response = await fetch('/api/admin/tags', {
                method: 'POST',
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
                    setErrors({ general: result.message || 'Failed to create tag' });
                }
                return;
            }

            // Success - redirect to tags list
            router.push('/admin/tags');
        } catch (error) {
            setErrors({ general: 'An unexpected error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/admin/tags');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Tag</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Add a new tag to organize and categorize your tools.
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
                            <h3 className="text-sm font-medium text-red-800">Error creating tag</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{errors.general}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Form */}
            <TagForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
                errors={errors}
            />
        </div>
    );
} 