"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/utils";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  isLoading?: boolean;
  resultCount?: number;
  "data-testid"?: string;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Search tools...",
  className,
  debounceMs = 300,
  isLoading = false,
  resultCount,
  "data-testid": testId,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const debouncedSearch = useCallback(
    (searchValue: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (onSearch) {
          onSearch(searchValue);
        }
      }, debounceMs);
    },
    [onSearch, debounceMs],
  );

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    onChange("");
    if (onSearch) {
      onSearch("");
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Prevent hydration mismatch by not rendering dynamic content until mounted
  if (!mounted) {
    return (
      <div className={cn("relative", className)} data-testid={testId}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <Input
            type="text"
            placeholder={placeholder}
            className="pl-12 pr-12"
            aria-label="Search tools"
            value=""
            readOnly
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} data-testid={testId}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <svg
            className={cn(
              "h-5 w-5 transition-all duration-200",
              isFocused ? "text-brand-500" : "text-neutral-400",
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <Input
          ref={inputRef}
          type="text"
          value={value || ""}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "pl-12 pr-12",
            "bg-neutral-50 border-neutral-200",
            "hover:border-brand-300 focus:border-brand-500",
            "transition-all duration-200",
          )}
          aria-label="Search tools"
          aria-describedby={
            resultCount !== undefined ? "search-results-count" : undefined
          }
        />

        {/* Loading Spinner or Clear Button */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center z-10">
          {isLoading ? (
            <div
              className="animate-spin h-5 w-5 text-brand-500"
              aria-hidden="true"
              role="status"
              aria-label="Searching"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          ) : (
            value && (
              <button
                onClick={handleClear}
                className={cn(
                  "min-h-[2.75rem] min-w-[2.75rem] rounded-full flex items-center justify-center",
                  "text-neutral-400 hover:text-neutral-600",
                  "hover:bg-neutral-100 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
                )}
                aria-label="Clear search"
                type="button"
              >
                <svg
                  className="h-4 w-4"
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
              </button>
            )
          )}
        </div>
      </div>

      {/* Search Results Summary */}
      {value && resultCount !== undefined && (
        <div
          className={cn("mt-3 text-sm text-secondary", "animate-fade-in-up")}
          aria-live="polite"
        >
          {resultCount === 0 ? (
            <span className="text-warning-600 font-medium">
              No tools found for &quot;{value}&quot;
            </span>
          ) : (
            <span>
              {resultCount} tool{resultCount !== 1 ? "s" : ""} found
              {value && ` for &quot;${value}&quot;`}
            </span>
          )}
        </div>
      )}

      {/* Screen reader announcement for search results */}
      {resultCount !== undefined && (
        <div
          id="search-results-count"
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {value ? `${resultCount} tools found for ${value}` : ""}
        </div>
      )}
    </div>
  );
}
