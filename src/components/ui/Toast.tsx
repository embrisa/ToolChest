'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils';
import { ErrorNotification, ErrorSeverity } from '@/types/errors';
import {
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

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
    low: 'bg-blue-50 border-blue-200 text-blue-900',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    high: 'bg-orange-50 border-orange-200 text-orange-900',
    critical: 'bg-red-50 border-red-200 text-red-900',
};

const severityIconStyles = {
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-orange-500',
    critical: 'text-red-500',
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
        if (toastRef.current && notification.severity === 'critical') {
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
        if (event.key === 'Escape' && notification.dismissible) {
            handleDismiss();
        }
    };

    return (
        <div
            ref={toastRef}
            role="alert"
            aria-live={notification.severity === 'critical' ? 'assertive' : 'polite'}
            tabIndex={notification.severity === 'critical' ? 0 : -1}
            onKeyDown={handleKeyDown}
            className={cn(
                'relative w-full max-w-sm p-4 border rounded-lg shadow-lg',
                'transform transition-all duration-300 ease-in-out',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                severityStyles[notification.severity],
                isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            )}
        >
            <div className="flex items-start gap-3">
                <div className={cn('flex-shrink-0 mt-0.5', severityIconStyles[notification.severity])}>
                    <IconComponent className="w-5 h-5" aria-hidden="true" />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium mb-1">
                        {notification.title}
                    </h4>

                    <p className="text-sm opacity-90">
                        {notification.message}
                    </p>

                    {notification.actions && notification.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {notification.actions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAction(index)}
                                    className={cn(
                                        'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md',
                                        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                                        'transition-colors duration-200',
                                        action.variant === 'primary'
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : action.variant === 'destructive'
                                                ? 'bg-red-600 text-white hover:bg-red-700'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
                            'flex-shrink-0 p-1 rounded-md transition-colors duration-200',
                            'hover:bg-black hover:bg-opacity-10',
                            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                            severityIconStyles[notification.severity]
                        )}
                        aria-label="Dismiss notification"
                    >
                        <XMarkIcon className="w-4 h-4" aria-hidden="true" />
                    </button>
                )}
            </div>

            {/* Progress bar for auto-dismiss */}
            {!notification.persistent && notification.duration && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10 rounded-b-lg overflow-hidden">
                    <div
                        className="h-full bg-current opacity-30 transition-all ease-linear"
                        style={{
                            width: '100%',
                            animationName: 'toast-progress',
                            animationDuration: `${notification.duration}ms`,
                            animationTimingFunction: 'linear',
                            animationFillMode: 'forwards',
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
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    maxToasts?: number;
}

export function ToastContainer({
    notifications,
    onDismiss,
    onAction,
    position = 'top-right',
    maxToasts = 5,
}: ToastContainerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const positionStyles = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
        'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    };

    // Limit the number of toasts displayed
    const displayedNotifications = notifications.slice(0, maxToasts);

    return createPortal(
        <div
            className={cn(
                'fixed z-50 flex flex-col gap-2 pointer-events-none',
                positionStyles[position]
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
        document.body
    );
}

// Success toast helper
export function createSuccessToast(title: string, message: string, duration = 5000): ErrorNotification {
    return {
        id: `success-${Date.now()}-${Math.random()}`,
        type: 'toast',
        severity: 'low',
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
    actions?: ErrorNotification['actions'],
    persistent = false
): ErrorNotification {
    return {
        id: `error-${Date.now()}-${Math.random()}`,
        type: 'toast',
        severity: 'high',
        title,
        message,
        actions,
        dismissible: true,
        persistent,
        duration: persistent ? undefined : 8000,
    };
}

// Warning toast helper
export function createWarningToast(title: string, message: string, duration = 6000): ErrorNotification {
    return {
        id: `warning-${Date.now()}-${Math.random()}`,
        type: 'toast',
        severity: 'medium',
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
    actions?: ErrorNotification['actions']
): ErrorNotification {
    return {
        id: `critical-${Date.now()}-${Math.random()}`,
        type: 'toast',
        severity: 'critical',
        title,
        message,
        actions,
        dismissible: true,
        persistent: true, // Critical errors should persist
    };
} 