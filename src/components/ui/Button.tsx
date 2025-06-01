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
  ghost:
    "inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-neutral-600 " +
    "bg-transparent hover:bg-neutral-100 rounded-lg transition-all duration-200 " +
    "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
  danger:
    "inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white " +
    "bg-error-500 hover:bg-error-600 rounded-lg shadow-lg transition-all duration-200 " +
    "focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2",
  outline:
    "inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-neutral-700 " +
    "bg-transparent border-2 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 " +
    "rounded-lg transition-all duration-200 " +
    "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
  gradient:
    "inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white " +
    "bg-gradient-to-r from-brand-500 via-accent-500 to-success-500 " +
    "hover:from-brand-600 hover:via-accent-600 hover:to-success-600 " +
    "rounded-lg shadow-glow hover:shadow-glow-accent transition-all duration-300 " +
    "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 " +
    "animate-gradient",
};

const buttonSizes = {
  sm: "px-4 py-2 text-sm min-h-[2.75rem]",
  md: "px-6 py-3 text-sm min-h-[3rem]",
  lg: "px-8 py-4 text-base min-h-[3.25rem]",
  xl: "px-10 py-5 text-lg min-h-[3.5rem]",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
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
  "aria-label": ariaLabel,
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
        "relative overflow-hidden font-medium rounded-lg",
        "transition-all duration-200 ease-out",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth && "w-full",
        isLoading && "cursor-wait",
        className,
      )}
      disabled={isDisabled}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      aria-label={ariaLabel || (isLoading ? `${loadingText}` : undefined)}
      {...props}
    >
      {renderContent()}
    </button>
  );
}
