'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminToolFormData, AdminToolValidationErrors } from '@/types/admin/tool';
import { TagDTO } from '@/types/tools/tool';
import { ToolForm } from '@/components/admin';

export default function CreateToolPage() {
    const router = useRouter();
    const [availableTags, setAvailableTags] = useState<TagDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<AdminToolValidationErrors>({});

    // Load available tags
    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        try {
            const response = await fetch('/api/tags');
            if (response.ok) {
                const data = await response.json();
                setAvailableTags(data.tags || []);
            }
        } catch (err) {
            console.error('Failed to load tags:', err);
        }
    };

    const handleSubmit = async (formData: AdminToolFormData) => {
        try {
            setLoading(true);
            setErrors({});

            const response = await fetch('/api/admin/tools', {
                method: 'POST',
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
                    setErrors({ general: data.message || 'Failed to create tool' });
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

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Create New Tool</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Add a new tool to your ToolChest collection.
                </p>
            </div>

            <ToolForm
                availableTags={availableTags}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={loading}
                errors={errors}
            />
        </div>
    );
} 