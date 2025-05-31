'use client';

import React, { Suspense } from 'react';
import { ToolCard, SearchInput, TagFilter } from '@/components/tools';
import { useToolsWithState, useTagsWithState } from '@/hooks/useToolsWithState';

function HomePageContent() {
  // Use enhanced hooks with URL synchronization
  const {
    tools: filteredTools,
    isLoading: toolsLoading,
    error: toolsError,
    filterState,
    actions: {
      setQuery,
      setTags,
      clearAllFilters,
      retry: retryTools
    }
  } = useToolsWithState();

  const { tags, isLoading: tagsLoading, error: tagsError, retry: retryTags } = useTagsWithState();

  const handleTagToggle = (tagSlug: string) => {
    const newTags = filterState.tags.includes(tagSlug)
      ? filterState.tags.filter(slug => slug !== tagSlug)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-4">
            We&apos;re having trouble loading the tools. Please try again later.
          </p>
          <button
            onClick={() => {
              retryTools();
              retryTags();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              ToolChest
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Your collection of essential web development tools.
              Encode, decode, generate, and convert with ease.
            </p>
          </div>

          {/* Search Section */}
          <div className="mt-10 max-w-xl mx-auto">
            <SearchInput
              value={filterState.query}
              onChange={setQuery}
              placeholder="Search tools..."
              isLoading={Boolean(toolsLoading && filterState.query)}
              resultCount={filteredTools.length}
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar - Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <TagFilter
                tags={tags}
                selectedTags={filterState.tags}
                onTagToggle={handleTagToggle}
                onClearAll={handleClearAllTags}
                showCount={true}
              />
            </div>
          </aside>

          {/* Tools Grid */}
          <div className="mt-8 lg:mt-0 lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {filterState.query ? 'Search Results' : 'All Tools'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isLoading ? 'Loading...' : `${filteredTools.length} tools found`}
                </p>
              </div>

              {(filterState.query || filterState.tags.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-48"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Tools Grid */}
            {!isLoading && (
              <>
                {filteredTools.length > 0 ? (
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    role="grid"
                    aria-label="Available tools"
                  >
                    {filteredTools.map((tool, index) => (
                      <div key={tool.id} role="gridcell">
                        <ToolCard
                          tool={tool}
                          showUsageCount={true}
                          priority={index < 6}
                          className="h-full"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No tools found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {filterState.query
                        ? `No tools match "${filterState.query}"`
                        : 'No tools match your selected filters'
                      }
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={clearAllFilters}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Clear filters
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
