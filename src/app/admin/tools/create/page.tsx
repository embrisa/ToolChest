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
            <span className="text-primary font-medium">Create Tool</span>
          </nav>

          {/* Page Header */}
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center shadow-colored">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-primary">
                Create New Tool
              </h1>
              <p className="text-lg text-secondary max-w-2xl">
                Add a new tool to your tool-chest collection. Configure its
                settings, assign tags, and make it available to users. All tools
                are processed with privacy-first principles.
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
                Fill in the details below to create your new tool.
              </p>
            </div>
            <div className="p-8">
              <ToolForm
                availableTags={availableTags}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
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
