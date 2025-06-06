"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ErrorPage } from "@/components/errors";
import { generateErrorId, logError } from "@/utils/errors";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const t = useTranslations("pages.error.serverError");

  useEffect(() => {
    // Log the error
    logError(error, {
      component: "GlobalErrorPage",
      digest: error.digest,
    });
  }, [error]);

  const errorId = generateErrorId();

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <ErrorPage
        statusCode={500}
        title={t("title")}
        message={t("message")}
        description={t("description")}
        suggestions={[
          t("suggestions.0"),
          t("suggestions.1"),
          t("suggestions.2"),
          t("suggestions.3"),
        ]}
        recoveryActions={[
          {
            type: "retry",
            label: t("actions.refreshPage"),
            onClick: reset,
          },
          {
            type: "refresh",
            label: t("actions.refreshPage"),
            onClick: () => window.location.reload(),
          },
          {
            type: "navigate_back",
            label: t("actions.goBack"),
            onClick: () => window.history.back(),
          },
          {
            type: "navigate_home",
            label: t("actions.goToHome"),
            onClick: () => (window.location.href = "/"),
          },
          {
            type: "contact_support",
            label: t("actions.contactSupport"),
            onClick: () => {
              const subject = encodeURIComponent(`Error Report - ${errorId}`);
              const body = encodeURIComponent(
                `Error ID: ${errorId}\n` +
                  `Time: ${new Date().toISOString()}\n` +
                  `URL: ${window.location.href}\n` +
                  `Error: ${error.message}\n\n` +
                  `Please describe what you were doing when this error occurred:\n\n`,
              );
              window.location.href = `mailto:support@tool-chest.com?subject=${subject}&body=${body}`;
            },
          },
        ]}
        showContactSupport={true}
        showTechnicalDetails={process.env.NODE_ENV === "development"}
        technicalDetails={{
          errorId,
          timestamp: new Date().toISOString(),
          userAgent:
            typeof window !== "undefined" ? navigator.userAgent : undefined,
          path:
            typeof window !== "undefined"
              ? window.location.pathname
              : undefined,
        }}
      />
    </div>
  );
}
