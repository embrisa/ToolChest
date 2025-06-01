import React from "react";
import Link from "next/link";
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

export function ToolCard({
  tool,
  className,
  showUsageCount = false,
  priority: _priority = false,
  "data-testid": testId,
}: ToolCardProps) {
  const toolPath = `/tools/${tool.slug}`;

  // Get tool-specific styling based on tool type
  const getToolStyling = (toolSlug: string) => {
    switch (toolSlug) {
      case "base64":
        return {
          hoverShadow: "hover:shadow-[0_8px_24px_rgb(14_165_233_/_0.15)]",
          hoverBorder: "hover:border-brand-200 dark:hover:border-brand-700",
          iconBg: "bg-gradient-to-br from-brand-500 to-brand-600",
          titleHover:
            "group-hover:text-brand-600 dark:group-hover:text-brand-400",
        };
      case "hash-generator":
        return {
          hoverShadow: "hover:shadow-[0_8px_24px_rgb(217_70_239_/_0.15)]",
          hoverBorder: "hover:border-accent-200 dark:hover:border-accent-700",
          iconBg: "bg-gradient-to-br from-accent-500 to-accent-600",
          titleHover:
            "group-hover:text-accent-600 dark:group-hover:text-accent-400",
        };
      case "favicon-generator":
        return {
          hoverShadow: "hover:shadow-[0_8px_24px_rgb(34_197_94_/_0.15)]",
          hoverBorder: "hover:border-success-200 dark:hover:border-success-700",
          iconBg: "bg-gradient-to-br from-success-500 to-success-600",
          titleHover:
            "group-hover:text-success-600 dark:group-hover:text-success-400",
        };
      case "markdown-to-pdf":
        return {
          hoverShadow: "hover:shadow-[0_8px_24px_rgb(245_158_11_/_0.15)]",
          hoverBorder: "hover:border-warning-200 dark:hover:border-warning-700",
          iconBg: "bg-gradient-to-br from-warning-500 to-warning-600",
          titleHover:
            "group-hover:text-warning-600 dark:group-hover:text-warning-400",
        };
      default:
        return {
          hoverShadow: "hover:shadow-[0_8px_24px_rgb(14_165_233_/_0.15)]",
          hoverBorder: "hover:border-brand-200 dark:hover:border-brand-700",
          iconBg: "bg-gradient-to-br from-brand-500 to-brand-600",
          titleHover:
            "group-hover:text-brand-600 dark:group-hover:text-brand-400",
        };
    }
  };

  const toolStyling = getToolStyling(tool.slug);

  return (
    <Card
      className={cn(
        "group transition-all duration-300 cursor-pointer h-full",
        "border-neutral-200 dark:border-neutral-800",
        "bg-white dark:bg-neutral-900",
        "shadow-soft hover:shadow-large",
        "hover:scale-[1.02] hover:-translate-y-1",
        "focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:ring-offset-2",
        "dark:focus-within:ring-offset-neutral-900",
        toolStyling.hoverShadow,
        toolStyling.hoverBorder,
        className,
      )}
      variant="interactive"
      data-testid={testId}
    >
      <Link
        href={toolPath}
        className="block h-full focus:outline-none"
        aria-describedby={`tool-description-${tool.id}`}
      >
        <CardHeader className="pb-4">
          <CardTitle
            as="h3"
            className={cn(
              "text-title text-lg font-semibold",
              "text-neutral-900 dark:text-neutral-100",
              "transition-all duration-200",
              toolStyling.titleHover,
            )}
          >
            <div className="flex items-center gap-4">
              {tool.iconClass ? (
                <span
                  className={cn(
                    tool.iconClass,
                    "text-xl flex-shrink-0",
                    "transition-transform duration-200 group-hover:scale-110",
                  )}
                  aria-hidden="true"
                />
              ) : (
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    "text-white font-semibold text-lg flex-shrink-0",
                    "transition-transform duration-200 group-hover:scale-110",
                    toolStyling.iconBg,
                  )}
                  aria-hidden="true"
                >
                  {tool.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-balance">{tool.name}</span>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {tool.description && (
            <p
              id={`tool-description-${tool.id}`}
              className={cn(
                "text-body text-neutral-600 dark:text-neutral-400",
                "line-clamp-2 text-pretty",
              )}
            >
              {tool.description}
            </p>
          )}

          {tool.tags && tool.tags.length > 0 && (
            <div
              className="flex flex-wrap gap-2"
              role="list"
              aria-label="Tool categories"
            >
              {tool.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  role="listitem"
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-lg",
                    "text-xs font-medium",
                    "bg-neutral-100 text-neutral-700",
                    "dark:bg-neutral-800 dark:text-neutral-300",
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
                >
                  {tag.name}
                </span>
              ))}
              {tool.tags.length > 3 && (
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-lg",
                    "text-xs font-medium",
                    "bg-neutral-100 text-neutral-500",
                    "dark:bg-neutral-800 dark:text-neutral-400",
                  )}
                >
                  +{tool.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {showUsageCount && tool.usageCount !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs",
                "text-neutral-500 dark:text-neutral-400",
              )}
            >
              <svg
                className="w-3.5 h-3.5"
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
              <span>Used {tool.usageCount.toLocaleString()} times</span>
            </div>
          )}
        </CardContent>

        {/* Hover indicator */}
        <div
          className={cn(
            "absolute top-4 right-4 opacity-0 group-hover:opacity-100",
            "transition-all duration-200 transform group-hover:scale-110",
          )}
          aria-hidden="true"
        >
          <svg
            className="w-5 h-5 text-neutral-400 dark:text-neutral-500"
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
  );
}
