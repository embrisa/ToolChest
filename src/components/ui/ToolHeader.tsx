import React from "react";
import { cn } from "@/utils";

export interface ToolHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  iconText?: string;
  iconClassName?: string;
  className?: string;
}

export function ToolHeader({
  title,
  description,
  icon,
  iconText,
  iconClassName,
  className,
}: ToolHeaderProps) {
  return (
    <div className={cn("flex items-center gap-4 mb-6", className)}>
      <div
        className={cn(
          "h-14 w-14 rounded-2xl flex items-center justify-center",
          "bg-gradient-to-br from-brand-100 to-brand-200",
          "dark:from-brand-900/30 dark:to-brand-800/30",
          iconClassName,
        )}
      >
        {icon || (
          <span className="text-lg font-bold text-brand-700 dark:text-brand-300">
            {iconText || "?"}
          </span>
        )}
      </div>
      <div>
        <h2 className="text-title text-2xl font-semibold text-foreground mb-2">
          {title}
        </h2>
        <p className="text-body text-foreground-secondary">{description}</p>
      </div>
    </div>
  );
}
