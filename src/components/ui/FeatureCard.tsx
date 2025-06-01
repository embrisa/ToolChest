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
}

export function FeatureCard({
    title,
    description,
    icon,
    iconBg = "bg-gradient-to-br from-brand-500 to-brand-600",
    badge,
    className,
    hoverEffect = true,
}: FeatureCardProps) {
    return (
        <Card
            variant="interactive"
            padding="md"
            className={cn(
                "group",
                hoverEffect && "hover:shadow-colored transition-all duration-300",
                className
            )}
        >
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div
                            className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                iconBg
                            )}
                        >
                            {icon}
                        </div>
                    )}
                    <div className="flex-1">
                        <h3 className="text-heading font-semibold text-foreground mb-1">
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
                <p className="text-sm text-foreground-secondary leading-relaxed">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
} 