"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminTagFormData, AdminTagValidationErrors } from "@/types/admin/tag";
import { TagForm } from "@/components/admin";

export default function CreateTagPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<AdminTagValidationErrors>({});

  const handleSubmit = async (data: AdminTagFormData) => {
    try {
      setIsLoading(true);
      setErrors({});

      const response = await fetch("/api/admin/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({ general: result.message || "Failed to create tag" });
        }
        return;
      }

      // Success - redirect to tags list
      router.push("/admin/tags");
    } catch (error) {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/tags");
  };

  return (
    <div className="container-narrow space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Link
              href="/admin/tags"
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50 rounded-lg p-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-display text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Create New Tag
            </h1>
          </div>
          <p className="text-body text-neutral-600 dark:text-neutral-400 max-w-2xl">
            Add a new tag to organize and categorize your tools. Tags help users
            discover and filter tools more effectively.
          </p>
        </div>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="surface rounded-2xl p-6 border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-950/30">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-error-600 dark:text-error-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-semibold text-error-800 dark:text-error-200 mb-1">
                Error creating tag
              </h3>
              <p className="text-sm text-error-700 dark:text-error-300">
                {errors.general}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="surface rounded-2xl p-8">
        <TagForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          errors={errors}
        />
      </div>
    </div>
  );
}
