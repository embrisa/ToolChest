"use client";

import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "ghost"
    | "danger"
    | "outline"
    | "gradient";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  outline:
    "border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600",
  gradient:
    "bg-gradient-to-r from-brand-500 via-accent-500 to-success-500 hover:from-brand-600 hover:via-accent-600 hover:to-success-600 text-white shadow-glow hover:shadow-glow-accent transition-all duration-300 animate-gradient",
};

const buttonSizes = {
  sm: "px-3 py-1.5 text-sm h-8",
  md: "px-4 py-2 text-sm h-10",
  lg: "px-6 py-3 text-base h-12",
  xl: "px-8 py-4 text-lg h-14",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-4 h-4",
  lg: "w-5 h-5",
  xl: "w-6 h-6",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText = "Loading...",
  icon,
  iconPosition = "left",
  fullWidth = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const LoadingSpinner = () => (
    <svg
      className={cn("animate-spin", iconSizes[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <LoadingSpinner />
          <span className="sr-only">Loading: </span>
          <span className="ml-2">{loadingText}</span>
        </>
      );
    }

    if (icon && iconPosition === "left") {
      return (
        <>
          <span
            className={cn(iconSizes[size], "flex-shrink-0")}
            aria-hidden="true"
          >
            {icon}
          </span>
          <span className="ml-2">{children}</span>
        </>
      );
    }

    if (icon && iconPosition === "right") {
      return (
        <>
          <span>{children}</span>
          <span
            className={cn(iconSizes[size], "flex-shrink-0 ml-2")}
            aria-hidden="true"
          >
            {icon}
          </span>
        </>
      );
    }

    return children;
  };

  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center font-medium rounded-xl",
        "transition-all duration-200 ease-out",
        "focus-ring",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        "relative overflow-hidden",
        // Variant styles
        buttonVariants[variant],
        // Size styles
        buttonSizes[size],
        // Full width
        fullWidth && "w-full",
        // Loading state
        isLoading && "cursor-wait",
        className,
      )}
      disabled={isDisabled}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      {...props}
    >
      {renderContent()}
    </button>
  );
}
