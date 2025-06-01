"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { ErrorPageProps } from "@/types/errors";
import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

export function ErrorPage({
  statusCode,
  title,
  message,
  description,
  suggestions = [],
  recoveryActions = [],
  showContactSupport = false,
  showTechnicalDetails = false,
  technicalDetails,
}: ErrorPageProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyTechnicalDetails = async () => {
    if (!technicalDetails) return;

    const details = [
      `Error ID: ${technicalDetails.errorId || "N/A"}`,
      `Timestamp: ${technicalDetails.timestamp || "N/A"}`,
      `Path: ${technicalDetails.path || "N/A"}`,
      `User Agent: ${technicalDetails.userAgent || "N/A"}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(details);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = details;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleActionClick = (action: {
    type: string;
    onClick?: () => void;
    href?: string;
  }) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      window.location.href = action.href;
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Code and Icon */}
        <div className="mb-8 animate-fade-in-up">
          <div
            className="text-6xl font-bold text-gradient bg-gradient-to-r from-error-500 to-error-600 bg-clip-text text-transparent mb-4"
            aria-hidden="true"
          >
            {statusCode}
          </div>
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-error-50 dark:bg-error-950/20 border border-error-200 dark:border-error-800/30 rounded-2xl flex items-center justify-center shadow-soft">
              <ExclamationTriangleIcon
                className="w-12 h-12 text-error-500 dark:text-error-400"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div
          className="mb-8 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h1 className="text-title text-3xl font-bold text-foreground mb-4">
            {title}
          </h1>
          <p className="text-body text-lg text-foreground-secondary mb-4">
            {message}
          </p>
          {description && (
            <p className="text-body text-foreground-tertiary max-w-lg mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div
            className="mb-10 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="text-heading text-xl font-semibold text-foreground mb-6">
              Here&apos;s what you can do:
            </h2>
            <ul className="text-left space-y-3 text-foreground-secondary max-w-md mx-auto">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start group">
                  <span
                    className="inline-block w-2 h-2 bg-brand-500 rounded-full mt-2.5 mr-4 flex-shrink-0 group-hover:bg-brand-600 transition-colors duration-200"
                    aria-hidden="true"
                  ></span>
                  <span className="text-body group-hover:text-foreground transition-colors duration-200">
                    {suggestion}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recovery Actions */}
        {recoveryActions.length > 0 && (
          <div
            className="mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {recoveryActions.map((action, index) => (
                <Button
                  key={index}
                  variant={
                    action.type === "navigate_home"
                      ? "primary"
                      : action.type === "retry"
                        ? "secondary"
                        : "ghost"
                  }
                  size="md"
                  className="flex items-center gap-2 focus-ring"
                  onClick={() => handleActionClick(action)}
                >
                  {action.type === "navigate_home" && (
                    <HomeIcon className="w-4 h-4" aria-hidden="true" />
                  )}
                  {action.type === "navigate_back" && (
                    <ArrowLeftIcon className="w-4 h-4" aria-hidden="true" />
                  )}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Technical Details Section */}
        {showTechnicalDetails && technicalDetails && (
          <div
            className="mb-8 border-t border-border pt-6 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 mx-auto text-sm text-foreground-secondary hover:text-foreground focus-ring rounded-lg px-3 py-2 transition-all duration-200"
              aria-expanded={showDetails}
              aria-controls="technical-details"
            >
              Technical Details
              {showDetails ? (
                <ChevronUpIcon className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            {showDetails && (
              <div
                id="technical-details"
                className="mt-4 p-6 surface rounded-xl text-left text-sm animate-fade-in"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-foreground">
                    Error Information
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyTechnicalDetails}
                    className="text-xs"
                  >
                    <ClipboardDocumentIcon
                      className="w-3 h-3 mr-1"
                      aria-hidden="true"
                    />
                    {copySuccess ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <dl className="space-y-3">
                  {technicalDetails.errorId && (
                    <div>
                      <dt className="font-medium text-foreground-secondary mb-1">
                        Error ID:
                      </dt>
                      <dd className="text-code text-foreground-tertiary bg-background-secondary px-3 py-2 rounded-lg break-all">
                        {technicalDetails.errorId}
                      </dd>
                    </div>
                  )}
                  {technicalDetails.timestamp && (
                    <div>
                      <dt className="font-medium text-foreground-secondary mb-1">
                        Timestamp:
                      </dt>
                      <dd className="text-code text-foreground-tertiary bg-background-secondary px-3 py-2 rounded-lg">
                        {new Date(technicalDetails.timestamp).toLocaleString()}
                      </dd>
                    </div>
                  )}
                  {technicalDetails.path && (
                    <div>
                      <dt className="font-medium text-foreground-secondary mb-1">
                        Path:
                      </dt>
                      <dd className="text-code text-foreground-tertiary bg-background-secondary px-3 py-2 rounded-lg break-all">
                        {technicalDetails.path}
                      </dd>
                    </div>
                  )}
                  {technicalDetails.userAgent && (
                    <div>
                      <dt className="font-medium text-foreground-secondary mb-1">
                        User Agent:
                      </dt>
                      <dd className="text-code text-foreground-tertiary bg-background-secondary px-3 py-2 rounded-lg break-all">
                        {technicalDetails.userAgent}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        )}

        {/* Contact Support */}
        {showContactSupport && (
          <div
            className="pt-6 border-t border-border animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <p className="text-sm text-foreground-secondary mb-4">
              Need additional help? Our support team is here to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`mailto:support@tool-chest.com?subject=Error Report - ${technicalDetails?.errorId || statusCode}`}
                className="btn-primary"
              >
                Contact Support
              </a>
              <Link href="/" className="btn-secondary flex items-center gap-2">
                <HomeIcon className="w-4 h-4" aria-hidden="true" />
                Return to Home
              </Link>
            </div>
          </div>
        )}

        {/* Screen Reader Announcement */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Error {statusCode}: {title}. {message}
          {suggestions.length > 0 &&
            ` ${suggestions.length} suggestions available.`}
          {recoveryActions.length > 0 &&
            ` ${recoveryActions.length} recovery actions available.`}
        </div>
      </div>
    </div>
  );
}
