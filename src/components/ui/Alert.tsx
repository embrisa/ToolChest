import React from "react";
import { cn } from "@/utils";

export interface AlertProps {
    variant?: "error" | "warning" | "success" | "info";
    title?: string;
    children: React.ReactNode;
    className?: string;
    icon?: React.ReactNode;
}

const alertVariants = {
    error: {
        container: "bg-error-100 border-error-200 dark:bg-error-950/40 dark:border-error-800",
        title: "text-error-800 dark:text-error-200",
        content: "text-error-800 dark:text-error-200",
        defaultIcon: (
            <svg
                className="h-6 w-6 text-error-500"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                />
            </svg>
        ),
    },
    warning: {
        container: "bg-warning-100 border-warning-200 dark:bg-warning-950/40 dark:border-warning-800",
        title: "text-warning-800 dark:text-warning-200",
        content: "text-warning-800 dark:text-warning-200",
        defaultIcon: (
            <svg
                className="h-6 w-6 text-warning-500"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                />
            </svg>
        ),
    },
    success: {
        container: "bg-success-100 border-success-200 dark:bg-success-950/40 dark:border-success-800",
        title: "text-success-800 dark:text-success-200",
        content: "text-success-800 dark:text-success-200",
        defaultIcon: (
            <svg
                className="h-6 w-6 text-success-500"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                />
            </svg>
        ),
    },
    info: {
        container: "bg-brand-100 border-brand-200 dark:bg-brand-950/40 dark:border-brand-800",
        title: "text-brand-800 dark:text-brand-200",
        content: "text-brand-800 dark:text-brand-200",
        defaultIcon: (
            <svg
                className="h-6 w-6 text-brand-500"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                />
            </svg>
        ),
    },
};

export function Alert({
    variant = "info",
    title,
    children,
    className,
    icon,
}: AlertProps) {
    const variantStyles = alertVariants[variant];
    const displayIcon = icon || variantStyles.defaultIcon;

    return (
        <div
            className={cn(
                "p-6 rounded-2xl border animate-fade-in-up",
                variantStyles.container,
                className
            )}
        >
            <div className="flex gap-4">
                <div className="flex-shrink-0">{displayIcon}</div>
                <div className="min-w-0 flex-1">
                    {title && (
                        <h3 className={cn("text-body font-semibold mb-3", variantStyles.title)}>
                            {title}
                        </h3>
                    )}
                    <div className={cn("text-body", variantStyles.content)}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AlertList({ items, variant: _variant }: { items: string[]; variant?: AlertProps["variant"] }) {
    return (
        <ul className="list-disc list-inside space-y-2">
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    );
} 