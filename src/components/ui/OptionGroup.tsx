import React from "react";
import { cn } from "@/utils";
import { Button } from "./Button";

export interface OptionGroupOption {
  value: string;
  label: string;
  title?: string;
  disabled?: boolean;
}

export interface OptionGroupProps {
  label: string;
  value: string;
  options: OptionGroupOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  size?: "sm" | "md" | "lg";
}

export function OptionGroup({
  label,
  value,
  options,
  onChange,
  disabled = false,
  className,
  buttonClassName,
  size = "sm",
}: OptionGroupProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <label className="text-body font-medium text-foreground">{label}</label>
      <div className="flex gap-3">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? "primary" : "secondary"}
            size={size}
            onClick={() => !option.disabled && onChange(option.value)}
            aria-pressed={value === option.value}
            title={option.title}
            disabled={disabled || option.disabled}
            className={cn("flex-1 h-12", buttonClassName)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
