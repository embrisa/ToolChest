"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/utils";
import { A11yAnnouncement, A11yAnnouncementType } from "@/types/tools/base64";

interface AriaLiveRegionProps {
  announcement: A11yAnnouncement | null;
  className?: string;
}

export function AriaLiveRegion({
  announcement,
  className = "",
}: AriaLiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (announcement && regionRef.current) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Update the content with enhanced accessibility feedback
      regionRef.current.textContent = announcement.message;

      // Enhanced timing based on message importance and length
      const clearDelay =
        announcement.type === "assertive"
          ? Math.max(4000, announcement.message.length * 50) // Longer for critical messages
          : Math.max(3000, announcement.message.length * 40); // Standard timing

      // Clear the announcement after appropriate delay
      timeoutRef.current = setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = "";
        }
      }, clearDelay);
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
      className={cn(
        // Screen reader only - follows design system spacing
        "sr-only",
        // Enhanced positioning for better screen reader detection
        "absolute left-[-10000px] top-auto w-px h-px overflow-hidden",
        className,
      )}
      role="status"
      aria-live={announcement?.type || "polite"}
      aria-atomic="true"
      aria-relevant="additions text"
    />
  );
}

/**
 * Hook to manage accessibility announcements with enhanced message handling
 */
export function useAccessibilityAnnouncements() {
  const announceToScreenReader = (
    message: string,
    type: A11yAnnouncementType = "polite",
    priority: "low" | "medium" | "high" = "medium",
  ): A11yAnnouncement => {
    // Enhanced message formatting for better screen reader experience
    const formattedMessage = message.trim().replace(/\s+/g, " ");

    // Ensure proper punctuation for natural speech rhythm
    const finalMessage =
      formattedMessage.endsWith(".") ||
      formattedMessage.endsWith("!") ||
      formattedMessage.endsWith("?")
        ? formattedMessage
        : `${formattedMessage}.`;

    return {
      message: finalMessage,
      type: priority === "high" ? "assertive" : type,
      timestamp: Date.now(),
    };
  };

  const announceSuccess = (message: string) =>
    announceToScreenReader(`Success: ${message}`, "polite", "medium");

  const announceError = (message: string) =>
    announceToScreenReader(`Error: ${message}`, "assertive", "high");

  const announceWarning = (message: string) =>
    announceToScreenReader(`Warning: ${message}`, "polite", "medium");

  const announceProgress = (message: string, progress?: number) => {
    const progressText =
      progress !== undefined ? ` ${Math.round(progress)}% complete` : "";
    return announceToScreenReader(`${message}${progressText}`, "polite", "low");
  };

  return {
    announceToScreenReader,
    announceSuccess,
    announceError,
    announceWarning,
    announceProgress,
  };
}
