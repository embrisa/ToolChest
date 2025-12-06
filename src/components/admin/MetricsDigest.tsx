"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import type { MetricsDigest } from "@/types/admin/metricsDigest";

type MetricsDigestProps = {
  windowDays?: number;
};

export function MetricsDigest({ windowDays = 7 }: MetricsDigestProps) {
  const t = useTranslations("pages.admin.analytics.metricsDigest");
  const tCommon = useTranslations("common");
  const [digest, setDigest] = useState<MetricsDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadDigest();
  }, [windowDays]);

  const loadDigest = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/metrics/digest?windowDays=${windowDays}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || response.statusText);
      }

      const data = (await response.json()) as { data: MetricsDigest };
      setDigest(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : tCommon("errors.loadingFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPercent = (value: number) =>
    `${Math.round((value || 0) * 1000) / 10}%`;

  const renderErrorBuckets = (buckets: Record<string, number>) => {
    const entries = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
      return <p className="text-sm text-neutral-500">{t("noErrors")}</p>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {entries.map(([bucket, count]) => (
          <span
            key={bucket}
            className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
          >
            {bucket}: {count}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3 text-sm text-neutral-600">
          <Loading size="sm" />
          <span>{t("loading")}</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="error">{error}</Alert>
          <Button onClick={() => void loadDigest()} variant="secondary">
            {tCommon("ui.actions.tryAgain")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!digest) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-500">{t("subtitle")}</p>
            <CardTitle>{t("title")}</CardTitle>
          </div>
          <div className="text-sm text-neutral-500">
            {t("window", { days: digest.windowDays })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
            <p className="text-xs text-neutral-500">{t("totalEvents")}</p>
            <p className="text-2xl font-semibold text-neutral-900">
              {digest.totalEvents}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-success-50 border border-success-200">
            <p className="text-xs text-success-700">{t("successRate")}</p>
            <p className="text-2xl font-semibold text-success-900">
              {formatPercent(digest.successRate)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-error-50 border border-error-200">
            <p className="text-xs text-error-700">{t("errors")}</p>
            <p className="text-2xl font-semibold text-error-900">
              {digest.errorCount}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-neutral-800 mb-2">
            {t("errorBuckets")}
          </p>
          {renderErrorBuckets(digest.errorBuckets)}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-800">
            {t("byTool")}
          </p>
          {digest.byTool.length === 0 ? (
            <p className="text-sm text-neutral-500">{t("noData")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-neutral-500">
                  <tr>
                    <th className="py-2 pr-4 font-medium">{t("tool")}</th>
                    <th className="py-2 pr-4 font-medium">{t("total")}</th>
                    <th className="py-2 pr-4 font-medium">
                      {t("successRate")}
                    </th>
                    <th className="py-2 pr-4 font-medium">{t("errors")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {digest.byTool.map((tool) => {
                    const toolSuccessRate =
                      tool.total > 0 ? tool.success / tool.total : 0;
                    return (
                      <tr key={tool.toolSlug}>
                        <td className="py-2 pr-4 font-mono text-xs">
                          {tool.toolSlug}
                        </td>
                        <td className="py-2 pr-4">{tool.total}</td>
                        <td className="py-2 pr-4">
                          {formatPercent(toolSuccessRate)}
                        </td>
                        <td className="py-2 pr-4">{tool.error}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-xs text-neutral-500">
          {digest.lastEventTs
            ? `${t("lastEvent")}: ${new Date(
                digest.lastEventTs,
              ).toLocaleString()}`
            : t("noEvents")}
        </div>
      </CardContent>
    </Card>
  );
}

