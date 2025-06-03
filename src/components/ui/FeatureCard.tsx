import React from "react";
import { cn } from "@/utils";
import { Card, CardContent } from "./Card";

export interface FeatureCardProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    iconBg?: string;
    badge?: {
        text: string;
        className?: string;
    };
    className?: string;
    hoverEffect?: boolean;
    compact?: boolean;
}

export function FeatureCard({
    title,
    description,
    icon,
    iconBg = "bg-gradient-to-br from-brand-500 to-brand-600",
    badge,
    className,
    hoverEffect = true,
    compact = false,
}: FeatureCardProps) {
    return (
        <Card
            variant="interactive"
            padding={compact ? "sm" : "md"}
            className={cn(
                "group",
                hoverEffect && "hover:shadow-colored transition-all duration-300",
                className
            )}
        >
            <CardContent className={compact ? "space-y-2" : "space-y-4"}>
                <div className="flex items-center gap-3">
                    {icon && (
                        <div
                            className={cn(
                                "rounded-lg flex items-center justify-center flex-shrink-0",
                                compact ? "w-8 h-8" : "w-10 h-10",
                                // Only apply background color if icon is not a string (emoji)
                                typeof icon === 'string' ? "bg-transparent" : iconBg
                            )}
                        >
                            <div className={cn(
                                typeof icon === 'string'
                                    ? compact ? "text-lg" : "text-xl"
                                    : compact ? "scale-75" : ""
                            )}>
                                {icon}
                            </div>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className={cn(
                            "font-semibold text-foreground",
                            compact ? "text-sm mb-0.5" : "text-heading mb-1"
                        )}>
                            {title}
                        </h3>
                        {badge && (
                            <span
                                className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                                    badge.className ||
                                    "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400"
                                )}
                            >
                                {badge.text}
                            </span>
                        )}
                    </div>
                </div>
                <p className={cn(
                    "text-foreground-secondary leading-relaxed",
                    compact ? "text-xs" : "text-sm"
                )}>
                    {description}
                </p>
            </CardContent>
        </Card>
    );
} 