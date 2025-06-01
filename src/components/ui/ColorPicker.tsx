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
    <div className={cn("form-group", className)}>
      {label && <label className="form-label">{label}</label>}

      {/* Preset Colors */}
      <div className="grid grid-cols-5 gap-3">
        {presetColors.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => handlePresetSelect(color.value)}
            disabled={disabled}
            className={cn(
              "relative w-14 h-14 rounded-xl border-2 transition-all duration-200",
              "focus-ring hover:scale-105",
              value === color.value
                ? "border-brand-500 ring-2 ring-brand-500/20 shadow-medium"
                : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500",
              disabled
                ? "opacity-50 cursor-not-allowed hover:scale-100"
                : "cursor-pointer",
            )}
            style={{
              backgroundColor:
                color.value === "transparent" ? "transparent" : color.value,
              backgroundImage:
                color.value === "transparent"
                  ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
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
            {value === color.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-600 flex items-center justify-center shadow-medium">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-500"></div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Custom Color Option */}
      {allowCustom && (
        <div className="space-y-3">
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

          {(showCustomPicker || isCustomColor) && (
            <div className="surface-elevated p-4 rounded-xl space-y-4">
              <div className="flex items-center space-x-3">
                <label
                  htmlFor="custom-color-input"
                  className="text-body text-sm font-medium text-neutral-900 dark:text-neutral-100"
                >
                  Custom:
                </label>
                <input
                  id="custom-color-input"
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  disabled={disabled}
                  className="w-10 h-10 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 cursor-pointer disabled:cursor-not-allowed focus-ring"
                  aria-label="Choose custom color"
                />
              </div>
              <div className="flex items-center space-x-3">
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
                  className="input-field flex-1 text-code"
                  aria-label="Custom color hex value"
                />
                <div
                  className="w-10 h-10 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 shadow-soft"
                  style={{ backgroundColor: customColor }}
                  aria-hidden="true"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Selection Display */}
      <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
        <span className="font-medium">Current:</span>{" "}
        {presetColors.find((color) => color.value === value)?.name ||
          (value === "transparent" ? "Transparent" : value)}
      </div>
    </div>
  );
}
