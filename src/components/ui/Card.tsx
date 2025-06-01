import React, { HTMLAttributes } from "react";
import { cn } from "@/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

const cardVariants = {
  default: "card", // Uses .card class from globals.css: bg-neutral-50 rounded-lg shadow-soft border border-neutral-200
  interactive: "card-interactive", // Uses .card-interactive class: card + hover effects with scale and enhanced backgrounds
  elevated: "card bg-neutral-25 shadow-medium", // Enhanced elevation with brighter background
};

const cardPadding = {
  none: "",
  sm: "p-6", // 24px - following 8px grid system
  md: "p-8", // 32px - standard card padding from design philosophy
  lg: "p-10", // 40px - generous spacing for feature cards
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
        // Base transition for all card interactions
        "transition-all duration-200",
        // Variant styles using design system classes
        cardVariants[variant],
        // Padding following design philosophy spacing
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
        // Enhanced contrast border and proper spacing (design philosophy: 24px)
        "border-b border-neutral-200 pb-6 mb-8",
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
        // Using design system text utilities with enhanced contrast (9.2:1 ratio)
        "text-primary text-xl font-semibold",
        // Proper heading spacing from design philosophy
        "mb-4",
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
        // Using design system text utilities with enhanced contrast (7.1:1 ratio)
        "text-secondary",
        // Optimal line height for readability from design philosophy
        "leading-relaxed",
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
        // Enhanced contrast border and proper spacing (design philosophy: 24px)
        "border-t border-neutral-200 pt-6 mt-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
