"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  AdminToolFormData,
  AdminToolValidationErrors,
} from "@/types/admin/tool";
import { TagDTO, ToolDTO } from "@/types/tools/tool";
import { ToolForm } from "@/components/admin";
import { Button } from "@/components/ui";

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

  const loadData = useCallback(async () => {
    try {
      setInitialLoading(true);
      setNotFound(false);

      const [toolResponse, tagsResponse] = await Promise.all([
        fetch(`/api/admin/tools/${toolId}`),
        fetch("/api/tags"),
      ]);

      if (toolResponse.status === 404) {
        setNotFound(true);
        return;
      }

      if (!toolResponse.ok) {
        throw new Error("Failed to load tool");
      }

      if (!tagsResponse.ok) {
        throw new Error("Failed to load tags");
      }

      const toolData = await toolResponse.json();
      const tagsData = await tagsResponse.json();

      setTool(toolData.tool);
      setAvailableTags(tagsData.tags || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setErrors({ general: "Failed to load tool data" });
    } finally {
      setInitialLoading(false);
    }
  }, [toolId]);

  // Load tool data and available tags
  useEffect(() => {
    if (toolId) {
      loadData();
    }
  }, [toolId, loadData]);

  const handleSubmit = async (formData: AdminToolFormData) => {
    try {
      setLoading(true);
      setErrors({});

      const response = await fetch(`/api/admin/tools/${toolId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || "Failed to update tool" });
        }
        return;
      }

      // Success - redirect to tools list
      router.push("/admin/tools");
    } catch (err) {
      setErrors({
        general:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/tools");
  };

  if (initialLoading) {
    return (
      <div className="container-narrow section-spacing-md">
        <div className="flex items-center justify-center py-20">
          <div className="text-center animate-fade-in-up">
            <div className="w-12 h-12 border-3 border-neutral-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-secondary text-lg">Loading tool...</p>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container-narrow section-spacing-md">
        <div className="text-center py-20 animate-fade-in-up">
          <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg
              className="w-12 h-12 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-4">
            Tool Not Found
          </h1>
          <p className="text-lg text-secondary mb-8 max-w-lg mx-auto">
            The tool you&apos;re looking for doesn&apos;t exist or has been
            deleted. It may have been removed or the URL may be incorrect.
          </p>
          <Button
            onClick={() => router.push("/admin/tools")}
            variant="primary"
            size="lg"
            className="focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Tools
          </Button>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="container-narrow section-spacing-md">
        <div className="card rounded-2xl p-8 border-l-4 border-l-error-500 animate-fade-in-up">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-error-50 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-error-600"
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
              <h3 className="text-xl font-semibold text-error-900 mb-3">
                Error Loading Tool
              </h3>
              <p className="text-base text-error-700 mb-6">
                Failed to load tool data. Please check your connection and try
                again.
              </p>
              <Button
                onClick={loadData}
                variant="secondary"
                size="md"
                className="focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare initial form data
  const initialData: Partial<AdminToolFormData> = {
    name: tool.name,
    slug: tool.slug,
    description: tool.description || "",
    iconClass: tool.iconClass || "",
    displayOrder: tool.displayOrder,
    isActive: tool.isActive,
    tagIds: tool.tags?.map((tag) => tag.id) || [],
  };

  return (
    <div className="container-narrow section-spacing-md">
      <div className="space-y-12 animate-fade-in-up">
        {/* Header Section */}
        <div className="space-y-6">
          {/* Breadcrumb Navigation */}
          <nav
            className="flex items-center space-x-3 text-sm"
            aria-label="Breadcrumb"
          >
            <button
              onClick={() => router.push("/admin/tools")}
              className="text-secondary hover:text-brand-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-md px-2 py-1"
            >
              Tools Management
            </button>
            <svg
              className="w-4 h-4 text-neutral-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-primary font-medium">Edit Tool</span>
          </nav>

          {/* Page Header */}
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-colored">
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
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-primary">Edit Tool</h1>
              <p className="text-lg text-secondary max-w-2xl">
                Update the settings and configuration for{" "}
                <span className="font-semibold text-primary">
                  &quot;{tool.name}&quot;
                </span>
                . Modify properties, reassign tags, and adjust availability.
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="card rounded-2xl shadow-medium">
            <div className="px-8 py-6 border-b border-neutral-150 bg-neutral-50">
              <h2 className="text-xl font-semibold text-primary">
                Tool Configuration
              </h2>
              <p className="text-secondary mt-2">
                Update the details below to modify your tool settings.
              </p>
            </div>
            <div className="p-8">
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
          </div>
        </div>
      </div>
    </div>
  );
}
