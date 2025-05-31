'use client';

import { useEffect, useRef } from 'react';
import { A11yAnnouncement, A11yAnnouncementType } from '@/types/tools/base64';

interface AriaLiveRegionProps {
    announcement: A11yAnnouncement | null;
    className?: string;
}

export function AriaLiveRegion({ announcement, className = '' }: AriaLiveRegionProps) {
    const regionRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (announcement && regionRef.current) {
            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Update the content
            regionRef.current.textContent = announcement.message;

            // Clear the announcement after a delay to allow screen readers to process it
            timeoutRef.current = setTimeout(() => {
                if (regionRef.current) {
                    regionRef.current.textContent = '';
                }
            }, 3000);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [announcement]);

    return (
        <div
            ref={regionRef}
            className={`sr-only ${className}`}
            role="status"
            aria-live={announcement?.type || 'polite'}
            aria-atomic="true"
        />
    );
}

/**
 * Hook to manage accessibility announcements
 */
export function useAccessibilityAnnouncements() {
    const announceToScreenReader = (
        message: string,
        type: A11yAnnouncementType = 'polite'
    ): A11yAnnouncement => {
        return {
            message,
            type,
            timestamp: Date.now()
        };
    };

    return { announceToScreenReader };
} 