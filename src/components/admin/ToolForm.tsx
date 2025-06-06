"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("components.forms");
  // const tCommon = useTranslations("common"); // TODO: Use for validation messages
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

  const handleInputChange = (
    field: keyof AdminToolFormData,
    value: AdminToolFormData[keyof AdminToolFormData],
  ) => {
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
    <div className="section-spacing-md">
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Enhanced Form Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto shadow-large">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d={
                  isEditing
                    ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                }
              />
            </svg>
          </div>
          <div>
            <h1 className="text-title text-3xl font-bold text-primary mb-2">
              {isEditing
                ? t("actions.edit") + " Tool"
                : t("actions.create") + " New Tool"}
            </h1>
            <p className="text-body text-secondary max-w-2xl mx-auto">
              {isEditing
                ? "Update the tool's information, settings, and tags to keep it current and discoverable."
                : "Add a new tool to your collection. Fill out the basic information, configure display settings, and assign relevant tags."}
            </p>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className="surface rounded-2xl p-8 space-y-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-medium flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-heading text-2xl font-semibold text-primary mb-2">
                Basic Information
              </h2>
              <p className="text-body text-secondary">
                Essential details that define your tool and help users
                understand its purpose.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tool Name */}
            <div className="space-y-3">
              <label
                htmlFor="tool-name"
                className="block text-sm font-semibold text-primary"
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span>{t("labels.name")} *</span>
                </div>
              </label>
              <Input
                id="tool-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder={t("placeholders.enterName")}
                className={`w-full focus-ring text-primary ${errors.name ? "input-error border-error-500" : ""}`}
                required
                aria-describedby="name-help"
              />
              <p id="name-help" className="text-small text-secondary">
                The display name that users will see in the tool list
              </p>
              {errors.name && (
                <p
                  className="text-small text-error-600 font-medium"
                  role="alert"
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* URL Slug */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="tool-slug"
                  className="block text-sm font-semibold text-primary"
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
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
                  className={`touch-target-min px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus-ring border-2 ${
                    autoGenerateSlug
                      ? "bg-brand-500 text-white border-brand-600 shadow-soft"
                      : "bg-neutral-50 text-tertiary border-neutral-200 hover:bg-neutral-25 hover:border-neutral-300 hover:text-primary"
                  }`}
                  aria-pressed={autoGenerateSlug}
                  aria-label={
                    autoGenerateSlug
                      ? "Switch to manual slug editing"
                      : "Switch to automatic slug generation"
                  }
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
                className={`w-full text-code focus-ring text-primary ${
                  autoGenerateSlug ? "bg-neutral-25 text-secondary" : ""
                } ${errors.slug ? "input-error border-error-500" : ""}`}
                disabled={autoGenerateSlug}
                required
                aria-describedby="slug-help"
              />
              <div className="flex items-center justify-between">
                <p id="slug-help" className="text-small text-secondary">
                  URL:{" "}
                  <span className="text-code text-brand-600 font-medium">
                    /tools/{formData.slug || "tool-slug"}
                  </span>
                </p>
              </div>
              {errors.slug && (
                <p
                  className="text-small text-error-600 font-medium"
                  role="alert"
                >
                  {errors.slug}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label
              htmlFor="tool-description"
              className="block text-sm font-semibold text-primary"
            >
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
              placeholder="Brief description of what this tool does and how it helps users. Focus on the value it provides and when someone might use it."
              className="input-field resize-none focus-ring text-primary min-h-[120px]"
              rows={5}
              maxLength={1000}
              aria-describedby="description-help"
            />
            <div className="flex justify-between items-center">
              <p id="description-help" className="text-small text-secondary">
                Help users understand what this tool does and when they might
                need it
              </p>
              <p className="text-small text-tertiary">
                {formData.description.length}/1000 characters
              </p>
            </div>
            {errors.description && (
              <p className="text-small text-error-600 font-medium" role="alert">
                {errors.description}
              </p>
            )}
          </div>
        </div>

        {/* Display Settings Section */}
        <div className="surface rounded-2xl p-8 space-y-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-medium flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-heading text-2xl font-semibold text-primary mb-2">
                Display Settings
              </h2>
              <p className="text-body text-secondary">
                Configure how your tool appears in the interface and where
                it&apos;s positioned in the list.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Icon Class */}
            <div className="space-y-3">
              <label
                htmlFor="tool-icon"
                className="block text-sm font-semibold text-primary"
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                className={`w-full text-code focus-ring text-primary ${errors.iconClass ? "input-error border-error-500" : ""}`}
                aria-describedby="icon-help"
              />
              <p id="icon-help" className="text-small text-secondary">
                CSS class for the tool&apos;s icon (optional)
              </p>
              {formData.iconClass && (
                <div className="mt-4 p-4 bg-neutral-25 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-soft">
                      <span
                        className={`${formData.iconClass} text-white w-5 h-5`}
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">
                        Icon Preview
                      </p>
                      <p className="text-small text-secondary">
                        How it will appear in tool cards
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {errors.iconClass && (
                <p
                  className="text-small text-error-600 font-medium"
                  role="alert"
                >
                  {errors.iconClass}
                </p>
              )}
            </div>

            {/* Display Order */}
            <div className="space-y-3">
              <label
                htmlFor="tool-order"
                className="block text-sm font-semibold text-primary"
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                  handleInputChange(
                    "displayOrder",
                    parseInt(e.target.value) || 0,
                  )
                }
                min={0}
                className={`w-full focus-ring text-primary ${errors.displayOrder ? "input-error border-error-500" : ""}`}
                aria-describedby="order-help"
              />
              <p id="order-help" className="text-small text-secondary">
                Lower numbers appear first (0 = top position)
              </p>
              {errors.displayOrder && (
                <p
                  className="text-small text-error-600 font-medium"
                  role="alert"
                >
                  {errors.displayOrder}
                </p>
              )}
            </div>

            {/* Publication Status */}
            <div className="space-y-3">
              <label
                htmlFor="tool-status"
                className="block text-sm font-semibold text-primary"
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Publication Status</span>
                </div>
              </label>
              <select
                id="tool-status"
                value={formData.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  handleInputChange("isActive", e.target.value === "active")
                }
                className="input-field focus-ring text-primary"
                aria-describedby="status-help"
              >
                <option value="active">Published - Visible to users</option>
                <option value="inactive">Draft - Hidden from users</option>
              </select>
              <p id="status-help" className="text-small text-secondary">
                Only published tools appear in the public tool list
              </p>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="surface rounded-2xl p-8 space-y-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-medium flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-heading text-2xl font-semibold text-primary mb-2">
                  Tags
                </h2>
                <p className="text-body text-secondary">
                  Assign relevant tags to help users discover your tool more
                  easily.
                </p>
              </div>
            </div>
            {formData.tagIds.length > 0 && (
              <div className="bg-success-50 text-success-700 px-4 py-2 rounded-full text-sm font-medium border border-success-200">
                {formData.tagIds.length} tag
                {formData.tagIds.length !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>

          {availableTags.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-neutral-200">
                <svg
                  className="w-10 h-10 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <h3 className="text-heading text-lg font-semibold text-primary mb-3">
                No Tags Available
              </h3>
              <p className="text-body text-secondary mb-6 max-w-md mx-auto">
                Create tags first to organize your tools into logical groups
                that help users find what they need.
              </p>
              <p className="text-small text-tertiary">
                Tags will appear here once you&apos;ve created them in the tag
                management section.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                {availableTags.map((tag) => {
                  const isSelected = formData.tagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`touch-target-comfortable inline-flex items-center px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 focus-ring border-2 ${
                        isSelected
                          ? "bg-brand-500 text-white shadow-colored border-brand-600 transform hover:scale-105"
                          : "bg-neutral-50 text-tertiary border-neutral-200 hover:bg-neutral-25 hover:border-neutral-300 hover:text-primary"
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
                      <span className="font-medium">{tag.name}</span>
                      {isSelected && (
                        <svg
                          className="ml-2 w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
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
                <div className="pt-6 border-t border-neutral-200">
                  <div className="bg-brand-25 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-brand-500 rounded-lg flex items-center justify-center mt-0.5">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-brand-700 mb-1">
                          Tags help with discoverability
                        </p>
                        <p className="text-small text-brand-600">
                          Selected tags will make this tool easier for users to
                          find when browsing or filtering.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Errors */}
        {errors.general && (
          <div className="surface rounded-2xl p-6 border-l-4 border-l-error-500 bg-error-25">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-error-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-error-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
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
                <h3 className="text-heading text-lg font-semibold text-error-700 mb-2">
                  Submission Error
                </h3>
                <p className="text-body text-error-600" role="alert">
                  {errors.general}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Form Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-neutral-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="order-2 sm:order-1 w-full sm:w-auto touch-target-comfortable focus-ring"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
            className="order-1 sm:order-2 w-full sm:w-auto touch-target-comfortable focus-ring shadow-large"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                {isEditing ? "Updating Tool..." : "Creating Tool..."}
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      isEditing
                        ? "M5 13l4 4L19 7"
                        : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                    }
                  />
                </svg>
                {isEditing ? "Update Tool" : "Create Tool"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
