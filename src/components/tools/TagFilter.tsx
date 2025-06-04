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
  testIdPrefix?: string;
}

export function TagFilter({
  tags,
  selectedTags,
  onTagToggle,
  onClearAll,
  className,
  showCount = true,
  "data-testid": testId,
  testIdPrefix = "",
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
      className={cn("section-spacing-sm", className)}
      data-testid={testId}
    >
      {/* Header with enhanced spacing */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-primary text-xl font-semibold">
          Filter by Category
          {selectedCount > 0 && (
            <span
              className={cn(
                "ml-4 text-xs font-medium px-3 py-1.5 rounded-lg",
                "bg-brand-100 text-brand-800",
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
            className="btn-secondary text-sm"
            aria-label="Clear all selected filters"
            data-testid={`${testIdPrefix}clear-all-tags`}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Tag List with generous spacing */}
      <div
        role="group"
        aria-label="Tool category filters"
        className="space-y-4"
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
              data-testid={`${testIdPrefix}tag-${tag.slug}`}
              className={cn(
                "card-interactive p-6",
                "min-h-[80px]", // Generous touch target with room for stacked content
                "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
                isSelected
                  ? cn(
                      "border-brand-300 bg-gradient-to-r from-brand-50 to-brand-100/50",
                      "shadow-colored",
                    )
                  : "hover:bg-neutral-25",
              )}
              aria-pressed={isSelected}
              aria-describedby={showCount ? `tag-count-${tag.id}` : undefined}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-6 h-6 border-2 rounded-lg flex items-center justify-center mt-1",
                    "transition-all duration-200 group-hover:scale-110 flex-shrink-0",
                    isSelected
                      ? "border-brand-500 bg-brand-500 shadow-glow"
                      : "border-neutral-300",
                  )}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-white"
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

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="text-primary font-medium text-lg leading-tight">
                    {tag.name}
                  </div>
                  {showCount && tag.toolCount !== undefined && (
                    <div
                      id={`tag-count-${tag.id}`}
                      className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-brand-600" : "text-secondary",
                      )}
                    >
                      {tag.toolCount} tools
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Expand/Collapse Button with enhanced touch target */}
        {hiddenTags.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            onKeyDown={handleExpandKeyDown}
            className={cn(
              "card w-full p-6 min-h-[60px]",
              "text-secondary hover:text-primary",
              "hover:bg-neutral-50",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
              "transition-all duration-200 group",
            )}
            aria-expanded={isExpanded}
            aria-controls="hidden-tags"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="font-medium text-lg">
                {isExpanded
                  ? `Show fewer categories`
                  : `Show ${hiddenTags.length} more categories`}
              </span>
              <svg
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
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
