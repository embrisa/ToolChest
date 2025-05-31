import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    isRequired?: boolean;
    variant?: 'default' | 'error' | 'success';
}

const inputVariants = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    className,
    label,
    error,
    helperText,
    isRequired = false,
    variant = 'default',
    id,
    ...props
}, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const currentVariant = error ? 'error' : variant;

    return (
        <div className="space-y-1">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-gray-700"
                >
                    {label}
                    {isRequired && (
                        <span className="text-red-500 ml-1" aria-label="required">*</span>
                    )}
                </label>
            )}

            <input
                ref={ref}
                id={inputId}
                className={cn(
                    // Base styles
                    'block w-full px-3 py-2 border rounded-md shadow-sm',
                    'placeholder-gray-400 focus:outline-none focus:ring-1',
                    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                    'transition-colors duration-200',
                    // Variant styles
                    inputVariants[currentVariant],
                    className
                )}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={cn(
                    errorId,
                    helperId
                ).trim() || undefined}
                required={isRequired}
                {...props}
            />

            {error && (
                <p
                    id={errorId}
                    className="text-sm text-red-600"
                    role="alert"
                    aria-live="polite"
                >
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p
                    id={helperId}
                    className="text-sm text-gray-500"
                >
                    {helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input'; 