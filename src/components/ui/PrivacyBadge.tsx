import React from "react";
import { cn } from "@/utils";

export interface PrivacyBadgeProps {
    message?: string;
    iconColor?: string;
    textColor?: string;
    borderColor?: string;
    className?: string;
    animationDelay?: string;
}

export function PrivacyBadge({
    message = "🔒 Privacy-First • Client-Side Processing",
    iconColor = "bg-brand-500",
    textColor = "text-brand-700 dark:text-brand-300",
    borderColor = "border-brand-200/50 dark:border-brand-800/50",
    className,
    animationDelay = "0.2s",
}: PrivacyBadgeProps) {
    return (
        <div
            className={cn(
                "flex justify-center mb-8 animate-fade-in-up",
                className
            )}
            style={{ animationDelay }}
        >
            <div
                className={cn(
                    "bg-neutral-50 rounded-xl px-6 py-3 border backdrop-blur-sm shadow-soft",
                    borderColor
                )}
            >
                <div className="flex items-center gap-3 ">
                    <div
                        className={cn(
                            "w-2 h-2 rounded-full animate-pulse-gentle",
                            iconColor
                        )}
                    />
                    <span className={cn("text-sm font-medium", textColor)}>
                        {message}
                    </span>
                </div>
            </div>
        </div>
    );
} 