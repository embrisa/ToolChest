"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  WrenchScrewdriverIcon,
  TagIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Button, Loading } from "@/components/ui";
import {
  RelationshipValidationResult,
  OrphanedEntityCheck,
  BulkOperationResult,
} from "@/types/admin/relationship";
import { classNames } from "@/utils";

interface ValidationData {
  validation: RelationshipValidationResult;
  orphans: OrphanedEntityCheck;
}

export default function RelationshipValidationPage() {
  const [validationData, setValidationData] = useState<ValidationData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoResolving, setAutoResolving] = useState(false);
  const [autoResolveResult, setAutoResolveResult] =
    useState<BulkOperationResult | null>(null);

  useEffect(() => {
    runValidation();
  }, []);

  const runValidation = async () => {
    try {
      setLoading(true);
      setError(null);
      setAutoResolveResult(null);

      // Run validation and orphan checks in parallel
      const [validationResponse, orphansResponse] = await Promise.all([
        fetch("/api/admin/relationships/validation"),
        fetch("/api/admin/relationships/orphans"),
      ]);

      if (!validationResponse.ok || !orphansResponse.ok) {
        throw new Error("Failed to run validation checks");
      }

      const [validationResult, orphanResult] = await Promise.all([
        validationResponse.json(),
        orphansResponse.json(),
      ]);

      setValidationData({
        validation: validationResult,
        orphans: orphanResult,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run validation");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoResolve = async () => {
    try {
      setAutoResolving(true);
      setError(null);

      const response = await fetch("/api/admin/relationships/auto-resolve", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to auto-resolve orphans");
      }

      const result: BulkOperationResult = await response.json();
      setAutoResolveResult(result);

      // Re-run validation after auto-resolve
      if (result.success) {
        setTimeout(() => {
          runValidation();
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to auto-resolve");
    } finally {
      setAutoResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/relationships">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Relationships
            </Button>
          </Link>
          <h1 className="text-display text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Relationship Validation
          </h1>
        </div>

        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loading size="lg" />
            <p className="mt-6 text-body text-neutral-600 dark:text-neutral-400">
              Running validation checks...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/relationships">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Relationships
            </Button>
          </Link>
          <h1 className="text-display text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Relationship Validation
          </h1>
        </div>

        <div className="card p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-error-100 dark:bg-error-950/30 rounded-xl flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-error-600 dark:text-error-400" />
            </div>
            <div>
              <h3 className="text-title text-lg font-semibold text-error-800 dark:text-error-200">
                Validation Error
              </h3>
              <p className="text-error-600 dark:text-error-400">{error}</p>
            </div>
          </div>
          <Button onClick={runValidation} variant="secondary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!validationData) {
    return null;
  }

  const { validation, orphans } = validationData;
  const hasIssues =
    !validation.isValid ||
    validation.warnings.length > 0 ||
    orphans.orphanedTools.length > 0 ||
    orphans.orphanedTags.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/relationships">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Relationships
            </Button>
          </Link>
          <div>
            <h1 className="text-display text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Relationship Validation
            </h1>
            <p className="text-body text-neutral-600 dark:text-neutral-400">
              Check data integrity and resolve orphaned entities
            </p>
          </div>
        </div>
        <Button onClick={runValidation} variant="secondary">
          Re-run Validation
        </Button>
      </div>

      {/* Overall Status */}
      <div
        className={classNames(
          "card p-8",
          hasIssues
            ? "border-warning-200 dark:border-warning-800 bg-warning-50/50 dark:bg-warning-950/20"
            : "border-success-200 dark:border-success-800 bg-success-50/50 dark:bg-success-950/20",
        )}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className={classNames(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              hasIssues
                ? "bg-warning-100 dark:bg-warning-950/30"
                : "bg-success-100 dark:bg-success-950/30",
            )}
          >
            {hasIssues ? (
              <ExclamationTriangleIcon className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            ) : (
              <CheckCircleIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
            )}
          </div>
          <div>
            <h2
              className={classNames(
                "text-title text-xl font-semibold",
                hasIssues
                  ? "text-warning-800 dark:text-warning-200"
                  : "text-success-800 dark:text-success-200",
              )}
            >
              {hasIssues ? "Issues Found" : "All Checks Passed"}
            </h2>
            <p
              className={classNames(
                "text-body",
                hasIssues
                  ? "text-warning-700 dark:text-warning-300"
                  : "text-success-700 dark:text-success-300",
              )}
            >
              {hasIssues
                ? "Your tool-tag relationships have some issues that may need attention"
                : "Your tool-tag relationships are properly configured"}
            </p>
          </div>
        </div>

        {hasIssues && orphans.canAutoResolve && (
          <div className="pt-4 border-t border-warning-200 dark:border-warning-800">
            <Button
              onClick={handleAutoResolve}
              disabled={autoResolving}
              variant="primary"
              className="bg-brand-600 hover:bg-brand-700"
            >
              {autoResolving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Auto-Resolving...
                </div>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Auto-Resolve Issues
                </>
              )}
            </Button>
            <p className="text-sm text-warning-600 dark:text-warning-400 mt-3">
              Automatically assign popular tags to untagged tools
            </p>
          </div>
        )}
      </div>

      {/* Auto-Resolve Result */}
      {autoResolveResult && (
        <div
          className={classNames(
            "card p-6",
            autoResolveResult.success
              ? "border-success-200 dark:border-success-800 bg-success-50/50 dark:bg-success-950/20"
              : "border-error-200 dark:border-error-800 bg-error-50/50 dark:bg-error-950/20",
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={classNames(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                autoResolveResult.success
                  ? "bg-success-100 dark:bg-success-950/30"
                  : "bg-error-100 dark:bg-error-950/30",
              )}
            >
              {autoResolveResult.success ? (
                <CheckCircleIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
              ) : (
                <XCircleIcon className="w-5 h-5 text-error-600 dark:text-error-400" />
              )}
            </div>
            <h3
              className={classNames(
                "text-title font-semibold",
                autoResolveResult.success
                  ? "text-success-800 dark:text-success-200"
                  : "text-error-800 dark:text-error-200",
              )}
            >
              Auto-Resolve {autoResolveResult.success ? "Completed" : "Failed"}
            </h3>
          </div>

          {autoResolveResult.success && (
            <div className="grid grid-cols-3 gap-6 text-center mb-6">
              <div className="p-4 surface rounded-xl">
                <div className="text-display text-2xl font-bold text-success-600 dark:text-success-400 mb-1">
                  {autoResolveResult.totalChanges}
                </div>
                <div className="text-sm text-success-700 dark:text-success-300">
                  Changes Made
                </div>
              </div>
              <div className="p-4 surface rounded-xl">
                <div className="text-display text-2xl font-bold text-brand-600 dark:text-brand-400 mb-1">
                  {autoResolveResult.toolsAffected}
                </div>
                <div className="text-sm text-brand-700 dark:text-brand-300">
                  Tools Updated
                </div>
              </div>
              <div className="p-4 surface rounded-xl">
                <div className="text-display text-2xl font-bold text-accent-600 dark:text-accent-400 mb-1">
                  {autoResolveResult.tagsAffected}
                </div>
                <div className="text-sm text-accent-700 dark:text-accent-300">
                  Tags Assigned
                </div>
              </div>
            </div>
          )}

          {autoResolveResult.warnings.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-warning-800 dark:text-warning-200 mb-2">
                Warnings:
              </h4>
              <ul className="space-y-1">
                {autoResolveResult.warnings.map((warning, index) => (
                  <li
                    key={index}
                    className="text-sm text-warning-700 dark:text-warning-300"
                  >
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {autoResolveResult.errors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-error-800 dark:text-error-200 mb-2">
                Errors:
              </h4>
              <ul className="space-y-1">
                {autoResolveResult.errors.map((error, index) => (
                  <li
                    key={index}
                    className="text-sm text-error-700 dark:text-error-300"
                  >
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Validation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Errors */}
        {validation.errors.length > 0 && (
          <div className="card border-error-200 dark:border-error-800 bg-error-50/50 dark:bg-error-950/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-error-100 dark:bg-error-950/30 rounded-xl flex items-center justify-center">
                <XCircleIcon className="w-5 h-5 text-error-600 dark:text-error-400" />
              </div>
              <h3 className="text-title text-lg font-semibold text-error-800 dark:text-error-200">
                Critical Errors ({validation.errors.length})
              </h3>
            </div>
            <div className="space-y-4">
              {validation.errors.map((error, index) => (
                <div key={index} className="p-4 surface rounded-xl">
                  <div className="font-medium text-error-800 dark:text-error-200 mb-1">
                    {error.code}
                  </div>
                  <div className="text-error-700 dark:text-error-300 mb-2">
                    {error.message}
                  </div>
                  {error.affectedIds && error.affectedIds.length > 0 && (
                    <div className="text-error-600 dark:text-error-400 text-xs bg-error-100 dark:bg-error-900/30 px-3 py-1 rounded-lg inline-block">
                      Affected: {error.affectedIds.length} item(s)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {validation.warnings.length > 0 && (
          <div className="card border-warning-200 dark:border-warning-800 bg-warning-50/50 dark:bg-warning-950/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-warning-100 dark:bg-warning-950/30 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 dark:text-warning-400" />
              </div>
              <h3 className="text-title text-lg font-semibold text-warning-800 dark:text-warning-200">
                Warnings ({validation.warnings.length})
              </h3>
            </div>
            <div className="space-y-4">
              {validation.warnings.map((warning, index) => (
                <div key={index} className="p-4 surface rounded-xl">
                  <div className="font-medium text-warning-800 dark:text-warning-200 mb-1">
                    {warning.code}
                  </div>
                  <div className="text-warning-700 dark:text-warning-300 mb-2">
                    {warning.message}
                  </div>
                  {warning.affectedIds && warning.affectedIds.length > 0 && (
                    <div className="text-warning-600 dark:text-warning-400 text-xs bg-warning-100 dark:bg-warning-900/30 px-3 py-1 rounded-lg inline-block">
                      Affected: {warning.affectedIds.length} item(s)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {validation.suggestions.length > 0 && (
          <div className="card border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-950/30 rounded-xl flex items-center justify-center">
                <InformationCircleIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-title text-lg font-semibold text-brand-800 dark:text-brand-200">
                Suggestions ({validation.suggestions.length})
              </h3>
            </div>
            <div className="space-y-4">
              {validation.suggestions.map((suggestion, index) => (
                <div key={index} className="p-4 surface rounded-xl">
                  <div className="font-medium text-brand-800 dark:text-brand-200 mb-1">
                    {suggestion.code}
                  </div>
                  <div className="text-brand-700 dark:text-brand-300 mb-2">
                    {suggestion.message}
                  </div>
                  {suggestion.affectedIds &&
                    suggestion.affectedIds.length > 0 && (
                      <div className="text-brand-600 dark:text-brand-400 text-xs bg-brand-100 dark:bg-brand-900/30 px-3 py-1 rounded-lg inline-block">
                        Affected: {suggestion.affectedIds.length} item(s)
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Orphaned Entities */}
      {(orphans.orphanedTools.length > 0 ||
        orphans.orphanedTags.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Orphaned Tools */}
          {orphans.orphanedTools.length > 0 && (
            <div className="card">
              <div className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warning-100 dark:bg-warning-950/30 rounded-xl flex items-center justify-center">
                    <WrenchScrewdriverIcon className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                  </div>
                  <div>
                    <h3 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      Untagged Tools ({orphans.orphanedTools.length})
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Tools that don't have any tags assigned
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8 max-h-80 overflow-y-auto scrollbar-thin">
                <div className="space-y-4">
                  {orphans.orphanedTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="card-interactive p-4 flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {tool.name}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 text-code">
                          {tool.slug}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={classNames(
                            "px-3 py-1 text-xs rounded-lg font-medium",
                            tool.isActive
                              ? "bg-success-100 text-success-800 dark:bg-success-950/30 dark:text-success-400"
                              : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300",
                          )}
                        >
                          {tool.isActive ? "Active" : "Inactive"}
                        </span>
                        <Link
                          href={`/admin/tools/${tool.id}/edit`}
                          className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Orphaned Tags */}
          {orphans.orphanedTags.length > 0 && (
            <div className="card">
              <div className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warning-100 dark:bg-warning-950/30 rounded-xl flex items-center justify-center">
                    <TagIcon className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                  </div>
                  <div>
                    <h3 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      Unused Tags ({orphans.orphanedTags.length})
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Tags that aren't assigned to any tools
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8 max-h-80 overflow-y-auto scrollbar-thin">
                <div className="space-y-4">
                  {orphans.orphanedTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="card-interactive p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="w-4 h-4 rounded-xl border border-neutral-300 dark:border-neutral-600 flex-shrink-0"
                          style={{ backgroundColor: tag.color || "#6B7280" }}
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {tag.name}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400 text-code">
                            {tag.slug}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/admin/tags/${tag.id}/edit`}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium flex-shrink-0"
                      >
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggested Actions */}
      {orphans.suggestedActions.length > 0 && (
        <div className="card">
          <div className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-950/30 rounded-xl flex items-center justify-center">
                <InformationCircleIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h3 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Suggested Actions
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Recommended steps to improve your tool-tag relationships
                </p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <ul className="space-y-3">
              {orphans.suggestedActions.map((action, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand-100 dark:bg-brand-950/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <InformationCircleIcon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <span className="text-body text-neutral-700 dark:text-neutral-300">
                    {action}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
