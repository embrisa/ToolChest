import React from "react";
import { cn } from "@/utils";
import { FeatureCard, FeatureCardProps } from "./FeatureCard";

export interface FeatureGridProps {
    features: (FeatureCardProps & { id?: string | number })[];
    title?: string;
    description?: string;
    columns?: {
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    className?: string;
    animationDelay?: string;
}

export function FeatureGrid({
    features,
    title,
    description,
    columns = { sm: 1, md: 2, lg: 3, xl: 4 },
    className,
    animationDelay = "0.4s",
}: FeatureGridProps) {
    const getGridCols = () => {
        const colClasses = [];
        if (columns.sm) colClasses.push(`grid-cols-${columns.sm}`);
        if (columns.md) colClasses.push(`md:grid-cols-${columns.md}`);
        if (columns.lg) colClasses.push(`lg:grid-cols-${columns.lg}`);
        if (columns.xl) colClasses.push(`xl:grid-cols-${columns.xl}`);
        return colClasses.join(" ");
    };

    return (
        <div
            className={cn("animate-fade-in-up", className)}
            style={{ animationDelay }}
        >
            {(title || description) && (
                <div className="text-center mb-8">
                    {title && (
                        <h2 className="text-title text-2xl sm:text-3xl font-semibold text-foreground mb-4">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="text-body text-foreground-secondary max-w-2xl mx-auto leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            )}

            <div className={cn("grid gap-6", getGridCols())}>
                {features.map((feature, index) => (
                    <FeatureCard
                        key={feature.id || index}
                        {...feature}
                        className={cn(feature.className)}
                    />
                ))}
            </div>
        </div>
    );
} 