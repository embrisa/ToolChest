import React from "react";
import { cn } from "@/utils";

export interface ToolPageHeroProps {
    title: string;
    description: React.ReactNode;
    icon?: React.ReactNode;
    iconText?: string;
    iconClassName?: string;
    titleClassName?: string;
    className?: string;
}

export function ToolPageHero({
    title,
    description,
    icon,
    iconText,
    iconClassName = "bg-gradient-to-br from-brand-500 to-brand-600",
    titleClassName = "text-gradient-brand",
    className,
}: ToolPageHeroProps) {
    return (
        <div className={cn("text-center mb-12 animate-fade-in-up", className)}>
            <div
                className={cn(
                    "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-colored",
                    iconClassName
                )}
            >
                {icon || (
                    <span
                        className="text-2xl font-bold text-white"
                        aria-hidden="true"
                    >
                        {iconText || title.charAt(0)}
                    </span>
                )}
            </div>

            <h1
                className={cn(
                    "text-display text-4xl sm:text-5xl lg:text-6xl mb-6",
                    titleClassName
                )}
            >
                {title}
            </h1>

            <p className="text-body text-lg sm:text-xl text-foreground-secondary max-w-3xl mx-auto leading-relaxed">
                {description}
            </p>
        </div>
    );
} 