"use client";

import React, { useState, useRef, useEffect } from "react";
import { TagDTO } from "@/types/tools/tool";
import { cn } from "@/utils";

export interface TagFilterProps {
  tags: TagDTO[];
  selectedTags: string[];
  onTagToggle: (tagSlug: string) => void;
  onClearAll: () => void;
  className?: string;
  showCount?: boolean;
  "data-testid"?: string;
}

export function TagFilter({
  tags,
  selectedTags,
  onTagToggle,
  onClearAll,
  className,
  showCount = true,
  "data-testid": testId,
}: TagFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const maxVisibleTags = 6;

  const visibleTags = tags.slice(0, maxVisibleTags);
  const hiddenTags = tags.slice(maxVisibleTags);
  const tagsToShow = isExpanded ? tags : visibleTags;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const handleKeyDown = (e: React.KeyboardEvent, tagSlug: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onTagToggle(tagSlug);
    }
  };

  const handleExpandKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  const selectedCount = selectedTags.length;

  return (
    <div
      ref={containerRef}
      className={cn("space-y-4", className)}
      data-testid={testId}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Filter by Category
          {selectedCount > 0 && (
            <span
              className={cn(
                "ml-3 text-xs font-medium px-2.5 py-1 rounded-full",
                "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200",
                "animate-fade-in",
              )}
            >
              {selectedCount} selected
            </span>
          )}
        </h2>

        {selectedCount > 0 && (
          <button
            onClick={onClearAll}
            className={cn(
              "text-sm font-medium px-3 py-1.5 rounded-lg",
              "text-brand-600 hover:text-brand-700",
              "dark:text-brand-400 dark:hover:text-brand-300",
              "hover:bg-brand-50 dark:hover:bg-brand-950/50",
              "focus:outline-none focus:ring-2 focus:ring-brand-500/20",
              "transition-all duration-200",
            )}
            aria-label="Clear all selected filters"
            data-testid="clear-all-tags"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Tag List */}
      <div
        role="group"
        aria-label="Tool category filters"
        className="space-y-3"
      >
        {tagsToShow.map((tag) => {
          const isSelected = selectedTags.includes(tag.slug);

          return (
            <div
              key={tag.id}
              role="button"
              tabIndex={0}
              onClick={() => onTagToggle(tag.slug)}
              onKeyDown={(e) => handleKeyDown(e, tag.slug)}
              data-testid={`tag-${tag.slug}`}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border cursor-pointer",
                "transition-all duration-200 group",
                "focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:ring-offset-2",
                "dark:focus:ring-offset-neutral-900",
                isSelected
                  ? cn(
                      "border-brand-300 bg-gradient-to-r from-brand-50 to-brand-100/50",
                      "dark:border-brand-600 dark:from-brand-950/50 dark:to-brand-900/30",
                      "text-brand-900 dark:text-brand-100",
                      "shadow-colored",
                    )
                  : cn(
                      "border-neutral-200 dark:border-neutral-700",
                      "bg-white dark:bg-neutral-900",
                      "text-neutral-700 dark:text-neutral-300",
                      "hover:border-brand-200 dark:hover:border-brand-700",
                      "hover:bg-brand-50/50 dark:hover:bg-brand-950/20",
                      "shadow-soft hover:shadow-medium",
                    ),
              )}
              aria-pressed={isSelected}
              aria-describedby={showCount ? `tag-count-${tag.id}` : undefined}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-5 h-5 border-2 rounded-md flex items-center justify-center",
                    "transition-all duration-200 group-hover:scale-110",
                    isSelected
                      ? "border-brand-500 bg-brand-500 shadow-glow"
                      : "border-neutral-300 dark:border-neutral-600",
                  )}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                <span className="text-body font-medium">{tag.name}</span>
              </div>

              {showCount && tag.toolCount !== undefined && (
                <span
                  id={`tag-count-${tag.id}`}
                  className={cn(
                    "text-sm px-2 py-1 rounded-lg font-medium",
                    isSelected
                      ? "text-brand-600 bg-brand-200/50 dark:text-brand-300 dark:bg-brand-800/50"
                      : "text-neutral-500 bg-neutral-100 dark:text-neutral-400 dark:bg-neutral-800",
                  )}
                >
                  {tag.toolCount} tools
                </span>
              )}
            </div>
          );
        })}

        {/* Expand/Collapse Button */}
        {hiddenTags.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            onKeyDown={handleExpandKeyDown}
            className={cn(
              "w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-700",
              "bg-white dark:bg-neutral-900",
              "text-neutral-600 hover:text-neutral-800",
              "dark:text-neutral-400 dark:hover:text-neutral-200",
              "hover:bg-neutral-50 dark:hover:bg-neutral-800",
              "hover:border-neutral-300 dark:hover:border-neutral-600",
              "focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:ring-offset-2",
              "dark:focus:ring-offset-neutral-900",
              "transition-all duration-200 group",
              "shadow-soft hover:shadow-medium",
            )}
            aria-expanded={isExpanded}
            aria-controls="hidden-tags"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-body font-medium">
                {isExpanded
                  ? `Show fewer categories`
                  : `Show ${hiddenTags.length} more categories`}
              </span>
              <svg
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isExpanded ? "rotate-180" : "rotate-0",
                  "group-hover:scale-110",
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Selected Tags Summary for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {selectedCount > 0 &&
          `${selectedCount} categories selected: ${selectedTags
            .map((slug) => tags.find((tag) => tag.slug === slug)?.name)
            .filter(Boolean)
            .join(", ")}`}
      </div>
    </div>
  );
}
