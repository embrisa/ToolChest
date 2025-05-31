'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/utils';
import { PageTransitionProps } from '@/types/ui/loading';
interface ExtendedPageTransitionProps extends PageTransitionProps {
    variant?: 'bar' | 'circle' | 'dots' | 'fade';
    position?: 'top' | 'bottom' | 'fixed';
    color?: 'blue' | 'green' | 'purple' | 'red';
    speed?: 'slow' | 'normal' | 'fast';
}

const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    red: 'bg-red-600'
};

const speedClasses = {
    slow: 'duration-700',
    normal: 'duration-500',
    fast: 'duration-300'
};

// Simple announcement component for page transitions
function TransitionAnnouncement({ message }: { message: string }) {
    return (
        <div
            className="sr-only"
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            {message}
        </div>
    );
}

export function PageTransition({
    isLoading,
    progress = 0,
    message = 'Loading...',
    variant = 'bar',
    position = 'top',
    color = 'blue',
    speed = 'normal',
    className
}: ExtendedPageTransitionProps) {
    const [mounted, setMounted] = useState(false);
    const [announceMessage, setAnnounceMessage] = useState<string>('');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isLoading) {
            setAnnounceMessage(`Loading: ${message}`);
        } else {
            setAnnounceMessage('Page loaded');
        }
    }, [isLoading, message]);

    if (!mounted || !isLoading) {
        return null;
    }

    const progressValue = Math.min(Math.max(progress, 0), 100);

    if (variant === 'bar') {
        return (
            <>
                <div
                    className={cn(
                        'fixed z-50 h-1 transition-all ease-out',
                        colorClasses[color],
                        speedClasses[speed],
                        position === 'top' ? 'top-0 left-0 right-0' : 'bottom-0 left-0 right-0',
                        className
                    )}
                    style={{ width: `${progressValue}%` }}
                    role="progressbar"
                    aria-valuenow={progressValue}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Page loading: ${progressValue}%`}
                />
                <TransitionAnnouncement message={announceMessage} />
            </>
        );
    }

    if (variant === 'circle') {
        return (
            <>
                <div className={cn(
                    'fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm',
                    className
                )}>
                    <div className="relative">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                className="text-gray-200"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                                className={cn('transition-all duration-300', colorClasses[color].replace('bg-', 'text-'))}
                                strokeDasharray={`${progressValue * 1.76} 176`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                                {Math.round(progressValue)}%
                            </span>
                        </div>
                    </div>
                    <div className="absolute bottom-8 text-center">
                        <p className="text-sm text-gray-600">{message}</p>
                    </div>
                </div>
                <TransitionAnnouncement message={announceMessage} />
            </>
        );
    }

    if (variant === 'dots') {
        return (
            <>
                <div className={cn(
                    'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm',
                    className
                )}>
                    <div className="flex space-x-2 mb-4">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    'w-3 h-3 rounded-full animate-pulse',
                                    colorClasses[color]
                                )}
                                style={{
                                    animationDelay: `${i * 0.2}s`,
                                    animationDuration: '1s'
                                }}
                            />
                        ))}
                    </div>
                    <p className="text-sm text-gray-600">{message}</p>
                    {progress > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                            {Math.round(progressValue)}% complete
                        </p>
                    )}
                </div>
                <TransitionAnnouncement message={announceMessage} />
            </>
        );
    }

    if (variant === 'fade') {
        return (
            <>
                <div className={cn(
                    'fixed inset-0 z-50 bg-white/90 backdrop-blur-sm transition-opacity duration-300',
                    isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none',
                    className
                )}>
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className={cn(
                                'w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4',
                                `border-${color}-600`
                            )} />
                            <p className="text-sm text-gray-600">{message}</p>
                            {progress > 0 && (
                                <div className="mt-4 w-64 bg-gray-200 rounded-full h-2">
                                    <div
                                        className={cn('h-2 rounded-full transition-all duration-300', colorClasses[color])}
                                        style={{ width: `${progressValue}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <TransitionAnnouncement message={announceMessage} />
            </>
        );
    }

    return null;
}

// Hook for managing page transitions
export function usePageTransition() {
    const [state, setState] = useState({
        isLoading: false,
        progress: 0,
        message: 'Loading...'
    });

    const startTransition = (message?: string) => {
        setState({
            isLoading: true,
            progress: 0,
            message: message || 'Loading...'
        });
    };

    const updateProgress = (progress: number, message?: string) => {
        setState(prev => ({
            ...prev,
            progress,
            message: message || prev.message
        }));
    };

    const completeTransition = () => {
        setState(prev => ({ ...prev, progress: 100 }));

        // Small delay to show completion before hiding
        setTimeout(() => {
            setState({ isLoading: false, progress: 0, message: 'Loading...' });
        }, 200);
    };

    const cancelTransition = () => {
        setState({ isLoading: false, progress: 0, message: 'Loading...' });
    };

    return {
        ...state,
        startTransition,
        updateProgress,
        completeTransition,
        cancelTransition
    };
}

// Router integration hook (for use with Next.js router events)
export function useRouterTransition() {
    const transition = usePageTransition();

    useEffect(() => {
        const handleStart = () => {
            transition.startTransition('Navigating...');
        };

        const handleComplete = () => {
            transition.completeTransition();
        };

        const handleError = () => {
            transition.cancelTransition();
        };

        // Router events would be attached here in a real implementation
        // This is a simplified version for demonstration

        return () => {
            // Cleanup router event listeners
        };
    }, [transition]);

    return transition;
} 