"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AdminToolFormData,
  AdminToolValidationErrors,
} from "@/types/admin/tool";
import { TagDTO } from "@/types/tools/tool";
import { ToolForm } from "@/components/admin";

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
      const response = await fetch("/api/tags");
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data.tags || []);
      }
    } catch (err) {
      console.error("Failed to load tags:", err);
    }
  };

  const handleSubmit = async (formData: AdminToolFormData) => {
    try {
      setLoading(true);
      setErrors({});

      const response = await fetch("/api/admin/tools", {
        method: "POST",
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
          setErrors({ general: data.message || "Failed to create tool" });
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
            Create Tool
          </span>
        </nav>

        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center shadow-colored">
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-display text-3xl font-bold text-gradient-brand mb-2">
              Create New Tool
            </h1>
            <p className="text-body text-neutral-600 dark:text-neutral-400">
              Add a new tool to your tool-chest collection with custom settings
              and tag assignments.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <ToolForm
          availableTags={availableTags}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={loading}
          errors={errors}
        />
      </div>
    </div>
  );
}
