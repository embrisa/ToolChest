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
    "input-error border-error-500 focus:border-error-500 focus:ring-error-500/50",
  success:
    "input-field border-success-500 focus:border-success-500 focus:ring-success-500/50",
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
      <div className="form-group">
        {label && (
          <label htmlFor={inputId} className="form-label">
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
            // Base styles from design system
            inputVariants[currentVariant],
            // Focus ring utility
            "focus-ring",
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
            className="form-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="form-help">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
