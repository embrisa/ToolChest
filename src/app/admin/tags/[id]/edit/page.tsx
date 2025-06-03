"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminTagFormData, AdminTagValidationErrors } from "@/types/admin/tag";
import { TagDTO } from "@/types/tools/tool";
import { TagForm } from "@/components/admin";
import { Button, Loading } from "@/components/ui";

interface EditTagPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditTagPage({ params }: EditTagPageProps) {
  const router = useRouter();
  const [tag, setTag] = useState<TagDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<AdminTagValidationErrors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tagId, setTagId] = useState<string | null>(null);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setTagId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  const loadTag = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);

      const response = await fetch(`/api/admin/tags/${tagId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setLoadError("Tag not found");
        } else {
          setLoadError("Failed to load tag");
        }
        return;
      }

      const data = await response.json();
      setTag(data.tag);
    } catch {
      setLoadError("An error occurred while loading the tag");
    } finally {
      setLoading(false);
    }
  }, [tagId]);

  useEffect(() => {
    if (tagId) {
      loadTag();
    }
  }, [tagId, loadTag]);

  const handleSubmit = async (data: AdminTagFormData) => {
    try {
      setIsSubmitting(true);
      setErrors({});

      const response = await fetch(`/api/admin/tags/${tagId}`, {
        method: "PUT",
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
          setErrors({ general: result.message || "Failed to update tag" });
        }
        return;
      }

      // Success - redirect to tags list
      router.push("/admin/tags");
    } catch {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/tags");
  };

  if (loading) {
    return (
      <div className="container-narrow">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loading size="lg" className="mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400 text-body">
              Loading tag...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="container-narrow">
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
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-semibold text-error-800 dark:text-error-200">
                Error loading tag
              </h3>
              <div className="mt-2 text-sm text-error-700 dark:text-error-300">
                <p>{loadError}</p>
              </div>
              <div className="mt-4">
                <Button onClick={loadTag} variant="secondary" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="container-narrow">
        <div className="text-center py-16">
          <div className="text-neutral-400 dark:text-neutral-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 6h.008v.008H6V6z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Tag not found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            The tag you&apos;re looking for doesn&apos;t exist or may have been deleted.
          </p>
          <Button onClick={() => router.push("/admin/tags")} variant="primary">
            Back to Tags
          </Button>
        </div>
      </div>
    );
  }

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
              Edit Tag
            </h1>
          </div>
          <p className="text-body text-neutral-600 dark:text-neutral-400 max-w-2xl">
            Update the details for{" "}
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              &quot;{tag.name}&quot;
            </span>
            . Changes will affect all tools using this tag.
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
                Error updating tag
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
          initialData={{
            name: tag.name,
            slug: tag.slug,
            description: tag.description || "",
            color: tag.color || "#0ea5e9",
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing={true}
          isLoading={isSubmitting}
          errors={errors}
        />
      </div>
    </div>
  );
}
