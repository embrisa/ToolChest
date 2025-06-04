"use client";

import React from "react";
import { Button } from "./Button";
import { cn } from "@/utils";

export interface SizeOption {
  key: string;
  name: string;
  width: number;
  height: number;
  description?: string;
  recommended?: boolean;
}

export interface SizeSelectorProps {
  sizes: Record<string, SizeOption>;
  selectedSizes: string[];
  onSizeToggle: (sizeKey: string) => void;
  disabled?: boolean;
  className?: string;
  showPresets?: boolean;
  onPresetsChange?: (preset: "standard" | "all" | "clear") => void;
}

export function SizeSelector({
  sizes,
  selectedSizes,
  onSizeToggle,
  disabled = false,
  className,
  showPresets = true,
  onPresetsChange,
}: SizeSelectorProps) {
  const sizeEntries = Object.entries(sizes);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Size Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {sizeEntries.map(([sizeKey, size]) => {
          const isSelected = selectedSizes.includes(sizeKey);
          return (
            <button
              key={sizeKey}
              type="button"
              onClick={() => onSizeToggle(sizeKey)}
              disabled={disabled}
              className={cn(
                "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-500/50",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isSelected
                  ? "border-brand-400 bg-brand-50 dark:bg-brand-950/20 shadow-colored"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-brand-300 hover:bg-brand-50/30 dark:hover:bg-brand-950/10",
              )}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? "Deselect" : "Select"} ${size.name} size (${size.width}×${size.height})`}
            >
              <div className="text-center space-y-2">
                {/* Size indicator */}
                <div
                  className={cn(
                    "w-8 h-8 mx-auto border rounded flex items-center justify-center",
                    "transition-colors duration-200",
                    isSelected
                      ? "border-brand-400 bg-brand-100 dark:bg-brand-900/50"
                      : "border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800",
                  )}
                >
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-brand-600 dark:text-brand-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                {/* Size info */}
                <div>
                  <div className="font-medium text-foreground text-sm">
                    {size.name}
                    {size.recommended && (
                      <span className="ml-1 text-xs bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 px-1 rounded">
                        ★
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-foreground-secondary">
                    {size.width}×{size.height}
                  </div>
                  {size.description && (
                    <div className="text-xs text-foreground-tertiary mt-1">
                      {size.description}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Preset buttons */}
      {showPresets && onPresetsChange && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPresetsChange("standard")}
            disabled={disabled}
            className="text-sm"
          >
            Standard Sizes
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPresetsChange("all")}
            disabled={disabled}
            className="text-sm"
          >
            Select All
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPresetsChange("clear")}
            disabled={disabled}
            className="text-sm"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Selection summary */}
      <div className="text-sm text-foreground-secondary">
        {selectedSizes.length} of {sizeEntries.length} sizes selected
        {selectedSizes.length > 0 && (
          <span className="ml-2">
            ({selectedSizes.map((key) => sizes[key]?.name).join(", ")})
          </span>
        )}
      </div>
    </div>
  );
}
