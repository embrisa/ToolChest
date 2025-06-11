"use client";

import React, { Suspense } from "react";
import { useTranslations } from "next-intl";
import { ToolCard, SearchInput, TagFilter } from "@/components/tools";
import { useToolsWithState, useTagsWithState } from "@/hooks/useToolsWithState";
import { Button } from "@/components/ui";

function HomePageContent() {
  const t = useTranslations("pages.home");
  const tCommon = useTranslations("common");

  // Use enhanced hooks with URL synchronization
  const {
    tools: filteredTools,
    isLoading: toolsLoading,
    error: toolsError,
    filterState,
    actions: { setQuery, setTags, clearAllFilters, retry: retryTools },
  } = useToolsWithState();

  const {
    tags,
    isLoading: tagsLoading,
    error: tagsError,
    retry: retryTags,
  } = useTagsWithState();

  const handleTagToggle = (tagSlug: string) => {
    const newTags = filterState.tags.includes(tagSlug)
      ? filterState.tags.filter((slug) => slug !== tagSlug)
      : [...filterState.tags, tagSlug];
    setTags(newTags);
  };

  const handleClearAllTags = () => {
    setTags([]);
  };

  const isLoading = Boolean(toolsLoading || tagsLoading);
  const hasError = toolsError || tagsError;

  if (hasError) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center animate-fade-in">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-error-50 dark:bg-error-950/20 border border-error-200 dark:border-error-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
            <svg
              className="w-8 h-8 text-error-500 dark:text-error-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-title text-2xl font-bold text-primary mb-4">
            {t("errors.troubleLoading")}
          </h2>
          <p className="text-body text-secondary mb-6">
            {t("errors.troubleLoading")}
          </p>
          <Button
            variant="primary"
            onClick={() => {
              retryTools();
              retryTags();
            }}
            className="focus-ring"
            data-testid="retry-button"
          >
            {tCommon("actions.tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" suppressHydrationWarning>
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="relative container-wide px-6 sm:px-8 lg:px-12 py-20 sm:py-24 lg:py-16">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8">
              <span className="text-gradient-brand">{t("hero.title")}</span>
            </h1>
            <p className="text-body text-lg sm:text-xl lg:text-2xl text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
              {t("hero.subtitle")}
              <br className="hidden sm:block" />
              <span className="text-gradient bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                {t("hero.description")}
              </span>
            </p>

            {/* Search Section */}
            <div
              className="max-w-2xl mx-auto animate-fade-in-up mb-16"
              style={{ animationDelay: "0.1s" }}
            >
              <SearchInput
                value={filterState.query}
                onChange={setQuery}
                placeholder={t("hero.searchPlaceholder")}
                isLoading={Boolean(toolsLoading && filterState.query)}
                resultCount={filteredTools.length}
                className="w-full text-lg"
                data-testid="search-input"
              />
            </div>

            {/* Stats */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
              role="region"
              aria-label="tool-chest statistics"
            >
              <div className="text-center">
                <div
                  className="text-2xl sm:text-3xl font-bold text-gradient-brand"
                  data-testid="tools-count"
                >
                  {isLoading ? "..." : filteredTools.length}
                </div>
                <div className="text-sm text-secondary font-medium">
                  {t("stats.toolsAvailable")}
                </div>
              </div>
              <div
                className="hidden sm:block w-px h-8 bg-neutral-200"
                aria-hidden="true"
              ></div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gradient bg-gradient-to-r from-success-500 to-warning-500 bg-clip-text text-transparent">
                  {t("stats.clientSideValue")}
                </div>
                <div className="text-sm text-secondary font-medium">
                  {t("stats.clientSideProcessing")}
                </div>
              </div>
              <div
                className="hidden sm:block w-px h-8 bg-neutral-200"
                aria-hidden="true"
              ></div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gradient bg-gradient-to-r from-accent-500 to-brand-500 bg-clip-text text-transparent">
                  {t("stats.freeForever")}
                </div>
                <div className="text-sm text-secondary font-medium">
                  {t("stats.freeValue")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container-wide px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
        {/* Mobile: Show search summary and filters toggle */}
        <div className="lg:hidden mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-heading text-xl font-semibold text-primary">
                {filterState.query
                  ? t("sections.searchResults")
                  : t("sections.allTools")}
              </h2>
              <p
                className="text-body text-secondary mt-2"
                data-testid="results-summary-mobile"
              >
                {isLoading
                  ? t("loading.loadingTools")
                  : `${filteredTools.length} ${t("loading.toolsFound")}`}
              </p>
            </div>
          </div>

          {/* Mobile filters in collapsible card */}
          <details className="group">
            <summary className="card p-6 cursor-pointer focus-ring rounded-lg list-none">
              <div className="flex items-center justify-between">
                <span className="text-body font-medium text-primary">
                  {t("sections.filterTools")}
                  {filterState.tags.length > 0 && (
                    <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/20 dark:text-brand-200">
                      {filterState.tags.length} {t("sections.active")}
                    </span>
                  )}
                </span>
                <svg
                  className="w-5 h-5 text-secondary transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </summary>
            <div className="card p-8 mt-4">
              <TagFilter
                tags={tags}
                selectedTags={filterState.tags}
                onTagToggle={handleTagToggle}
                onClearAll={handleClearAllTags}
                showCount={true}
                data-testid="tag-filters"
                testIdPrefix="mobile-"
              />
            </div>
          </details>
        </div>

        {/* Desktop Layout */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Desktop Tools Grid - Move to first for better visual hierarchy */}
          <main
            className="lg:col-span-3 lg:order-2 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
            role="main"
            aria-label="Tools collection"
          >
            {/* Desktop Results Header */}
            <div className="hidden lg:flex items-center justify-between mb-10">
              <div>
                <h2 className="text-heading text-xl font-semibold text-primary">
                  {filterState.query ? t("sections.searchResults") : t("sections.allTools")}
                </h2>
                <p
                  className="text-body text-secondary mt-2"
                  data-testid="results-summary-desktop"
                >
                  {isLoading
                    ? t("loading.loadingTools")
                    : `${filteredTools.length} ${t("loading.toolsFound")}`}
                </p>
              </div>

              {(filterState.query || filterState.tags.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="focus-ring"
                  data-testid="clear-all-filters"
                >
                  {t("filtering.clearAll")}
                </Button>
              )}
            </div>

            {/* Mobile Clear Filters Button */}
            {(filterState.query || filterState.tags.length > 0) && (
              <div className="lg:hidden mb-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="focus-ring w-full sm:w-auto"
                  data-testid="clear-all-filters-mobile"
                >
                  {t("filtering.clearAll")}
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                role="status"
                aria-label="Loading tools"
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="card h-48 animate-pulse"
                    data-testid="tool-skeleton"
                  >
                    <div className="p-8 space-y-6">
                      <div className="skeleton w-12 h-12 rounded-xl"></div>
                      <div className="space-y-3">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-text"></div>
                        <div className="skeleton-text w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
                <span className="sr-only">Loading tools...</span>
              </div>
            )}

            {/* Tools Grid */}
            {!isLoading && (
              <>
                {filteredTools.length > 0 ? (
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                    role="region"
                    aria-label="Available tools"
                    data-testid="tools-grid"
                  >
                    {filteredTools.map((tool, index) => (
                      <div
                        key={tool.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <ToolCard
                          tool={tool}
                          showUsageCount={true}
                          priority={index < 6}
                          className="h-full"
                          data-testid="tool-card"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="text-center py-20 animate-fade-in"
                    data-testid="no-results"
                  >
                    <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-8">
                      <svg
                        className="w-10 h-10 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-heading text-lg font-semibold text-primary mb-3">
                      {t("noResults.title")}
                    </h3>
                    <p className="text-body text-secondary mb-10 max-w-md mx-auto">
                      {filterState.query
                        ? t("noResults.description")
                        : t("noResults.descriptionFilters")}
                    </p>
                    <Button
                      variant="primary"
                      onClick={clearAllFilters}
                      className="focus-ring"
                      data-testid="clear-filters"
                    >
                      {tCommon("actions.clearFilters")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>

          {/* Desktop Sidebar - Filters */}
          <aside
            className="hidden lg:block lg:col-span-1 lg:order-1 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
            role="complementary"
            aria-label="Filter tools"
          >
            <div className="card p-8 sticky top-8">
              <TagFilter
                tags={tags}
                selectedTags={filterState.tags}
                onTagToggle={handleTagToggle}
                onClearAll={handleClearAllTags}
                showCount={true}
                data-testid="tag-filters"
                testIdPrefix="desktop-"
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-neutral-100 flex items-center justify-center"
          role="status"
          aria-label="Loading application"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-8 h-8 bg-brand-500 rounded-lg animate-bounce"></div>
            </div>
            <p className="text-body text-secondary">Loading tool-chest...</p>
            <span className="sr-only">Loading application, please wait...</span>
          </div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
