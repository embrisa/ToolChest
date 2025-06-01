import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  variant?: "default" | "error" | "success";
}

const inputVariants = {
  default: "input-field",
  error:
    "w-full px-4 py-3 text-sm bg-neutral-50 border-2 border-error-500 rounded-lg " +
    "text-neutral-700 placeholder:text-neutral-400 " +
    "focus:outline-none focus:ring-2 focus:ring-error-500 focus:border-error-500 " +
    "focus:bg-neutral-25 transition-all duration-200",
  success:
    "w-full px-4 py-3 text-sm bg-neutral-50 border-2 border-success-500 rounded-lg " +
    "text-neutral-700 placeholder:text-neutral-400 " +
    "focus:outline-none focus:ring-2 focus:ring-success-500 focus:border-success-500 " +
    "focus:bg-neutral-25 transition-all duration-200",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      isRequired = false,
      variant = "default",
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 11)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const currentVariant = error ? "error" : variant;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-primary mb-2"
          >
            {label}
            {isRequired && (
              <span
                className="text-error-500 ml-1 font-medium"
                aria-label="required"
              >
                *
              </span>
            )}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            // Base styles using design system
            inputVariants[currentVariant],
            // Ensure minimum touch target height (44px+)
            "min-h-[2.75rem]",
            className,
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={cn(errorId, helperId).trim() || undefined}
          required={isRequired}
          {...props}
        />

        {error && (
          <p
            id={errorId}
            className="mt-2 text-sm text-error-600 flex items-start gap-1"
            role="alert"
            aria-live="polite"
          >
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </p>
        )}

        {helperText && !error && (
          <p
            id={helperId}
            className="mt-2 text-sm text-secondary"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
