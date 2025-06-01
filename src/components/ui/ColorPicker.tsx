"use client";

import { useState, useCallback } from "react";
import { Button } from "./Button";
import { cn } from "@/utils";

export interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  presetColors?: { name: string; value: string; description?: string }[];
  allowCustom?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const DEFAULT_PRESET_COLORS = [
  { name: "Transparent", value: "transparent", description: "No background" },
  { name: "White", value: "#ffffff", description: "White background" },
  { name: "Black", value: "#000000", description: "Black background" },
  {
    name: "Light Gray",
    value: "#f5f5f5",
    description: "Light gray background",
  },
  { name: "Dark Gray", value: "#333333", description: "Dark gray background" },
  { name: "Blue", value: "#2563eb", description: "Blue background" },
  { name: "Green", value: "#16a34a", description: "Green background" },
  { name: "Red", value: "#dc2626", description: "Red background" },
  { name: "Purple", value: "#9333ea", description: "Purple background" },
  { name: "Orange", value: "#ea580c", description: "Orange background" },
];

export function ColorPicker({
  value = "transparent",
  onChange,
  presetColors = DEFAULT_PRESET_COLORS,
  allowCustom = true,
  disabled = false,
  label = "Background Color",
  className = "",
}: ColorPickerProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customColor, setCustomColor] = useState(
    value && !presetColors.some((color) => color.value === value)
      ? value
      : "#ffffff",
  );

  const handlePresetSelect = useCallback(
    (color: string) => {
      onChange(color);
      setShowCustomPicker(false);
    },
    [onChange],
  );

  const handleCustomColorChange = useCallback(
    (color: string) => {
      setCustomColor(color);
      onChange(color);
    },
    [onChange],
  );

  const toggleCustomPicker = useCallback(() => {
    setShowCustomPicker((prev) => !prev);
    if (!showCustomPicker) {
      onChange(customColor);
    }
  }, [showCustomPicker, customColor, onChange]);

  const isCustomColor = !presetColors.some((color) => color.value === value);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Label with enhanced contrast */}
      {label && (
        <label className="text-primary text-sm font-medium block mb-4">
          {label}
        </label>
      )}

      {/* Preset Colors Grid with proper spacing */}
      <div className="grid grid-cols-5 gap-4">
        {presetColors.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => handlePresetSelect(color.value)}
            disabled={disabled}
            className={cn(
              // Base styling with enhanced touch targets (48px minimum)
              "relative w-14 h-14 rounded-lg border-2 transition-all duration-200",
              // Focus and interaction states using design system
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
              "hover:scale-105 active:scale-95",
              // Selection and default states with enhanced contrast
              value === color.value
                ? "border-brand-500 ring-2 ring-brand-500/20 shadow-medium"
                : "border-neutral-200 hover:border-neutral-300 shadow-soft",
              // Disabled state
              disabled
                ? "opacity-50 cursor-not-allowed hover:scale-100"
                : "cursor-pointer",
            )}
            style={{
              backgroundColor:
                color.value === "transparent" ? "transparent" : color.value,
              backgroundImage:
                color.value === "transparent"
                  ? "linear-gradient(45deg, #dadce0 25%, transparent 25%), linear-gradient(-45deg, #dadce0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #dadce0 75%), linear-gradient(-45deg, transparent 75%, #dadce0 75%)"
                  : undefined,
              backgroundSize:
                color.value === "transparent" ? "8px 8px" : undefined,
              backgroundPosition:
                color.value === "transparent"
                  ? "0 0, 0 4px, 4px -4px, -4px 0px"
                  : undefined,
            }}
            aria-label={`${color.name}${color.description ? ` - ${color.description}` : ""}`}
            title={color.description || color.name}
          >
            {/* Selection indicator with enhanced visibility */}
            {value === color.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-neutral-50 border-2 border-neutral-300 flex items-center justify-center shadow-medium">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-500"></div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Custom Color Section */}
      {allowCustom && (
        <div className="space-y-4">
          <Button
            type="button"
            variant={
              showCustomPicker || isCustomColor ? "primary" : "secondary"
            }
            size="sm"
            onClick={toggleCustomPicker}
            disabled={disabled}
            className="w-full"
          >
            {showCustomPicker || isCustomColor
              ? "Using Custom Color"
              : "Choose Custom Color"}
          </Button>

          {/* Custom Color Controls */}
          {(showCustomPicker || isCustomColor) && (
            <div className="card p-6 space-y-6">
              {/* Color Picker Input */}
              <div className="flex items-center gap-4">
                <label
                  htmlFor="custom-color-input"
                  className="text-primary text-sm font-medium min-w-0 flex-shrink-0"
                >
                  Custom:
                </label>
                <input
                  id="custom-color-input"
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  disabled={disabled}
                  className={cn(
                    // Enhanced touch target and styling
                    "w-12 h-12 rounded-lg border-2 border-neutral-200 cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "shadow-soft hover:shadow-medium transition-all duration-200",
                  )}
                  aria-label="Choose custom color"
                />
              </div>

              {/* Hex Input with Preview */}
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    const color = e.target.value;
                    if (/^#[0-9A-Fa-f]{6}$/.test(color) || color === "") {
                      handleCustomColorChange(color);
                    }
                  }}
                  placeholder="#ffffff"
                  disabled={disabled}
                  className="input-field flex-1 font-mono text-sm"
                  aria-label="Custom color hex value"
                />
                {/* Color Preview */}
                <div
                  className="w-12 h-12 rounded-lg border-2 border-neutral-200 shadow-soft flex-shrink-0"
                  style={{ backgroundColor: customColor }}
                  aria-hidden="true"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Selection Display with enhanced contrast */}
      <div className="text-tertiary text-sm">
        <span className="font-medium">Current:</span>{" "}
        <span className="text-primary">
          {presetColors.find((color) => color.value === value)?.name ||
            (value === "transparent" ? "Transparent" : value)}
        </span>
      </div>
    </div>
  );
}
