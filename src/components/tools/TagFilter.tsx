'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TagDTO } from '@/types/tools/tool';
import { cn } from '@/utils';

export interface TagFilterProps {
    tags: TagDTO[];
    selectedTags: string[];
    onTagToggle: (tagSlug: string) => void;
    onClearAll: () => void;
    className?: string;
    showCount?: boolean;
}

export function TagFilter({
    tags,
    selectedTags,
    onTagToggle,
    onClearAll,
    className,
    showCount = true
}: TagFilterProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const maxVisibleTags = 6;

    const visibleTags = tags.slice(0, maxVisibleTags);
    const hiddenTags = tags.slice(maxVisibleTags);
    const tagsToShow = isExpanded ? tags : visibleTags;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    const handleKeyDown = (e: React.KeyboardEvent, tagSlug: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTagToggle(tagSlug);
        }
    };

    const handleExpandKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
        }
    };

    const selectedCount = selectedTags.length;

    return (
        <div ref={containerRef} className={cn("space-y-3", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                    Filter by Category
                    {selectedCount > 0 && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {selectedCount} selected
                        </span>
                    )}
                </h3>

                {selectedCount > 0 && (
                    <button
                        onClick={onClearAll}
                        className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                        aria-label="Clear all selected filters"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Tag List */}
            <div
                role="group"
                aria-label="Tool category filters"
                className="space-y-2"
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
                            className={cn(
                                "flex items-center justify-between p-2 rounded-md border cursor-pointer transition-all",
                                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                                "hover:border-blue-300 hover:bg-blue-50",
                                isSelected
                                    ? "border-blue-500 bg-blue-50 text-blue-900"
                                    : "border-gray-200 bg-white text-gray-700"
                            )}
                            aria-pressed={isSelected}
                            aria-describedby={showCount ? `tag-count-${tag.id}` : undefined}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className={cn(
                                        "w-4 h-4 border-2 rounded flex items-center justify-center transition-colors",
                                        isSelected
                                            ? "border-blue-500 bg-blue-500"
                                            : "border-gray-300"
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

                                <span className="text-sm font-medium">
                                    {tag.name}
                                </span>
                            </div>

                            {showCount && tag.toolCount !== undefined && (
                                <span
                                    id={`tag-count-${tag.id}`}
                                    className="text-xs text-gray-500"
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
                            "w-full p-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50",
                            "border border-gray-200 rounded-md transition-colors",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        )}
                        aria-expanded={isExpanded}
                        aria-controls="hidden-tags"
                    >
                        {isExpanded ? (
                            <>
                                Show fewer categories
                                <svg
                                    className="w-4 h-4 ml-1 inline"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 15l7-7 7 7"
                                    />
                                </svg>
                            </>
                        ) : (
                            <>
                                Show {hiddenTags.length} more categories
                                <svg
                                    className="w-4 h-4 ml-1 inline"
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
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Screen reader announcement for filter changes */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
                {selectedCount > 0
                    ? `${selectedCount} categories selected for filtering`
                    : 'No categories selected'
                }
            </div>
        </div>
    );
} 