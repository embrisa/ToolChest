"use client";

import { useEffect } from "react";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import type { ToolMetricEntry } from "@/types/api/metrics";
import { useTranslations } from "next-intl";

type DebugDetail =
  | { type: "budget"; entry: ToolMetricEntry; budgetMs: number }
  | { type: "error"; entry: ToolMetricEntry };

const DEBUG_TOASTS_ENABLED =
  process.env.NEXT_PUBLIC_METRICS_DEBUG_TOAST === "true";

export function MetricsDebugToastBridge() {
  const { notifications, removeToast, toast } = useToast();
  const t = useTranslations("tools.common");

  useEffect(() => {
    if (!DEBUG_TOASTS_ENABLED) return;

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<DebugDetail>).detail;
      if (!detail) return;

      if (detail.type === "budget") {
        toast.warning(
          t("debug.budgetExceeded", {
            tool: detail.entry.toolSlug,
            action: detail.entry.action,
            duration: detail.entry.durationMs,
            budget: detail.budgetMs,
          }),
        );
      } else if (detail.type === "error") {
        toast.error(
          t("debug.actionFailed", {
            tool: detail.entry.toolSlug,
            action: detail.entry.action,
            category: detail.entry.errorCategory ?? "unknown",
          }),
        );
      }
    };

    window.addEventListener(
      "tool-metrics:debug",
      handler as EventListener,
    );
    return () =>
      window.removeEventListener(
        "tool-metrics:debug",
        handler as EventListener,
      );
  }, [t, toast]);

  if (!DEBUG_TOASTS_ENABLED) return null;

  return (
    <ToastContainer
      notifications={notifications}
      onDismiss={removeToast}
      position="bottom-right"
      maxToasts={4}
    />
  );
}


