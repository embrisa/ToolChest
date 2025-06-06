"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ToolCard } from "@/components/tools";
import { ToolDTO } from "@/types/tools/tool";

// Note: metadata export removed since this is now a client component
// Consider adding metadata in a parent server component or layout

function ToolGrid({ tools, loading }: { tools: ToolDTO[]; loading: boolean }) {
  const t = useTranslations("pages.tools");

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card h-48 animate-pulse">
            <div className="p-6 space-y-4">
              <div className="skeleton w-12 h-12 rounded-xl"></div>
              <div className="space-y-2">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text w-2/3"></div>
              </div>
              <div className="flex gap-2 pt-2">
                <div className="skeleton w-16 h-6 rounded-lg"></div>
                <div className="skeleton w-20 h-6 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-neutral-400 dark:text-neutral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5l-1-1z"
            />
          </svg>
        </div>
        <h3 className="text-heading text-lg font-semibold text-foreground mb-2">
          {t("states.noToolsAvailable")}
        </h3>
        <p className="text-body text-foreground-secondary max-w-md mx-auto">
          {t("states.noToolsDescription")}
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      role="grid"
      aria-label="Available tools"
    >
      {tools.map((tool, index) => (
        <div
          key={tool.id}
          role="gridcell"
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <ToolCard
            tool={tool}
            showUsageCount={true}
            priority={index < 6} // Prioritize first 6 tools for loading
            className="h-full"
          />
        </div>
      ))}
    </div>
  );
}

export default function ToolsPage() {
  const t = useTranslations("pages.tools");
  const [tools, setTools] = useState<ToolDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Fetch tools client-side for privacy-first approach
    fetch("/api/tools")
      .then((res) => res.json())
      .then((data: ToolDTO[]) => {
        setTools(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tools:", error);
        setLoading(false);
      });
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="relative bg-gradient-to-br from-background via-background-secondary to-background-tertiary border-b border-border overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-20 dark:opacity-10"></div>
        <div className="absolute inset-0 bg-noise"></div>

        <div className="relative container-wide py-12 lg:py-16">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t("page.title")}
            </h1>
            <p className="text-body text-lg lg:text-xl text-foreground-secondary max-w-3xl mx-auto leading-relaxed">
              {t("page.subtitle")}
            </p>

            {/* Tool count badge */}
            <div
              className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800/30 rounded-full animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
                {loading
                  ? t("page.loading")
                  : `${tools.length} ${t("page.toolsAvailable")}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <main className="container-wide py-8 lg:py-12">
        <div
          className="mb-8 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-heading text-xl font-semibold text-foreground">
                {t("page.availableTools")}
              </h2>
              <p className="text-body text-foreground-secondary mt-1">
                {t("page.description")}
              </p>
            </div>

            {/* Filter/sort placeholder - can be enhanced later */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                {t("stats.allToolsFree")}
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                {t("stats.clientSideProcessing")}
              </div>
            </div>
          </div>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <ToolGrid tools={tools} loading={loading} />
        </div>

        {/* Additional Info Section */}
        {tools.length > 0 && !loading && (
          <div
            className="mt-16 pt-12 border-t border-border animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-success-100 dark:bg-success-950/20 border border-success-200 dark:border-success-800/30 rounded-xl flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-success-600 dark:text-success-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-heading font-semibold text-foreground">
                  Privacy First
                </h3>
                <p className="text-body text-foreground-secondary text-sm">
                  All processing happens in your browser. Your data never leaves
                  your device.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800/30 rounded-xl flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-brand-600 dark:text-brand-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-heading font-semibold text-foreground">
                  Lightning Fast
                </h3>
                <p className="text-body text-foreground-secondary text-sm">
                  Optimized for performance with instant processing and minimal
                  loading times.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-accent-100 dark:bg-accent-950/20 border border-accent-200 dark:border-accent-800/30 rounded-xl flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-accent-600 dark:text-accent-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-heading font-semibold text-foreground">
                  Always Free
                </h3>
                <p className="text-body text-foreground-secondary text-sm">
                  Complete access to all tools, forever. No hidden fees or
                  premium tiers.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
