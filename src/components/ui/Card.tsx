import React, { HTMLAttributes } from "react";
import { cn } from "@/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "glass" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

const cardVariants = {
  default: "card",
  interactive: "card-interactive",
  glass: "card-glass",
  elevated: "surface-elevated",
};

const cardPadding = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  className,
  variant = "default",
  padding = "md",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        // Base styles with new design system
        "rounded-xl transition-all duration-200",
        // Variant styles from design system
        cardVariants[variant],
        // Padding styles
        cardPadding[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "border-b border-neutral-200/50 dark:border-neutral-700/50 pb-4 mb-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function CardTitle({
  className,
  children,
  as: Component = "h3",
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={cn(
        "text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardContent({
  className,
  children,
  ...props
}: CardContentProps) {
  return (
    <div
      className={cn(
        "text-body text-neutral-700 dark:text-neutral-300",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        "border-t border-neutral-200/50 dark:border-neutral-700/50 pt-4 mt-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
