"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils";
import { ErrorNotification } from "@/types/errors";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface ToastProps {
  notification: ErrorNotification;
  onDismiss: (id: string) => void;
  onAction?: (id: string, actionIndex: number) => void;
}

const severityIcons = {
  low: InformationCircleIcon,
  medium: ExclamationTriangleIcon,
  high: ExclamationTriangleIcon,
  critical: XCircleIcon,
};

const severityStyles = {
  low: "bg-brand-50 border-brand-200 text-brand-900 shadow-colored",
  medium: "bg-warning-50 border-warning-200 text-warning-900 shadow-medium",
  high: "bg-warning-50 border-warning-200 text-warning-900 shadow-medium",
  critical: "bg-error-50 border-error-200 text-error-900 shadow-large",
};

const severityIconStyles = {
  low: "text-brand-600",
  medium: "text-warning-600",
  high: "text-warning-600",
  critical: "text-error-600",
};

export function Toast({ notification, onDismiss, onAction }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  const IconComponent = severityIcons[notification.severity];

  const handleDismiss = useCallback(() => {
    if (!notification.dismissible) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300); // Match transition duration
  }, [notification.dismissible, notification.id, onDismiss]);

  useEffect(() => {
    // Animate in with delay for better user experience
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    // Set up auto-dismiss timer with enhanced timing
    if (!notification.persistent && notification.duration) {
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, notification.duration);
    }

    // Enhanced focus management for screen readers
    if (toastRef.current && notification.severity === "critical") {
      // Small delay to ensure toast is rendered before focusing
      setTimeout(() => {
        toastRef.current?.focus();
      }, 100);
    }

    return () => {
      clearTimeout(showTimer);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    notification.duration,
    notification.persistent,
    notification.severity,
    handleDismiss,
  ]);

  const handleAction = (actionIndex: number) => {
    notification.actions?.[actionIndex]?.action();
    onAction?.(notification.id, actionIndex);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" && notification.dismissible) {
      handleDismiss();
    }
  };

  return (
    <div
      ref={toastRef}
      role="alert"
      aria-live={notification.severity === "critical" ? "assertive" : "polite"}
      tabIndex={notification.severity === "critical" ? 0 : -1}
      onKeyDown={handleKeyDown}
      className={cn(
        // Enhanced light mode styling with proper elevation
        "relative w-full max-w-sm p-6 lg:p-8 rounded-xl border",
        // Improved animation with better easing
        "transform transition-all duration-300 ease-out",
        // Enhanced focus styling for accessibility
        "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
        // Dynamic styling based on severity
        severityStyles[notification.severity],
        // Animation states with improved transforms
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95",
      )}
    >
      <div className="flex items-start gap-4">
        {/* Enhanced icon with better sizing and positioning */}
        <div
          className={cn(
            "flex-shrink-0 mt-1",
            severityIconStyles[notification.severity],
          )}
        >
          <IconComponent className="w-6 h-6" aria-hidden="true" />
        </div>

        {/* Enhanced content area with better typography */}
        <div className="flex-1 min-w-0">
          <h4 className="text-body font-semibold mb-3 leading-snug">
            {notification.title}
          </h4>

          <p className="text-small leading-relaxed opacity-90 mb-0">
            {notification.message}
          </p>

          {/* Enhanced action buttons with better spacing */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleAction(index)}
                  className={cn(
                    // Base button styling with enhanced spacing
                    "inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg",
                    // Enhanced focus styling
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200",
                    // Improved touch targets
                    "touch-target-min",
                    // Variant styling with light mode optimization
                    action.variant === "primary"
                      ? "bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-500 shadow-medium"
                      : action.variant === "destructive"
                        ? "bg-error-600 hover:bg-error-700 text-white focus:ring-error-500 shadow-medium"
                        : "bg-neutral-100 hover:bg-neutral-150 text-neutral-700 focus:ring-neutral-400 shadow-soft",
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced dismiss button with better accessibility */}
        {notification.dismissible && (
          <button
            onClick={handleDismiss}
            className={cn(
              // Enhanced button styling with proper sizing
              "flex-shrink-0 p-2 rounded-lg transition-all duration-200",
              // Improved hover states for light mode
              "hover:bg-black/5 active:bg-black/10",
              // Enhanced focus styling
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              // Color based on severity
              severityIconStyles[notification.severity],
              // Enhanced touch target
              "touch-target-min",
            )}
            aria-label="Dismiss notification"
          >
            <XMarkIcon className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Enhanced progress bar with better styling */}
      {!notification.persistent && notification.duration && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/5 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-current opacity-30 transition-all ease-linear rounded-b-xl"
            style={{
              width: "100%",
              animationName: "toast-progress",
              animationDuration: `${notification.duration}ms`,
              animationTimingFunction: "linear",
              animationFillMode: "forwards",
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

interface ToastContainerProps {
  notifications: ErrorNotification[];
  onDismiss: (id: string) => void;
  onAction?: (id: string, actionIndex: number) => void;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  maxToasts?: number;
}

export function ToastContainer({
  notifications,
  onDismiss,
  onAction,
  position = "top-right",
  maxToasts = 5,
}: ToastContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Enhanced positioning with better responsive spacing
  const positionStyles = {
    "top-right": "top-6 right-6 lg:top-8 lg:right-8",
    "top-left": "top-6 left-6 lg:top-8 lg:left-8",
    "bottom-right": "bottom-6 right-6 lg:bottom-8 lg:right-8",
    "bottom-left": "bottom-6 left-6 lg:bottom-8 lg:left-8",
    "top-center": "top-6 left-1/2 transform -translate-x-1/2 lg:top-8",
    "bottom-center": "bottom-6 left-1/2 transform -translate-x-1/2 lg:bottom-8",
  };

  // Limit the number of toasts displayed and prioritize by severity
  const sortedNotifications = [...notifications]
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, maxToasts);

  return createPortal(
    <div
      className={cn(
        // Enhanced container with better spacing
        "fixed z-50 flex flex-col gap-4 pointer-events-none",
        // Enhanced max width for better mobile experience
        "max-w-sm w-full px-4 sm:px-0",
        positionStyles[position],
      )}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {sortedNotifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Toast
            notification={notification}
            onDismiss={onDismiss}
            onAction={onAction}
          />
        </div>
      ))}
    </div>,
    document.body,
  );
}

// Enhanced toast helper functions with better error handling
export function createSuccessToast(
  title: string,
  message: string,
  duration = 5000,
): ErrorNotification {
  return {
    id: `success-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: "toast",
    severity: "low",
    title,
    message,
    duration,
    dismissible: true,
  };
}

export function createErrorToast(
  title: string,
  message: string,
  actions?: ErrorNotification["actions"],
  persistent = false,
): ErrorNotification {
  return {
    id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: "toast",
    severity: "high",
    title,
    message,
    actions,
    dismissible: true,
    persistent,
    duration: persistent ? undefined : 8000,
  };
}

export function createWarningToast(
  title: string,
  message: string,
  duration = 6000,
): ErrorNotification {
  return {
    id: `warning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: "toast",
    severity: "medium",
    title,
    message,
    duration,
    dismissible: true,
  };
}

export function createCriticalToast(
  title: string,
  message: string,
  actions?: ErrorNotification["actions"],
): ErrorNotification {
  return {
    id: `critical-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: "toast",
    severity: "critical",
    title,
    message,
    actions,
    dismissible: true,
    persistent: true, // Critical errors should persist
  };
}

// Enhanced toast hook for better state management
export function useToast() {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);

  const addToast = useCallback((notification: ErrorNotification) => {
    setNotifications((prev) => [...prev, notification]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Enhanced helper methods
  const toast = {
    success: (title: string, message: string, duration?: number) =>
      addToast(createSuccessToast(title, message, duration)),

    error: (
      title: string,
      message: string,
      actions?: ErrorNotification["actions"],
      persistent?: boolean,
    ) => addToast(createErrorToast(title, message, actions, persistent)),

    warning: (title: string, message: string, duration?: number) =>
      addToast(createWarningToast(title, message, duration)),

    critical: (
      title: string,
      message: string,
      actions?: ErrorNotification["actions"],
    ) => addToast(createCriticalToast(title, message, actions)),
  };

  return {
    notifications,
    addToast,
    removeToast,
    clearAll,
    toast,
  };
}
