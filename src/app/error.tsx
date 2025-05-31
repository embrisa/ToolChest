'use client';

import { useEffect } from 'react';
import { ErrorPage } from '@/components/errors';
import { generateErrorId, logError } from '@/utils/errors';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log the error
        logError(error, {
            component: 'GlobalErrorPage',
            digest: error.digest,
        });
    }, [error]);

    const errorId = generateErrorId();

    return (
        <ErrorPage
            statusCode={500}
            title="Something went wrong"
            message="An unexpected error occurred"
            description="We're sorry, but something went wrong while loading this page. Our team has been notified and is working to resolve the issue."
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
                    onClick: reset,
                },
                {
                    type: 'refresh',
                    label: 'Refresh Page',
                    onClick: () => window.location.reload(),
                },
                {
                    type: 'navigate_back',
                    label: 'Go Back',
                    onClick: () => window.history.back(),
                },
                {
                    type: 'navigate_home',
                    label: 'Go to Home',
                    onClick: () => window.location.href = '/',
                },
                {
                    type: 'contact_support',
                    label: 'Contact Support',
                    onClick: () => {
                        const subject = encodeURIComponent(`Error Report - ${errorId}`);
                        const body = encodeURIComponent(
                            `Error ID: ${errorId}\n` +
                            `Time: ${new Date().toISOString()}\n` +
                            `URL: ${window.location.href}\n` +
                            `Error: ${error.message}\n\n` +
                            `Please describe what you were doing when this error occurred:\n\n`
                        );
                        window.location.href = `mailto:support@toolchest.app?subject=${subject}&body=${body}`;
                    },
                },
            ]}
            showContactSupport={true}
            showTechnicalDetails={process.env.NODE_ENV === 'development'}
            technicalDetails={{
                errorId,
                timestamp: new Date().toISOString(),
                userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
                path: typeof window !== 'undefined' ? window.location.pathname : undefined,
            }}
        />
    );
} 