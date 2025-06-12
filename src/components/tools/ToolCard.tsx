"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ToolDTO } from "@/types/tools/tool";
import { cn } from "@/utils";

export interface ToolCardProps {
  tool: ToolDTO;
  className?: string;
  showUsageCount?: boolean;
  priority?: boolean;
  "data-testid"?: string;
}

interface TranslationErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

class TranslationErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  TranslationErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): TranslationErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Translation error in ToolCard:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export function ToolCard({
  tool,
  className,
  showUsageCount = false,
  priority: _priority = false,
  "data-testid": testId,
}: ToolCardProps) {
  const locale = useLocale();
  const toolPath = `/${locale}/tools/${tool.slug}`;

  // Validate that required translation fields are present
  const hasValidTranslations = tool.name && tool.name.trim().length > 0;

  // Get tool-specific styling based on tool type
  const getToolStyling = (toolSlug: string) => {
    switch (toolSlug) {
      case "base64":
        return {
          hoverShadow: "hover:shadow-[0_8px_24px_rgb(14_165_233_/_0.15)]",
          hoverBorder: "hover:border-brand-200",
          iconBg: "bg-gradient-to-br from-brand-500 to-brand-600",
          titleHover: "group-hover:text-brand-600",
        };
      case "hash-generator":
        return {
          hoverShadow: "hover:shadow-[0_8px_24px_rgb(217_70_239_/_0.15)]",
          hoverBorder: "hover:border-accent-200",
          iconBg: "bg-gradient-to-br from-accent-500 to-accent-600",
          titleHover: "group-hover:text-accent-600",
        };
      case "favicon-generator":
        return {
          hoverShadow: "hover:shadow-[0_8px_24px_rgb(34_197_94_/_0.15)]",
          hoverBorder: "hover:border-success-200",
          iconBg: "bg-gradient-to-br from-success-500 to-success-600",
          titleHover: "group-hover:text-success-600",
        };
      case "markdown-to-pdf":
        return {
          hoverShadow: "hover:shadow-[0_8px_24px_rgb(245_158_11_/_0.15)]",
          hoverBorder: "hover:border-warning-200",
          iconBg: "bg-gradient-to-br from-warning-500 to-warning-600",
          titleHover: "group-hover:text-warning-600",
        };
      default:
        return {
          hoverShadow: "hover:shadow-[0_8px_24px_rgb(14_165_233_/_0.15)]",
          hoverBorder: "hover:border-brand-200",
          iconBg: "bg-gradient-to-br from-brand-500 to-brand-600",
          titleHover: "group-hover:text-brand-600",
        };
    }
  };

  const toolStyling = getToolStyling(tool.slug);

  // Error fallback component for when translations are missing
  const TranslationErrorFallback = () => (
    <Card
      className={cn(
        "group transition-all duration-300 cursor-pointer h-full",
        "border-error-200 bg-error-50",
        "shadow-soft",
        "min-h-[240px]",
        className,
      )}
      variant="interactive"
      data-testid={testId}
      role="alert"
      aria-label="Translation error for tool"
    >
      <CardHeader className="pb-6">
        <CardTitle as="h3" className="text-xl font-semibold text-error-600">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center bg-error-100 text-error-600 font-semibold text-xl flex-shrink-0"
              aria-hidden="true"
            >
              !
            </div>
            <span className="text-balance leading-tight">
              Translation Missing
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-error-600 text-sm">
          Tool content is temporarily unavailable. Please try refreshing the
          page.
        </p>
      </CardContent>
    </Card>
  );

  // If translations are missing, show error state
  if (!hasValidTranslations) {
    return <TranslationErrorFallback />;
  }

  return (
    <TranslationErrorBoundary fallback={<TranslationErrorFallback />}>
      <Card
        className={cn(
          "group transition-all duration-300 cursor-pointer h-full",
          "border-neutral-200 bg-neutral-50",
          "shadow-soft hover:shadow-large",
          "hover:scale-[1.02] hover:-translate-y-1",
          "focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2",
          "min-h-[240px]", // Generous minimum height for consistency
          toolStyling.hoverShadow,
          toolStyling.hoverBorder,
          className,
        )}
        variant="interactive"
        data-testid={testId}
        role="article"
      >
        <Link
          href={toolPath}
          className="block h-full focus:outline-none"
          aria-describedby={
            tool.description ? `tool-description-${tool.id}` : undefined
          }
          aria-label={`${tool.name} - Open tool${tool.description ? ". " + tool.description : ""}`}
        >
          <CardHeader className="pb-6">
            <CardTitle
              as="h3"
              className={cn(
                "text-xl font-semibold",
                "text-primary",
                "transition-all duration-200",
                toolStyling.titleHover,
              )}
            >
              <div className="flex items-center gap-4">
                {tool.iconClass ? (
                  <span
                    className={cn(
                      tool.iconClass,
                      "text-2xl flex-shrink-0",
                      "transition-transform duration-200 group-hover:scale-110",
                    )}
                    aria-hidden="true"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      "text-white font-semibold text-xl flex-shrink-0",
                      "transition-transform duration-200 group-hover:scale-110",
                      toolStyling.iconBg,
                    )}
                    aria-hidden="true"
                  >
                    {tool.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-balance leading-tight">{tool.name}</span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {tool.description && tool.description.trim().length > 0 && (
              <p
                id={`tool-description-${tool.id}`}
                className="text-secondary text-lg line-clamp-2 text-pretty leading-relaxed"
              >
                {tool.description}
              </p>
            )}

            {tool.tags && tool.tags.length > 0 && (
              <div
                className="flex flex-wrap gap-3"
                role="list"
                aria-label={`Tags for ${tool.name}: ${tool.tags
                  .slice(0, 3)
                  .map((tag) => tag.name)
                  .filter(Boolean)
                  .join(", ")}`}
              >
                {tool.tags.slice(0, 3).map((tag) => {
                  // Only render tags with valid translations
                  if (!tag.name || tag.name.trim().length === 0) {
                    return null;
                  }

                  return (
                    <span
                      key={tag.id}
                      role="listitem"
                      className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-lg",
                        "text-sm font-medium",
                        "bg-neutral-100 text-tertiary",
                        "transition-colors duration-200",
                      )}
                      style={
                        tag.color
                          ? {
                              backgroundColor: `${tag.color}15`,
                              color: tag.color,
                              borderColor: `${tag.color}30`,
                            }
                          : undefined
                      }
                      aria-label={`Tag: ${tag.name}`}
                    >
                      {tag.name}
                    </span>
                  );
                })}
                {tool.tags.filter(
                  (tag) => tag.name && tag.name.trim().length > 0,
                ).length > 3 && (
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1.5 rounded-lg",
                      "text-sm font-medium",
                      "bg-neutral-100 text-muted",
                    )}
                    aria-label={`${tool.tags.filter((tag) => tag.name && tag.name.trim().length > 0).length - 3} additional tags`}
                  >
                    +
                    {tool.tags.filter(
                      (tag) => tag.name && tag.name.trim().length > 0,
                    ).length - 3}{" "}
                    more
                  </span>
                )}
              </div>
            )}

            {showUsageCount && tool.usageCount !== undefined && (
              <div
                className={cn("flex items-center gap-2 text-sm", "text-muted")}
                aria-label={`Usage statistics: ${tool.usageCount.toLocaleString()} uses`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span>{tool.usageCount} uses</span>
              </div>
            )}
          </CardContent>

          {/* Hover indicator with enhanced spacing */}
          <div
            className={cn(
              "absolute top-6 right-6 opacity-0 group-hover:opacity-100",
              "transition-all duration-200 transform group-hover:scale-110",
            )}
            aria-hidden="true"
          >
            <svg
              className="w-6 h-6 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
        </Link>
      </Card>
    </TranslationErrorBoundary>
  );
}
