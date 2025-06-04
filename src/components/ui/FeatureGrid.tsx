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
  compact?: boolean; // Manual compact mode override
  autoCompact?: boolean; // Auto-enable compact mode for > 4 features
}

export function FeatureGrid({
  features,
  title,
  description,
  columns,
  className,
  animationDelay = "0.4s",
  compact = false,
  autoCompact = true,
}: FeatureGridProps) {
  // Determine if we should use compact mode
  const shouldUseCompact = compact || (autoCompact && features.length > 4);

  // Auto-adjust columns based on feature count and compact mode
  const getDefaultColumns = () => {
    if (shouldUseCompact) {
      // For compact mode with many features, use more columns
      if (features.length > 6) {
        return { sm: 2, md: 3, lg: 4, xl: 6 };
      } else {
        return { sm: 1, md: 2, lg: 3, xl: 4 };
      }
    } else {
      // Standard layout for <= 4 features
      return { sm: 1, md: 2, lg: 3, xl: 4 };
    }
  };

  const finalColumns = columns || getDefaultColumns();

  const getGridCols = () => {
    const colClasses = [];
    if (finalColumns.sm) colClasses.push(`grid-cols-${finalColumns.sm}`);
    if (finalColumns.md) colClasses.push(`md:grid-cols-${finalColumns.md}`);
    if (finalColumns.lg) colClasses.push(`lg:grid-cols-${finalColumns.lg}`);
    if (finalColumns.xl) colClasses.push(`xl:grid-cols-${finalColumns.xl}`);
    return colClasses.join(" ");
  };

  // Adjust gap based on compact mode
  const gridGap = shouldUseCompact ? "gap-4" : "gap-6";

  return (
    <div
      className={cn("animate-fade-in-up", className)}
      style={{ animationDelay }}
    >
      {(title || description) && (
        <div className={cn("text-center", shouldUseCompact ? "mb-6" : "mb-8")}>
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

      <div className={cn("grid", gridGap, getGridCols())}>
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.id || index}
            {...feature}
            compact={shouldUseCompact}
            className={cn(feature.className)}
          />
        ))}
      </div>
    </div>
  );
}
