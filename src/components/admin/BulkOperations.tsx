"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { MultiSelect } from "@/components/ui/MultiSelect";
import {
  BulkTagOperation,
  BulkOperationPreview,
  BulkOperationResult,
  MultiSelectOption,
} from "@/types/admin/relationship";
import { AdminToolListItem } from "@/types/admin/tool";
import { TagDTO } from "@/types/tools/tool";

interface BulkOperationsProps {
  selectedTools: AdminToolListItem[];
  availableTags: TagDTO[];
  onOperationComplete: () => void;
  onClose: () => void;
}

type OperationStep = "select" | "preview" | "confirm" | "executing" | "results";

export function BulkOperations({
  selectedTools,
  availableTags,
  onOperationComplete,
  onClose,
}: BulkOperationsProps) {
  const tAdmin = useTranslations("pages.admin");
  const tForms = useTranslations("components.forms");
  const tCommon = useTranslations("common");
  const [step, setStep] = useState<OperationStep>("select");
  const [operationType, setOperationType] = useState<"assign" | "remove">(
    "assign",
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [preview, setPreview] = useState<BulkOperationPreview | null>(null);
  const [result, setResult] = useState<BulkOperationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert data to MultiSelect options
  const tagOptions: MultiSelectOption[] = availableTags.map((tag) => ({
    id: tag.id,
    label: tag.name,
    description: tag.description || undefined,
    color: tag.color || undefined,
    isActive: true,
  }));

  const toolCount = selectedTools.length;
  const selectedTagCount = selectedTagIds.length;

  useEffect(() => {
    setError(null);
  }, [step, operationType, selectedTagIds]);

  const handlePreviewOperation = async () => {
    if (selectedTagIds.length === 0) {
      setError("Please select at least one tag");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const operation: BulkTagOperation = {
        type: operationType,
        toolIds: selectedTools.map((t) => t.id),
        tagIds: selectedTagIds,
        requiresConfirmation: false,
        estimatedChanges: toolCount * selectedTagCount,
      };

      const response = await fetch("/api/admin/relationships/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation }),
      });

      if (!response.ok) {
        throw new Error("Failed to preview operation");
      }

      const previewData: BulkOperationPreview = await response.json();
      setPreview(previewData);
      setStep("preview");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to preview operation",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteOperation = async () => {
    if (!preview) return;

    setIsLoading(true);
    setError(null);
    setStep("executing");

    try {
      const operation: BulkTagOperation = {
        type: operationType,
        toolIds: selectedTools.map((t) => t.id),
        tagIds: selectedTagIds,
        requiresConfirmation: preview.requiresConfirmation,
        estimatedChanges: preview.summary.totalTagChanges,
      };

      const response = await fetch("/api/admin/relationships/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation }),
      });

      if (!response.ok) {
        throw new Error("Failed to execute operation");
      }

      const resultData: BulkOperationResult = await response.json();
      setResult(resultData);
      setStep("results");

      if (resultData.success) {
        onOperationComplete();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to execute operation",
      );
      setStep("preview");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    switch (step) {
      case "preview":
        setStep("select");
        setPreview(null);
        break;
      case "confirm":
        setStep("preview");
        break;
      default:
        break;
    }
  };

  const handleReset = () => {
    setStep("select");
    setSelectedTagIds([]);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="surface-elevated max-w-4xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${operationType === "assign"
                ? "bg-brand-100 dark:bg-brand-900/20"
                : "bg-error-100 dark:bg-error-900/20"
                }`}
            >
              {operationType === "assign" ? (
                <svg
                  className="w-6 h-6 text-brand-600 dark:text-brand-400"
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
              ) : (
                <svg
                  className="w-6 h-6 text-error-600 dark:text-error-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-title text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                {tAdmin("tools.bulkOperations.title", { operation: operationType === "assign" ? tCommon("actions.assign") : tCommon("actions.remove") })}
              </h2>
              <p className="text-body text-neutral-600 dark:text-neutral-400 mt-1">
                {tAdmin("tools.bulkOperations.selectedCount", { count: toolCount })}
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            aria-label="Close bulk operations"
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <svg
              className="w-6 h-6"
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
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 max-h-[calc(90vh-140px)] overflow-y-auto scrollbar-thin">
        {/* Step 1: Select Operation and Tags */}
        {step === "select" && (
          <div className="space-y-8">
            {/* Operation Type Selection */}
            <div className="space-y-4">
              <h3 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {tAdmin("tools.bulkOperations.operationType")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setOperationType("assign")}
                  className={`card-interactive p-6 text-left ${operationType === "assign"
                    ? "ring-2 ring-brand-500 border-brand-200 dark:border-brand-700 bg-brand-50 dark:bg-brand-900/10"
                    : ""
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/20 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-brand-600 dark:text-brand-400"
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
                    <div>
                      <h4 className="text-title font-semibold text-neutral-900 dark:text-neutral-100">
                        Assign Tags
                      </h4>
                      <p className="text-body text-sm text-neutral-600 dark:text-neutral-400">
                        Add selected tags to tools
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setOperationType("remove")}
                  className={`card-interactive p-6 text-left ${operationType === "remove"
                    ? "ring-2 ring-error-500 border-error-200 dark:border-error-700 bg-error-50 dark:bg-error-900/10"
                    : ""
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-error-100 dark:bg-error-900/20 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-error-600 dark:text-error-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-title font-semibold text-neutral-900 dark:text-neutral-100">
                        Remove Tags
                      </h4>
                      <p className="text-body text-sm text-neutral-600 dark:text-neutral-400">
                        Remove selected tags from tools
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Tag Selection */}
            <div className="space-y-4">
              <h3 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {tAdmin("tools.bulkOperations.selectTags")}
              </h3>
              <div className="space-y-2">
                <MultiSelect
                  options={tagOptions}
                  selectedIds={selectedTagIds}
                  onSelectionChange={setSelectedTagIds}
                  placeholder="Search and select tags..."
                />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {selectedTagCount} tag{selectedTagCount !== 1 ? "s" : ""}{" "}
                  selected
                </p>
              </div>
            </div>

            {/* Selected Tools Summary */}
            <div className="card bg-neutral-50 dark:bg-neutral-900/50 p-6">
              <h4 className="text-title font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Selected Tools ({toolCount})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto scrollbar-thin">
                {selectedTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0" />
                    <span className="text-neutral-900 dark:text-neutral-100 truncate">
                      {tool.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="card bg-error-50 dark:bg-error-900/10 border-error-200 dark:border-error-800/30 p-4">
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-5 h-5 text-error-600 dark:text-error-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-error-800 dark:text-error-200 text-sm font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button onClick={onClose} variant="ghost" size="lg">
                Cancel
              </Button>
              <Button
                onClick={handlePreviewOperation}
                variant="primary"
                size="lg"
                disabled={selectedTagIds.length === 0 || isLoading}
              >
                {isLoading ? "Loading..." : "Preview Changes"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Preview Changes */}
        {step === "preview" && preview && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Preview Changes
              </h3>
              <p className="text-body text-neutral-600 dark:text-neutral-400">
                Review the changes before executing the operation
              </p>
            </div>

            {/* Operation Summary */}
            <div className="card p-6">
              <h4 className="text-title font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Operation Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Operation Type
                  </p>
                  <p
                    className={`text-lg font-semibold capitalize ${operationType === "assign"
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-error-600 dark:text-error-400"
                      }`}
                  >
                    {operationType} Tags
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Total Changes
                  </p>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {preview.summary.totalTagChanges}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Tools to Update
                  </p>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {preview.summary.totalTools}
                  </p>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {preview.warnings.length > 0 && (
              <div className="card bg-warning-50 dark:bg-warning-900/10 border-warning-200 dark:border-warning-800/30 p-6">
                <h4 className="text-title font-semibold text-warning-900 dark:text-warning-100 mb-4 flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span>Warnings</span>
                </h4>
                <ul className="space-y-2">
                  {preview.warnings.map((warning, index) => (
                    <li
                      key={index}
                      className="text-warning-800 dark:text-warning-200 text-sm"
                    >
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Changes */}
            <div className="card p-6">
              <h4 className="text-title font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Tools to Update
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin">
                {preview.toolsToUpdate.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg"
                  >
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {tool.name}
                    </span>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {tool.addedTags.length + tool.removedTags.length} change
                      {tool.addedTags.length + tool.removedTags.length !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button onClick={handleBack} variant="ghost" size="lg">
                Back
              </Button>
              <Button
                onClick={handleExecuteOperation}
                variant="primary"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Executing..." : "Execute Operation"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Executing */}
        {step === "executing" && (
          <div className="text-center py-12 space-y-6">
            <div className="w-16 h-16 mx-auto bg-brand-100 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-brand-600 dark:text-brand-400 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  className="opacity-75"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Executing Operation
              </h3>
              <p className="text-body text-neutral-600 dark:text-neutral-400">
                Please wait while we process your bulk operation...
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === "results" && result && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div
                className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${result.success
                  ? "bg-success-100 dark:bg-success-900/20"
                  : "bg-error-100 dark:bg-error-900/20"
                  }`}
              >
                {result.success ? (
                  <svg
                    className="w-8 h-8 text-success-600 dark:text-success-400"
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
                ) : (
                  <svg
                    className="w-8 h-8 text-error-600 dark:text-error-400"
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
                )}
              </div>
              <div className="space-y-2">
                <h3
                  className={`text-title text-xl font-semibold ${result.success
                    ? "text-success-900 dark:text-success-100"
                    : "text-error-900 dark:text-error-100"
                    }`}
                >
                  {result.success ? "Operation Completed" : "Operation Failed"}
                </h3>
                <p className="text-body text-neutral-600 dark:text-neutral-400">
                  {result.success
                    ? "Your bulk operation has been completed successfully"
                    : "There was an error executing your bulk operation"}
                </p>
              </div>
            </div>

            {/* Results Summary */}
            <div className="card p-6">
              <h4 className="text-title font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Operation Results
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Tools Affected
                  </p>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {result.toolsAffected}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Total Changes
                  </p>
                  <p className="text-lg font-semibold text-success-600 dark:text-success-400">
                    {result.totalChanges}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Tags Affected
                  </p>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {result.tagsAffected}
                  </p>
                </div>
              </div>
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="card bg-error-50 dark:bg-error-900/10 border-error-200 dark:border-error-800/30 p-6">
                <h4 className="text-title font-semibold text-error-900 dark:text-error-100 mb-4">
                  Errors Encountered
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                  {result.errors.map((error, index) => (
                    <div
                      key={index}
                      className="text-error-800 dark:text-error-200 text-sm p-2 bg-error-100 dark:bg-error-900/20 rounded"
                    >
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button onClick={handleReset} variant="ghost" size="lg">
                Start New Operation
              </Button>
              <Button onClick={onClose} variant="primary" size="lg">
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
