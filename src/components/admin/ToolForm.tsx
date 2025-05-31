'use client';

import { useState, useEffect } from 'react';
import { AdminToolFormData, AdminToolValidationErrors } from '@/types/admin/tool';
import { TagDTO } from '@/types/tools/tool';
import { Input, Button } from '@/components/ui';

interface ToolFormProps {
    initialData?: Partial<AdminToolFormData>;
    availableTags: TagDTO[];
    onSubmit: (data: AdminToolFormData) => Promise<void>;
    onCancel: () => void;
    isEditing?: boolean;
    isLoading?: boolean;
    errors?: AdminToolValidationErrors;
}

export function ToolForm({
    initialData,
    availableTags,
    onSubmit,
    onCancel,
    isEditing = false,
    isLoading = false,
    errors = {}
}: ToolFormProps) {
    const [formData, setFormData] = useState<AdminToolFormData>({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        description: initialData?.description || '',
        iconClass: initialData?.iconClass || '',
        displayOrder: initialData?.displayOrder || 0,
        isActive: initialData?.isActive ?? true,
        tagIds: initialData?.tagIds || []
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

    const handleInputChange = (field: keyof AdminToolFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTagToggle = (tagId: string) => {
        setFormData(prev => ({
            ...prev,
            tagIds: prev.tagIds.includes(tagId)
                ? prev.tagIds.filter(id => id !== tagId)
                : [...prev.tagIds, tagId]
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
                        <label htmlFor="tool-name" className="block text-sm font-medium text-gray-700 mb-2">
                            Tool Name *
                        </label>
                        <Input
                            id="tool-name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="e.g., Base64 Encoder/Decoder"
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
                            <label htmlFor="tool-slug" className="block text-sm font-medium text-gray-700">
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
                            id="tool-slug"
                            type="text"
                            value={formData.slug}
                            onChange={(e) => {
                                setAutoGenerateSlug(false);
                                handleInputChange('slug', e.target.value);
                            }}
                            placeholder="e.g., base64-encoder-decoder"
                            className="w-full font-mono"
                            error={errors.slug}
                            disabled={autoGenerateSlug}
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            URL: /tools/{formData.slug || 'tool-slug'}
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
                    <label htmlFor="tool-description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        id="tool-description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Brief description of what this tool does..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        maxLength={1000}
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
                            {formData.description.length}/1000 characters
                        </p>
                    </div>
                </div>
            </div>

            {/* Display Settings */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Icon Class */}
                    <div>
                        <label htmlFor="tool-icon" className="block text-sm font-medium text-gray-700 mb-2">
                            Icon Class
                        </label>
                        <Input
                            id="tool-icon"
                            type="text"
                            value={formData.iconClass}
                            onChange={(e) => handleInputChange('iconClass', e.target.value)}
                            placeholder="e.g., heroicon-mini-document-text"
                            className="w-full font-mono"
                            error={errors.iconClass}
                        />
                        {formData.iconClass && (
                            <div className="mt-2 flex items-center gap-2">
                                <span className={formData.iconClass} aria-hidden="true" />
                                <span className="text-sm text-gray-600">Preview</span>
                            </div>
                        )}
                        {errors.iconClass && (
                            <p className="mt-1 text-sm text-red-600" role="alert">
                                {errors.iconClass}
                            </p>
                        )}
                    </div>

                    {/* Display Order */}
                    <div>
                        <label htmlFor="tool-order" className="block text-sm font-medium text-gray-700 mb-2">
                            Display Order
                        </label>
                        <Input
                            id="tool-order"
                            type="number"
                            value={formData.displayOrder}
                            onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
                            min={0}
                            className="w-full"
                            error={errors.displayOrder}
                        />
                        {errors.displayOrder && (
                            <p className="mt-1 text-sm text-red-600" role="alert">
                                {errors.displayOrder}
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label htmlFor="tool-status" className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            id="tool-status"
                            value={formData.isActive ? 'active' : 'inactive'}
                            onChange={(e) => handleInputChange('isActive', e.target.value === 'active')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tags */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>

                {availableTags.length === 0 ? (
                    <p className="text-gray-500 italic">No tags available. Create tags first to assign them to tools.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => {
                            const isSelected = formData.tagIds.includes(tag.id);
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => handleTagToggle(tag.id)}
                                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isSelected
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                        }`}
                                    style={isSelected && tag.color ? {
                                        backgroundColor: tag.color,
                                        color: '#ffffff'
                                    } : {}}
                                    aria-pressed={isSelected}
                                    aria-label={`${isSelected ? 'Remove' : 'Add'} ${tag.name} tag`}
                                >
                                    {tag.name}
                                </button>
                            );
                        })}
                    </div>
                )}

                {formData.tagIds.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            {formData.tagIds.length} tag{formData.tagIds.length !== 1 ? 's' : ''} selected
                        </p>
                    </div>
                )}
            </div>

            {/* General Errors */}
            {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-600" role="alert">
                        {errors.general}
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
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
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    {isEditing ? 'Update Tool' : 'Create Tool'}
                </Button>
            </div>
        </form>
    );
} 