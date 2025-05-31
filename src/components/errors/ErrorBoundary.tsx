'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorBoundaryState, ErrorContext } from '@/types/errors';
import { ErrorPage } from './ErrorPage';
import { generateErrorId } from '@/utils/errors';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
    context?: Partial<ErrorContext>;
    canRecover?: boolean;
    showTechnicalDetails?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    private errorId: string | null = null;

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            canRecover: props.canRecover ?? true,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.errorId = generateErrorId();

        this.setState({
            error,
            errorInfo: {
                componentStack: errorInfo.componentStack || '',
            },
            errorId: this.errorId || undefined,
        });

        // Call onError callback if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo, this.errorId);
        }

        // Log error for debugging
        console.error('ErrorBoundary caught an error:', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            errorId: this.errorId,
            context: this.props.context,
        });

        // Log to external service in production
        if (process.env.NODE_ENV === 'production') {
            this.logError(error, errorInfo);
        }
    }

    private logError = async (error: Error, errorInfo: ErrorInfo) => {
        try {
            const errorData = {
                errorId: this.errorId,
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                context: this.props.context,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                },
            };

            // Send to logging endpoint
            await fetch('/api/errors/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(errorData),
            });
        } catch (loggingError) {
            console.error('Failed to log error:', loggingError);
        }
    };

    private handleRetry = () => {
        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
            errorId: undefined,
        });
        this.errorId = null;
    };

    private handleRefresh = () => {
        window.location.reload();
    };

    private handleNavigateHome = () => {
        window.location.href = '/';
    };

    private handleNavigateBack = () => {
        window.history.back();
    };

    private handleContactSupport = () => {
        const subject = encodeURIComponent(`Error Report - ${this.errorId || 'Unknown'}`);
        const body = encodeURIComponent(
            `Error ID: ${this.errorId || 'Unknown'}\n` +
            `Time: ${new Date().toISOString()}\n` +
            `URL: ${window.location.href}\n` +
            `Error: ${this.state.error?.message || 'Unknown error'}\n\n` +
            `Please describe what you were doing when this error occurred:\n\n`
        );
        window.location.href = `mailto:support@toolchest.app?subject=${subject}&body=${body}`;
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error page
            return (
                <ErrorPage
                    statusCode={500}
                    title="Something went wrong"
                    message="An unexpected error occurred"
                    description="We're sorry, but something went wrong while rendering this page. Our team has been notified and is working to resolve the issue."
                    suggestions={[
                        'Try refreshing the page',
                        'Go back to the previous page',
                        'Return to the home page',
                        'Contact support if the problem persists'
                    ]}
                    recoveryActions={[
                        {
                            type: 'retry',
                            label: 'Try Again',
                            onClick: this.handleRetry,
                        },
                        {
                            type: 'refresh',
                            label: 'Refresh Page',
                            onClick: this.handleRefresh,
                        },
                        {
                            type: 'navigate_back',
                            label: 'Go Back',
                            onClick: this.handleNavigateBack,
                        },
                        {
                            type: 'navigate_home',
                            label: 'Go to Home',
                            onClick: this.handleNavigateHome,
                        },
                        {
                            type: 'contact_support',
                            label: 'Contact Support',
                            onClick: this.handleContactSupport,
                        },
                    ]}
                    showContactSupport={true}
                    showTechnicalDetails={this.props.showTechnicalDetails ?? process.env.NODE_ENV === 'development'}
                    technicalDetails={{
                        errorId: this.errorId || undefined,
                        timestamp: new Date().toISOString(),
                        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
                        path: typeof window !== 'undefined' ? window.location.pathname : undefined,
                    }}
                />
            );
        }

        return this.props.children;
    }
}

// Hook version for functional components
export function useErrorBoundary() {
    const [error, setError] = React.useState<Error | null>(null);

    const resetError = React.useCallback(() => {
        setError(null);
    }, []);

    const captureError = React.useCallback((error: Error) => {
        setError(error);
    }, []);

    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    return {
        error,
        resetError,
        captureError,
    };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    errorBoundaryConfig?: Omit<ErrorBoundaryProps, 'children'>
) {
    const WithErrorBoundaryComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryConfig}>
            <WrappedComponent {...props} />
        </ErrorBoundary>
    );

    WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'
        })`;

    return WithErrorBoundaryComponent;
} 