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
}: ResultsPanelProps) {
    const hasResult = Boolean(result);
    const hasActions = Boolean(onCopy || onDownload);

    const defaultPlaceholder = placeholder || (
        isProcessing
            ? "Processing..."
            : "Result will appear here..."
    );

    return (
        <Card variant="elevated" className={cn("animate-fade-in-up", className)}>
            <CardHeader className="pb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-title text-xl font-semibold text-foreground mb-3">
                            {title}
                        </h2>
                        {hasResult && metadata.length > 0 && (
                            <div className="flex flex-wrap items-center gap-6 text-sm text-foreground-secondary">
                                {metadata.map((item, index) => (
                                    <span key={index}>
                                        {item.label}: {item.format ? item.format(item.value) : item.value}
                                    </span>
                                ))}
                                {badges.map((badge, index) => (
                                    <React.Fragment key={`badge-${index}`}>{badge}</React.Fragment>
                                ))}
                            </div>
                        )}
                        {!hasResult && (
                            <p className="text-body text-foreground-secondary">
                                {defaultPlaceholder}
                            </p>
                        )}
                    </div>
                    {hasActions && (
                        <div className="flex gap-3">
                            {onCopy && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={onCopy}
                                    disabled={!hasResult}
                                    aria-label="Copy result to clipboard"
                                    className={cn(
                                        "h-10",
                                        copySuccess && "bg-success-100 text-success-800 dark:bg-success-950/40 dark:text-success-200"
                                    )}
                                >
                                    {copySuccess ? "Copied!" : copyLabel}
                                </Button>
                            )}
                            {onDownload && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={onDownload}
                                    disabled={!hasResult}
                                    aria-label="Download result as file"
                                    className="h-10"
                                >
                                    {downloadLabel}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-6">
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
                    {children}
                </div>
            </CardContent>
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