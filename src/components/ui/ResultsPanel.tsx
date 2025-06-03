import React from "react";
import { cn } from "@/utils";
import { Button } from "./Button";
import { Card, CardHeader, CardContent } from "./Card";

export interface ResultMetadata {
    label: string;
    value: string | number;
    format?: (value: string | number) => string;
}

export interface ResultsPanelProps {
    title: string;
    result?: string;
    isProcessing?: boolean;
    onCopy?: () => void;
    onDownload?: () => void;
    copySuccess?: boolean;
    copyLabel?: string;
    downloadLabel?: string;
    placeholder?: string;
    metadata?: ResultMetadata[];
    badges?: React.ReactNode[];
    children?: React.ReactNode;
    className?: string;
    resultClassName?: string;
    readOnly?: boolean;
    rows?: number;
    showTextarea?: boolean;
    variant?: "text" | "file" | "mixed";
    description?: string;
}

export function ResultsPanel({
    title,
    result,
    isProcessing = false,
    onCopy,
    onDownload,
    copySuccess = false,
    copyLabel = "Copy",
    downloadLabel = "Download",
    placeholder,
    metadata = [],
    badges = [],
    children,
    className,
    resultClassName,
    readOnly = true,
    rows = 6,
    showTextarea,
    variant = "text",
    description,
}: ResultsPanelProps) {
    // For file variants, consider the result "available" if we have metadata or badges (indicating successful operation)
    // For other variants, use the traditional result text check
    const hasResult = variant === "file"
        ? Boolean(metadata?.length > 0 || badges?.length > 0)
        : Boolean(result);
    const hasActions = Boolean(onCopy || onDownload);

    // Auto-determine showTextarea based on variant if not explicitly set
    const shouldShowTextarea = showTextarea !== undefined
        ? showTextarea
        : variant === "text" || variant === "mixed";

    const defaultPlaceholder = placeholder || (
        isProcessing
            ? "Processing..."
            : variant === "file"
                ? "File generation result will appear here..."
                : "Result will appear here..."
    );

    return (
        <Card variant="elevated" className={cn("animate-fade-in-up", className)}>
            <CardHeader className={cn("pb-8", variant === "file" && "pb-6")}>
                <div className={cn(
                    "flex items-center justify-between",
                    variant === "file" && "flex-col sm:flex-row gap-4 sm:gap-0"
                )}>
                    <div className={cn(variant === "file" && "text-center sm:text-left")}>
                        <h2 className="text-title text-xl font-semibold text-foreground mb-3">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-body text-foreground-secondary mb-3">
                                {description}
                            </p>
                        )}
                        {hasResult && (metadata.length > 0 || badges.length > 0) && (
                            <div className={cn(
                                "flex flex-wrap items-center gap-6 text-sm text-foreground-secondary",
                                variant === "file" && "justify-center sm:justify-start gap-4"
                            )}>
                                {metadata.map((item, index) => (
                                    <span key={index} className={cn(
                                        variant === "file" && "bg-neutral-50 dark:bg-neutral-900/20 px-3 py-1 rounded-lg"
                                    )}>
                                        <span className="font-medium text-foreground">{item.label}:</span>{" "}
                                        {item.format ? item.format(item.value) : item.value}
                                    </span>
                                ))}
                                {badges.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {badges.map((badge, index) => (
                                            <React.Fragment key={`badge-${index}`}>{badge}</React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {!hasResult && !isProcessing && (
                            <p className="text-body text-foreground-secondary">
                                {defaultPlaceholder}
                            </p>
                        )}
                    </div>
                    {hasActions && (
                        <div className={cn(
                            "flex gap-3",
                            variant === "file" && "mt-4 sm:mt-0 w-full sm:w-auto justify-center sm:justify-end"
                        )}>
                            {onCopy && (
                                <Button
                                    variant="secondary"
                                    size={variant === "file" ? "lg" : "sm"}
                                    onClick={onCopy}
                                    disabled={!hasResult}
                                    aria-label="Copy result to clipboard"
                                    className={cn(
                                        variant === "file" ? "h-12 px-6" : "h-10",
                                        copySuccess && "bg-success-100 text-success-800 dark:bg-success-950/40 dark:text-success-200"
                                    )}
                                >
                                    {copySuccess ? "Copied!" : copyLabel}
                                </Button>
                            )}
                            {onDownload && (
                                <Button
                                    variant={variant === "file" ? "primary" : "secondary"}
                                    size={variant === "file" ? "lg" : "sm"}
                                    onClick={onDownload}
                                    disabled={!hasResult}
                                    aria-label="Download result as file"
                                    className={variant === "file" ? "h-12 px-6" : "h-10"}
                                >
                                    {downloadLabel}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>
            {(shouldShowTextarea || children) && (
                <CardContent className="pt-0">
                    <div className={cn(
                        "space-y-6",
                        variant === "file" && "space-y-4"
                    )}>
                        {shouldShowTextarea && (
                            <textarea
                                value={result || ""}
                                readOnly={readOnly}
                                placeholder={defaultPlaceholder}
                                rows={rows}
                                className={cn(
                                    "input-field resize-vertical text-code bg-background-tertiary",
                                    hasResult ? "cursor-text select-all" : "cursor-default",
                                    !hasResult && "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                                    resultClassName
                                )}
                                aria-label="Result output"
                            />
                        )}
                        {children}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

// Utility component for metadata badges
export function ResultBadge({
    children,
    variant = "default",
    className,
}: {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "info";
    className?: string;
}) {
    const variants = {
        default: "bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-200",
        success: "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-200",
        warning: "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-200",
        info: "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium",
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
} 