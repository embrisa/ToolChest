"use client";

import { useState, useEffect } from "react";
import { AdminTagFormData, AdminTagValidationErrors } from "@/types/admin/tag";
import { Input, Button } from "@/components/ui";

interface TagFormProps {
  initialData?: Partial<AdminTagFormData>;
  onSubmit: (data: AdminTagFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
  errors?: AdminTagValidationErrors;
}

const PRESET_COLORS = [
  "#0ea5e9", // Brand blue
  "#22c55e", // Success green
  "#f59e0b", // Warning orange
  "#ef4444", // Error red
  "#d946ef", // Accent purple
  "#0284c7", // Brand secondary
  "#16a34a", // Success secondary
  "#dc2626", // Error secondary
  "#c026d3", // Accent secondary
  "#6b7280", // Neutral
];

export function TagForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  isLoading = false,
  errors = {},
}: TagFormProps) {
  const [formData, setFormData] = useState<AdminTagFormData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    color: initialData?.color || "#0ea5e9",
  });

  const [autoGenerateSlug, setAutoGenerateSlug] = useState(!isEditing);

  // Auto-generate slug from name
  useEffect(() => {
    if (autoGenerateSlug && formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      setFormData((prev) => ({
        ...prev,
        slug: generatedSlug,
      }));
    }
  }, [formData.name, autoGenerateSlug]);

  const handleInputChange = (field: keyof AdminTagFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="card p-8">
        <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="form-group">
            <label htmlFor="tag-name" className="form-label">
              Tag Name *
            </label>
            <Input
              id="tag-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Web Development"
              className="w-full"
              error={errors.name}
              required
            />
            {errors.name && (
              <p className="form-error" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Slug */}
          <div className="form-group">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="tag-slug" className="form-label">
                URL Slug *
              </label>
              <button
                type="button"
                onClick={() => setAutoGenerateSlug(!autoGenerateSlug)}
                className="btn-ghost text-xs px-3 py-1"
              >
                {autoGenerateSlug ? "Manual" : "Auto-generate"}
              </button>
            </div>
            <Input
              id="tag-slug"
              type="text"
              value={formData.slug}
              onChange={(e) => {
                setAutoGenerateSlug(false);
                handleInputChange("slug", e.target.value);
              }}
              placeholder="e.g., web-development"
              className="w-full text-code"
              error={errors.slug}
              disabled={autoGenerateSlug}
              required
            />
            <p className="form-help">
              URL: /tags/{formData.slug || "tag-slug"}
            </p>
            {errors.slug && (
              <p className="form-error" role="alert">
                {errors.slug}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="form-group mt-6">
          <label htmlFor="tag-description" className="form-label">
            Description
          </label>
          <textarea
            id="tag-description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Brief description of this tag..."
            className="input-field resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-between mt-2">
            <div>
              {errors.description && (
                <p className="form-error" role="alert">
                  {errors.description}
                </p>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {formData.description.length}/500 characters
            </p>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="card p-8">
        <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
          Display Settings
        </h3>

        {/* Color */}
        <div className="form-group">
          <label className="form-label">Tag Color</label>

          {/* Preset Colors */}
          <div className="mb-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              Preset Colors
            </p>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange("color", color)}
                  className={`w-10 h-10 rounded-xl border-2 transition-all duration-200 hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 ${
                    formData.color === color
                      ? "border-neutral-900 dark:border-neutral-100 scale-110 shadow-large"
                      : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-500 dark:hover:border-neutral-400 shadow-soft hover:shadow-medium"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Custom Color Input */}
          <div className="space-y-3">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Custom Color
            </p>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
                className="w-12 h-12 rounded-xl border-2 border-neutral-300 dark:border-neutral-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2"
                title="Select custom color"
              />
              <Input
                type="text"
                value={formData.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
                placeholder="#0ea5e9"
                className="text-code flex-1 max-w-32"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          {/* Color Preview */}
          <div className="mt-4 p-4 surface rounded-xl">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              Preview
            </p>
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium text-white shadow-soft"
                style={{ backgroundColor: formData.color }}
              >
                {formData.name || "Tag Name"}
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                How this tag will appear on tools
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || !formData.name.trim() || !formData.slug.trim()}
          className="min-w-32"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </div>
          ) : isEditing ? (
            "Update Tag"
          ) : (
            "Create Tag"
          )}
        </Button>
      </div>
    </form>
  );
}
