'use client';

import { useState, useEffect } from 'react';
import { AdminTagFormData, AdminTagValidationErrors } from '@/types/admin/tag';
import { Input, Button } from '@/components/ui';

interface TagFormProps {
    initialData?: Partial<AdminTagFormData>;
    onSubmit: (data: AdminTagFormData) => Promise<void>;
    onCancel: () => void;
    isEditing?: boolean;
    isLoading?: boolean;
    errors?: AdminTagValidationErrors;
}

const PRESET_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
];

export function TagForm({
    initialData,
    onSubmit,
    onCancel,
    isEditing = false,
    isLoading = false,
    errors = {}
}: TagFormProps) {
    const [formData, setFormData] = useState<AdminTagFormData>({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        description: initialData?.description || '',
        color: initialData?.color || '#3B82F6'
    });

    const [autoGenerateSlug, setAutoGenerateSlug] = useState(!isEditing);

    // Auto-generate slug from name
    useEffect(() => {
        if (autoGenerateSlug && formData.name) {
            const generatedSlug = formData.name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

            setFormData(prev => ({
                ...prev,
                slug: generatedSlug
            }));
        }
    }, [formData.name, autoGenerateSlug]);

    const handleInputChange = (field: keyof AdminTagFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                        <label htmlFor="tag-name" className="block text-sm font-medium text-gray-700 mb-2">
                            Tag Name *
                        </label>
                        <Input
                            id="tag-name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="e.g., Web Development"
                            className="w-full"
                            error={errors.name}
                            required
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600" role="alert">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Slug */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="tag-slug" className="block text-sm font-medium text-gray-700">
                                URL Slug *
                            </label>
                            <button
                                type="button"
                                onClick={() => setAutoGenerateSlug(!autoGenerateSlug)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                {autoGenerateSlug ? 'Manual' : 'Auto-generate'}
                            </button>
                        </div>
                        <Input
                            id="tag-slug"
                            type="text"
                            value={formData.slug}
                            onChange={(e) => {
                                setAutoGenerateSlug(false);
                                handleInputChange('slug', e.target.value);
                            }}
                            placeholder="e.g., web-development"
                            className="w-full font-mono"
                            error={errors.slug}
                            disabled={autoGenerateSlug}
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            URL: /tags/{formData.slug || 'tag-slug'}
                        </p>
                        {errors.slug && (
                            <p className="mt-1 text-sm text-red-600" role="alert">
                                {errors.slug}
                            </p>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                    <label htmlFor="tag-description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        id="tag-description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Brief description of this tag..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        maxLength={500}
                    />
                    <div className="flex justify-between mt-1">
                        <div>
                            {errors.description && (
                                <p className="text-sm text-red-600" role="alert">
                                    {errors.description}
                                </p>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">
                            {formData.description.length}/500 characters
                        </p>
                    </div>
                </div>
            </div>

            {/* Display Settings */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h3>

                {/* Color */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tag Color
                    </label>

                    {/* Preset Colors */}
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">Preset Colors</p>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => handleInputChange('color', color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color
                                            ? 'border-gray-900 scale-110'
                                            : 'border-gray-300 hover:border-gray-500'
                                        }`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                    aria-label={`Select color ${color}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Custom Color Input */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => handleInputChange('color', e.target.value)}
                                className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                                title="Custom color picker"
                            />
                            <Input
                                type="text"
                                value={formData.color}
                                onChange={(e) => handleInputChange('color', e.target.value)}
                                placeholder="#3B82F6"
                                className="w-24 font-mono text-sm"
                                pattern="^#[0-9A-Fa-f]{6}$"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-6 h-6 rounded border border-gray-300"
                                style={{ backgroundColor: formData.color }}
                                aria-label="Color preview"
                            />
                            <span className="text-sm text-gray-600">Preview</span>
                        </div>
                    </div>

                    {errors.color && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                            {errors.color}
                        </p>
                    )}
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="min-w-[120px]"
                >
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                        </div>
                    ) : (
                        <span>{isEditing ? 'Update Tag' : 'Create Tag'}</span>
                    )}
                </Button>
            </div>
        </form>
    );
} 