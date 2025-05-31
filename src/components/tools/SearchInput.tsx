'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils';

export interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onSearch?: (value: string) => void;
    placeholder?: string;
    className?: string;
    debounceMs?: number;
    isLoading?: boolean;
    resultCount?: number;
}

export function SearchInput({
    value,
    onChange,
    onSearch,
    placeholder = "Search tools...",
    className,
    debounceMs = 300,
    isLoading = false,
    resultCount
}: SearchInputProps) {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedSearch = useCallback((searchValue: string) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            if (onSearch) {
                onSearch(searchValue);
            }
        }, debounceMs);
    }, [onSearch, debounceMs]);

    const handleInputChange = (newValue: string) => {
        onChange(newValue);
        debouncedSearch(newValue);
    };

    const handleClear = () => {
        onChange('');
        if (onSearch) {
            onSearch('');
        }
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
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

    return (
        <div className={cn("relative", className)}>
            <div className="relative">
                {/* Search Icon */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                        className={cn(
                            "h-5 w-5 transition-colors",
                            isFocused ? "text-blue-500" : "text-gray-400"
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
                    value={value}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="pl-10 pr-10"
                    aria-label="Search tools"
                    aria-describedby={resultCount !== undefined ? "search-results-count" : undefined}
                />

                {/* Loading Spinner or Clear Button */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {isLoading ? (
                        <div className="animate-spin h-5 w-5 text-gray-400" aria-hidden="true">
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
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                        </div>
                    ) : value && (
                        <button
                            onClick={handleClear}
                            className="h-5 w-5 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                            aria-label="Clear search"
                            type="button"
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Screen reader announcement for search results */}
            {resultCount !== undefined && (
                <div
                    id="search-results-count"
                    className="sr-only"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {value ? `${resultCount} tools found` : ''}
                </div>
            )}
        </div>
    );
} 