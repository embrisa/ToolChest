"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  AdminToolFormData,
  AdminToolValidationErrors,
} from "@/types/admin/tool";
import { TagDTO, ToolDTO } from "@/types/tools/tool";
import { ToolForm } from "@/components/admin";

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
  };

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
      <div className="container-narrow">
        <div className="flex items-center justify-center py-16">
          <div className="text-center animate-fade-in-up">
            <div className="w-12 h-12 border-3 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400 text-body">
              Loading tool...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container-narrow">
        <div className="text-center py-16 animate-fade-in-up">
          <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-neutral-400 dark:text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-title text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Tool Not Found
          </h1>
          <p className="text-body text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
            The tool you're looking for doesn't exist or has been deleted. It
            may have been removed or the URL may be incorrect.
          </p>
          <button
            onClick={() => router.push("/admin/tools")}
            className="btn-primary focus-ring"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Tools
          </button>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="container-narrow">
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
              <h3 className="text-title text-lg font-semibold text-error-900 dark:text-error-100 mb-2">
                Error Loading Tool
              </h3>
              <p className="text-body text-error-700 dark:text-error-300 mb-4">
                Failed to load tool data. Please check your connection and try
                again.
              </p>
              <button onClick={loadData} className="btn-secondary focus-ring">
                Try Again
              </button>
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
    <div className="container-narrow animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <nav
          className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400 mb-4"
          aria-label="Breadcrumb"
        >
          <button
            onClick={() => router.push("/admin/tools")}
            className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus-ring rounded-md px-1"
          >
            Tools Management
          </button>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-neutral-900 dark:text-neutral-100">
            Edit Tool
          </span>
        </nav>

        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-colored">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
          <div>
            <h1 className="text-display text-3xl font-bold text-gradient-brand mb-2">
              Edit Tool
            </h1>
            <p className="text-body text-neutral-600 dark:text-neutral-400">
              Update the settings and configuration for{" "}
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                "{tool.name}"
              </span>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
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
  );
}
