"use client";

import React from "react";
import { ErrorPage } from "./ErrorPage";
import { HTTP_ERROR_CONFIGS } from "@/types/errors";

interface HttpErrorPageProps {
  statusCode: number;
  customMessage?: string;
  customDescription?: string;
  showTechnicalDetails?: boolean;
  technicalDetails?: {
    errorId?: string;
    timestamp?: string;
    userAgent?: string;
    path?: string;
  };
}

export function HttpErrorPage({
  statusCode,
  customMessage,
  customDescription,
  showTechnicalDetails = false,
  technicalDetails,
}: HttpErrorPageProps) {
  const config = HTTP_ERROR_CONFIGS[statusCode];

  if (!config) {
    // Fallback for unknown status codes
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <ErrorPage
          statusCode={statusCode}
          title="Error"
          message={customMessage || "An error occurred"}
          description={customDescription || "Please try again later."}
          recoveryActions={[
            {
              type: "refresh",
              label: "Refresh Page",
              onClick: () => window.location.reload(),
            },
            {
              type: "navigate_home",
              label: "Go to Home",
              onClick: () => (window.location.href = "/"),
            },
          ]}
          showTechnicalDetails={showTechnicalDetails}
          technicalDetails={technicalDetails}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <ErrorPage
        statusCode={statusCode}
        title={config.title}
        message={customMessage || config.message}
        description={customDescription || config.description}
        suggestions={config.suggestions}
        recoveryActions={config.recoveryActions?.map((action) => ({
          ...action,
          onClick: () => {
            switch (action.type) {
              case "refresh":
                window.location.reload();
                break;
              case "navigate_home":
                window.location.href = "/";
                break;
              case "navigate_back":
                window.history.back();
                break;
              case "retry":
                window.location.reload();
                break;
              case "contact_support":
                const subject = encodeURIComponent(
                  `Support Request - Error ${statusCode}`,
                );
                const body = encodeURIComponent(
                  `Error ${statusCode} occurred on ${window.location.href}\n\n` +
                  `Please describe the issue:\n\n`,
                );
                window.location.href = `mailto:support@tool-chest.com?subject=${subject}&body=${body}`;
                break;
              case "clear_cache":
                if ("caches" in window) {
                  caches.keys().then((names) => {
                    names.forEach((name) => caches.delete(name));
                  });
                }
                window.location.reload();
                break;
            }
          },
        }))}
        showContactSupport={config.showContactSupport}
        showTechnicalDetails={
          showTechnicalDetails || config.showTechnicalDetails
        }
        technicalDetails={technicalDetails}
      />
    </div>
  );
}

// Specific error page components for common scenarios

export function NotFoundErrorPage(
  props?: Omit<HttpErrorPageProps, "statusCode">,
) {
  return <HttpErrorPage statusCode={404} {...props} />;
}

export function UnauthorizedErrorPage(
  props?: Omit<HttpErrorPageProps, "statusCode">,
) {
  return <HttpErrorPage statusCode={401} {...props} />;
}

export function ForbiddenErrorPage(
  props?: Omit<HttpErrorPageProps, "statusCode">,
) {
  return <HttpErrorPage statusCode={403} {...props} />;
}

export function RateLimitErrorPage(
  props?: Omit<HttpErrorPageProps, "statusCode">,
) {
  return <HttpErrorPage statusCode={429} {...props} />;
}

export function InternalServerErrorPage(
  props?: Omit<HttpErrorPageProps, "statusCode">,
) {
  return <HttpErrorPage statusCode={500} {...props} />;
}

export function BadGatewayErrorPage(
  props?: Omit<HttpErrorPageProps, "statusCode">,
) {
  return <HttpErrorPage statusCode={502} {...props} />;
}

export function ServiceUnavailableErrorPage(
  props?: Omit<HttpErrorPageProps, "statusCode">,
) {
  return <HttpErrorPage statusCode={503} {...props} />;
}

// Network error component for offline/connectivity issues
export function NetworkErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <ErrorPage
        statusCode={0}
        title="Connection Problem"
        message="Unable to connect to the server"
        description="Please check your internet connection and try again."
        suggestions={[
          "Check your internet connection",
          "Try refreshing the page",
          "Wait a moment and try again",
          "Contact support if the problem persists",
        ]}
        recoveryActions={[
          {
            type: "retry",
            label: "Try Again",
            onClick: () => window.location.reload(),
          },
          {
            type: "navigate_home",
            label: "Go to Home",
            onClick: () => (window.location.href = "/"),
          },
        ]}
        showContactSupport={true}
      />
    </div>
  );
}

// Maintenance mode component
export function MaintenanceErrorPage({
  estimatedDuration,
}: { estimatedDuration?: string } = {}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <ErrorPage
        statusCode={503}
        title="Scheduled Maintenance"
        message="We're currently performing scheduled maintenance"
        description={
          estimatedDuration
            ? `We expect to be back online in ${estimatedDuration}. Thank you for your patience.`
            : "We expect to be back online shortly. Thank you for your patience."
        }
        suggestions={[
          "Check back in a few minutes",
          "Follow our status page for updates",
          "Contact support for urgent matters",
        ]}
        recoveryActions={[
          {
            type: "retry",
            label: "Check Again",
            onClick: () => window.location.reload(),
          },
          {
            type: "navigate_home",
            label: "Go to Home",
            onClick: () => (window.location.href = "/"),
          },
        ]}
        showContactSupport={true}
      />
    </div>
  );
}
