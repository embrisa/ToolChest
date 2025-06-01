"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/utils";

export interface FileUploadProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    maxSize?: number; // in MB
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
    title?: string;
    subtitle?: string;
    multiple?: boolean;
}

const defaultIcon = (
    <svg
        className="h-10 w-10 text-brand-600 dark:text-brand-400"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
    >
        <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export function FileUpload({
    onFileSelect,
    accept,
    maxSize = 10,
    disabled = false,
    className,
    icon = defaultIcon,
    title = "Click to upload",
    subtitle,
    multiple = false,
}: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            if (disabled) return;

            const files = e.dataTransfer.files;
            if (files && files[0]) {
                onFileSelect(files[0]);
            }
        },
        [onFileSelect, disabled]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (disabled) return;

            const files = e.target.files;
            if (files && files[0]) {
                onFileSelect(files[0]);
            }
        },
        [onFileSelect, disabled]
    );

    const defaultSubtitle = subtitle || `Maximum file size: ${maxSize}MB`;

    return (
        <div
            className={cn(
                "relative border-2 border-dashed rounded-2xl p-12 text-center",
                "transition-all duration-300 group",
                dragActive
                    ? "border-brand-400 bg-brand-50 dark:border-brand-500 dark:bg-brand-950/20"
                    : "border-neutral-300 dark:border-neutral-600 hover:border-brand-300 dark:hover:border-brand-600",
                disabled && "opacity-50 pointer-events-none",
                className
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInput}
                accept={accept}
                multiple={multiple}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="File upload input"
                disabled={disabled}
            />

            <div className="space-y-6">
                <div
                    className={cn(
                        "mx-auto h-20 w-20 rounded-full flex items-center justify-center",
                        "bg-gradient-to-br from-brand-100 to-brand-200",
                        "dark:from-brand-900/30 dark:to-brand-800/30",
                        "transition-transform duration-200 group-hover:scale-110"
                    )}
                >
                    {icon}
                </div>
                <div>
                    <p className="text-body text-foreground-secondary mb-2">
                        <span className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 cursor-pointer">
                            {title}
                        </span>{" "}
                        or drag and drop
                    </p>
                    <p className="text-sm text-foreground-tertiary">{defaultSubtitle}</p>
                </div>
            </div>
        </div>
    );
} 