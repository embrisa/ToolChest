"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils";
import { ErrorNotification, ErrorSeverity } from "@/types/errors";
import {
  XMarkIcon,
  CheckCircleIcon,
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
  low: "surface bg-brand-50/80 dark:bg-brand-950/80 border-brand-200 dark:border-brand-800 text-brand-900 dark:text-brand-100",
  medium:
    "surface bg-warning-50/80 dark:bg-warning-950/80 border-warning-200 dark:border-warning-800 text-warning-900 dark:text-warning-100",
  high: "surface bg-warning-50/80 dark:bg-warning-950/80 border-warning-200 dark:border-warning-800 text-warning-900 dark:text-warning-100",
  critical:
    "surface bg-error-50/80 dark:bg-error-950/80 border-error-200 dark:border-error-800 text-error-900 dark:text-error-100",
};

const severityIconStyles = {
  low: "text-brand-500",
  medium: "text-warning-500",
  high: "text-warning-500",
  critical: "text-error-500",
};

export function Toast({ notification, onDismiss, onAction }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  const IconComponent = severityIcons[notification.severity];

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Set up auto-dismiss timer
    if (!notification.persistent && notification.duration) {
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, notification.duration);
    }

    // Focus management for screen readers
    if (toastRef.current && notification.severity === "critical") {
      toastRef.current.focus();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [notification.duration, notification.persistent, notification.severity]);

  const handleDismiss = () => {
    if (!notification.dismissible) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300); // Match transition duration
  };

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
        "relative w-full max-w-sm p-6 rounded-xl shadow-large",
        "transform transition-all duration-300 ease-in-out",
        "focus-ring",
        severityStyles[notification.severity],
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0",
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex-shrink-0 mt-0.5",
            severityIconStyles[notification.severity],
          )}
        >
          <IconComponent className="w-5 h-5" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-title text-sm font-semibold mb-2">
            {notification.title}
          </h4>

          <p className="text-body text-sm opacity-90">{notification.message}</p>

          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleAction(index)}
                  className={cn(
                    "inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg",
                    "focus-ring transition-all duration-200",
                    action.variant === "primary"
                      ? "btn-primary text-xs px-3 py-1.5"
                      : action.variant === "destructive"
                        ? "btn-danger text-xs px-3 py-1.5"
                        : "btn-secondary text-xs px-3 py-1.5",
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {notification.dismissible && (
          <button
            onClick={handleDismiss}
            className={cn(
              "flex-shrink-0 p-1.5 rounded-lg transition-all duration-200",
              "hover:bg-black/10 dark:hover:bg-white/10",
              "focus-ring",
              severityIconStyles[notification.severity],
            )}
            aria-label="Dismiss notification"
          >
            <XMarkIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Progress bar for auto-dismiss */}
      {!notification.persistent && notification.duration && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-current opacity-40 transition-all ease-linear"
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

  const positionStyles = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
  };

  // Limit the number of toasts displayed
  const displayedNotifications = notifications.slice(0, maxToasts);

  return createPortal(
    <div
      className={cn(
        "fixed z-50 flex flex-col gap-2 pointer-events-none",
        positionStyles[position],
      )}
      role="region"
      aria-label="Notifications"
    >
      {displayedNotifications.map((notification) => (
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

// Success toast helper
export function createSuccessToast(
  title: string,
  message: string,
  duration = 5000,
): ErrorNotification {
  return {
    id: `success-${Date.now()}-${Math.random()}`,
    type: "toast",
    severity: "low",
    title,
    message,
    duration,
    dismissible: true,
  };
}

// Error toast helper
export function createErrorToast(
  title: string,
  message: string,
  actions?: ErrorNotification["actions"],
  persistent = false,
): ErrorNotification {
  return {
    id: `error-${Date.now()}-${Math.random()}`,
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

// Warning toast helper
export function createWarningToast(
  title: string,
  message: string,
  duration = 6000,
): ErrorNotification {
  return {
    id: `warning-${Date.now()}-${Math.random()}`,
    type: "toast",
    severity: "medium",
    title,
    message,
    duration,
    dismissible: true,
  };
}

// Critical error toast helper
export function createCriticalToast(
  title: string,
  message: string,
  actions?: ErrorNotification["actions"],
): ErrorNotification {
  return {
    id: `critical-${Date.now()}-${Math.random()}`,
    type: "toast",
    severity: "critical",
    title,
    message,
    actions,
    dismissible: true,
    persistent: true, // Critical errors should persist
  };
}
