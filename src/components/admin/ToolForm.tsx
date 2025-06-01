"use client";

import { useState, useEffect } from "react";
import {
  AdminToolFormData,
  AdminToolValidationErrors,
} from "@/types/admin/tool";
import { TagDTO } from "@/types/tools/tool";
import { Input, Button } from "@/components/ui";

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
  errors = {},
}: ToolFormProps) {
  const [formData, setFormData] = useState<AdminToolFormData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    iconClass: initialData?.iconClass || "",
    displayOrder: initialData?.displayOrder || 0,
    isActive: initialData?.isActive ?? true,
    tagIds: initialData?.tagIds || [],
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

  const handleInputChange = (field: keyof AdminToolFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="card rounded-2xl p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Basic Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="form-group">
            <label htmlFor="tool-name" className="form-label">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span>Tool Name *</span>
              </div>
            </label>
            <Input
              id="tool-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Base64 Encoder/Decoder"
              className={`w-full focus-ring ${errors.name ? "input-error" : ""}`}
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
              <label htmlFor="tool-slug" className="form-label">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span>URL Slug *</span>
                </div>
              </label>
              <button
                type="button"
                onClick={() => setAutoGenerateSlug(!autoGenerateSlug)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 focus-ring ${
                  autoGenerateSlug
                    ? "bg-brand-100 text-brand-700 border border-brand-200 dark:bg-brand-900/20 dark:text-brand-300 dark:border-brand-800"
                    : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700 dark:hover:bg-neutral-700"
                }`}
              >
                {autoGenerateSlug ? "🤖 Auto" : "✏️ Manual"}
              </button>
            </div>
            <Input
              id="tool-slug"
              type="text"
              value={formData.slug}
              onChange={(e) => {
                setAutoGenerateSlug(false);
                handleInputChange("slug", e.target.value);
              }}
              placeholder="e.g., base64-encoder-decoder"
              className={`w-full text-code focus-ring ${errors.slug ? "input-error" : ""}`}
              disabled={autoGenerateSlug}
              required
            />
            <div className="flex items-center justify-between mt-2">
              <p className="form-help">
                URL:{" "}
                <span className="text-code text-brand-600 dark:text-brand-400">
                  /tools/{formData.slug || "tool-slug"}
                </span>
              </p>
            </div>
            {errors.slug && (
              <p className="form-error" role="alert">
                {errors.slug}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="tool-description" className="form-label">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
              <span>Description</span>
            </div>
          </label>
          <textarea
            id="tool-description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Brief description of what this tool does and how it helps users..."
            className="input-field resize-none focus-ring"
            rows={4}
            maxLength={1000}
          />
          <div className="flex justify-between mt-2">
            <div>
              {errors.description && (
                <p className="form-error" role="alert">
                  {errors.description}
                </p>
              )}
            </div>
            <p className="form-help">
              {formData.description.length}/1000 characters
            </p>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="card rounded-2xl p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4"
              />
            </svg>
          </div>
          <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Display Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Icon Class */}
          <div className="form-group">
            <label htmlFor="tool-icon" className="form-label">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m5-9a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Icon Class</span>
              </div>
            </label>
            <Input
              id="tool-icon"
              type="text"
              value={formData.iconClass}
              onChange={(e) => handleInputChange("iconClass", e.target.value)}
              placeholder="e.g., heroicon-mini-document-text"
              className={`w-full text-code focus-ring ${errors.iconClass ? "input-error" : ""}`}
            />
            {formData.iconClass && (
              <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                    <span
                      className={`${formData.iconClass} text-white w-4 h-4`}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Icon Preview
                  </span>
                </div>
              </div>
            )}
            {errors.iconClass && (
              <p className="form-error" role="alert">
                {errors.iconClass}
              </p>
            )}
          </div>

          {/* Display Order */}
          <div className="form-group">
            <label htmlFor="tool-order" className="form-label">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                <span>Display Order</span>
              </div>
            </label>
            <Input
              id="tool-order"
              type="number"
              value={formData.displayOrder}
              onChange={(e) =>
                handleInputChange("displayOrder", parseInt(e.target.value) || 0)
              }
              min={0}
              className={`w-full focus-ring ${errors.displayOrder ? "input-error" : ""}`}
            />
            <p className="form-help">
              Lower numbers appear first in the tools list
            </p>
            {errors.displayOrder && (
              <p className="form-error" role="alert">
                {errors.displayOrder}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="form-group">
            <label htmlFor="tool-status" className="form-label">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Status</span>
              </div>
            </label>
            <select
              id="tool-status"
              value={formData.isActive ? "active" : "inactive"}
              onChange={(e) =>
                handleInputChange("isActive", e.target.value === "active")
              }
              className="select focus-ring"
            >
              <option value="active">Active - Visible to users</option>
              <option value="inactive">Inactive - Hidden from users</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="card rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Tags & Categories
            </h3>
          </div>
          {formData.tagIds.length > 0 && (
            <div className="bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300 px-3 py-1 rounded-full text-sm font-medium">
              {formData.tagIds.length} selected
            </div>
          )}
        </div>

        {availableTags.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-neutral-400 dark:text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 text-body mb-4">
              No tags available yet
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              Create tags first to organize your tools into categories.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {availableTags.map((tag) => {
                const isSelected = formData.tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 focus-ring ${
                      isSelected
                        ? "bg-brand-500 text-white shadow-colored hover:bg-brand-600 transform hover:scale-105"
                        : "bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200 hover:border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700"
                    }`}
                    style={
                      isSelected && tag.color
                        ? {
                            backgroundColor: tag.color,
                            borderColor: tag.color,
                            color: "#ffffff",
                          }
                        : {}
                    }
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? "Remove" : "Add"} ${tag.name} tag`}
                  >
                    {tag.name}
                    {isSelected && (
                      <svg
                        className="ml-2 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {formData.tagIds.length > 0 && (
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Selected tags will help users discover this tool more easily.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* General Errors */}
      {errors.general && (
        <div className="surface-elevated rounded-2xl p-6 border-l-4 border-l-error-500 animate-fade-in-up">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-error-100 dark:bg-error-900/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-error-600 dark:text-error-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-title text-lg font-semibold text-error-900 dark:text-error-100 mb-1">
                Submission Error
              </h4>
              <p
                className="text-body text-error-700 dark:text-error-300"
                role="alert"
              >
                {errors.general}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="focus-ring"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
          className="focus-ring animate-glow"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isEditing ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                  }
                />
              </svg>
              {isEditing ? "Update Tool" : "Create Tool"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
