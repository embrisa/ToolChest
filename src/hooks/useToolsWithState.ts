import { useCallback, useMemo, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { ToolDTO, TagDTO } from '@/types/tools/tool';
import { ApiResponse } from '@/types/api/common';
import { swrFetcher } from '@/lib/api';
import { useToolFilterState, ToolFilterState } from './useUrlState';
import { usePerformanceOptimization } from './usePerformanceOptimization';

interface ToolsWithStateResult {
    tools: ToolDTO[];
    isLoading: boolean;
    error: any;
    isEmpty: boolean;
    totalCount: number;
    filterState: ToolFilterState;
    actions: {
        setQuery: (query: string) => void;
        setTags: (tags: string[]) => void;
        setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
        setPage: (page: number) => void;
        clearAllFilters: () => void;
        retry: () => void;
        recordUsage: (toolSlug: string) => Promise<void>;
        preloadNextPage: () => Promise<void>;
        prefetchTool: (toolSlug: string) => Promise<void>;
    };
}

/**
 * Enhanced hook for tools with URL state management, performance optimizations, and intelligent caching
 */
export function useToolsWithState(): ToolsWithStateResult {
    const {
        filterState,
        setQuery,
        setTags,
        setSorting,
        setPage,
        clearAllFilters
    } = useToolFilterState();

    const {
        optimizeCache,
        preloadResource,
        measureRenderPerformance
    } = usePerformanceOptimization();

    // Build API endpoint based on filter state
    const apiEndpoint = useMemo(() => {
        const params = new URLSearchParams();

        if (filterState.query) {
            // Use search endpoint for queries
            params.set('q', filterState.query);
            return `/api/tools/search?${params.toString()}`;
        } else {
            // Use regular tools endpoint with filters
            if (filterState.tags.length > 0) {
                filterState.tags.forEach(tag => params.append('tag', tag));
            }
            if (filterState.sortBy !== 'displayOrder') {
                params.set('sortBy', filterState.sortBy);
            }
            if (filterState.sortOrder !== 'asc') {
                params.set('sortOrder', filterState.sortOrder);
            }
            if (filterState.page > 1) {
                params.set('offset', ((filterState.page - 1) * filterState.limit).toString());
            }
            params.set('limit', filterState.limit.toString());

            return `/api/tools?${params.toString()}`;
        }
    }, [filterState]);

    // Get optimized cache configuration
    const cacheConfig = useMemo(() => {
        const cache = optimizeCache({
            key: apiEndpoint,
            ttl: filterState.query ? 60 : 300, // Shorter cache for search results
            staleWhileRevalidate: 600,
            strategy: 'cache-first'
        });
        return cache.getCacheConfig();
    }, [apiEndpoint, filterState.query, optimizeCache]);

    // Fetch tools data with optimized caching
    const { data, error, isLoading, mutate: mutateTools } = useSWR<ApiResponse<ToolDTO[]>>(
        apiEndpoint,
        swrFetcher,
        {
            ...cacheConfig,
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            errorRetryCount: 3,
            errorRetryInterval: 1000,
            keepPreviousData: true, // Prevent loading flicker
            dedupingInterval: filterState.query ? 2000 : 5000, // Shorter deduping for search
            // Performance optimization: Reduce revalidation frequency for stable data
            refreshInterval: filterState.query ? 0 : 60000, // Only refresh static lists every minute
        }
    );

    // Client-side filtering for tags when searching with memoization
    const filteredTools = useMemo(() => {
        const perfMeasure = measureRenderPerformance('tools-filtering');

        if (!data?.data) return [];

        let tools = data.data;

        // If we have both search query and tags, apply tag filtering client-side
        if (filterState.query && filterState.tags.length > 0) {
            tools = tools.filter(tool =>
                tool.tags?.some(tag => filterState.tags.includes(tag.slug))
            );
        }

        perfMeasure.end();
        return tools;
    }, [data?.data, filterState.query, filterState.tags, measureRenderPerformance]);

    // Preload next page of results
    const preloadNextPage = useCallback(async () => {
        if (filterState.query || !data?.meta?.total) return;

        const hasNextPage = (filterState.page * filterState.limit) < data.meta.total;
        if (!hasNextPage) return;

        const nextPageParams = new URLSearchParams();
        if (filterState.tags.length > 0) {
            filterState.tags.forEach(tag => nextPageParams.append('tag', tag));
        }
        nextPageParams.set('sortBy', filterState.sortBy);
        nextPageParams.set('sortOrder', filterState.sortOrder);
        nextPageParams.set('offset', (filterState.page * filterState.limit).toString());
        nextPageParams.set('limit', filterState.limit.toString());

        const nextPageUrl = `/api/tools?${nextPageParams.toString()}`;

        await preloadResource(nextPageUrl, 'fetch', { priority: 'low' });
    }, [filterState, data?.meta?.total, preloadResource]);

    // Prefetch individual tool data
    const prefetchTool = useCallback(async (toolSlug: string) => {
        const toolUrl = `/api/tools/${toolSlug}`;
        await preloadResource(toolUrl, 'fetch', { priority: 'normal' });
    }, [preloadResource]);

    // Enhanced retry function with exponential backoff
    const retry = useCallback(async () => {
        await mutateTools();
    }, [mutateTools]);

    // Optimistic usage tracking with performance monitoring
    const recordUsage = useCallback(async (toolSlug: string) => {
        const perfMeasure = measureRenderPerformance('usage-tracking');

        try {
            // Optimistic update - increment usage count immediately
            if (data?.data) {
                const optimisticData = {
                    ...data,
                    data: data.data.map(tool =>
                        tool.slug === toolSlug
                            ? { ...tool, usageCount: (tool.usageCount || 0) + 1 }
                            : tool
                    )
                };

                // Update local cache optimistically
                await mutateTools(optimisticData, false);
            }

            // Make the actual API call
            const response = await fetch(`/api/tools/${toolSlug}/usage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Revalidate to ensure consistency
            await mutateTools();

            // Also invalidate related caches
            await mutate('/api/tools?popular=true');

        } catch (error) {
            console.error('Failed to record tool usage:', error);

            // Revert optimistic update on error
            await mutateTools();

            // Don't throw error - usage tracking is not critical to UX
        } finally {
            perfMeasure.end();
        }
    }, [data, mutateTools, measureRenderPerformance]);

    // Preload critical resources on mount
    useEffect(() => {
        // Preload popular tools and tags in the background
        preloadResource('/api/tools?popular=true', 'fetch', { priority: 'low' });
        preloadResource('/api/tags', 'fetch', { priority: 'low' });
    }, [preloadResource]);

    // Auto-preload next page when approaching the end
    useEffect(() => {
        if (!isLoading && filteredTools.length >= filterState.limit * 0.8) {
            preloadNextPage();
        }
    }, [filteredTools.length, filterState.limit, isLoading, preloadNextPage]);

    const totalCount = data?.meta?.total || filteredTools.length;
    const isEmpty = !isLoading && filteredTools.length === 0;

    return {
        tools: filteredTools,
        isLoading,
        error,
        isEmpty,
        totalCount,
        filterState,
        actions: {
            setQuery,
            setTags,
            setSorting,
            setPage,
            clearAllFilters,
            retry,
            recordUsage,
            preloadNextPage,
            prefetchTool
        }
    };
}

/**
 * Hook for tags with enhanced caching and performance optimization
 */
export function useTagsWithState() {
    const { optimizeCache } = usePerformanceOptimization();

    // Get optimized cache configuration for tags (they change infrequently)
    const cacheConfig = useMemo(() => {
        const cache = optimizeCache({
            key: '/api/tags',
            ttl: 600, // 10 minute cache for tags
            staleWhileRevalidate: 1800, // 30 minute stale-while-revalidate
            strategy: 'cache-first'
        });
        return cache.getCacheConfig();
    }, [optimizeCache]);

    const { data, error, isLoading, mutate: mutateTags } = useSWR<TagDTO[]>(
        '/api/tags',
        swrFetcher,
        {
            ...cacheConfig,
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            errorRetryCount: 3,
            errorRetryInterval: 1000,
            dedupingInterval: 30000, // Tags change less frequently
            refreshInterval: 300000, // Refresh every 5 minutes
        }
    );

    const retry = useCallback(async () => {
        await mutateTags();
    }, [mutateTags]);

    return {
        tags: data || [],
        isLoading,
        error,
        retry
    };
}

/**
 * Hook for individual tool with usage tracking and performance optimization
 */
export function useToolWithUsage(slug: string) {
    const { optimizeCache, measureRenderPerformance } = usePerformanceOptimization();

    // Get optimized cache configuration
    const cacheConfig = useMemo(() => {
        if (!slug) return {};

        const cache = optimizeCache({
            key: `/api/tools/${slug}`,
            ttl: 300, // 5 minute cache for individual tools
            staleWhileRevalidate: 600,
            strategy: 'cache-first'
        });
        return cache.getCacheConfig();
    }, [slug, optimizeCache]);

    const { data, error, isLoading, mutate: mutateTool } = useSWR<ToolDTO>(
        slug ? `/api/tools/${slug}` : null,
        swrFetcher,
        {
            ...cacheConfig,
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            errorRetryCount: 3,
        }
    );

    const recordUsage = useCallback(async () => {
        if (!slug) return;

        const perfMeasure = measureRenderPerformance('individual-tool-usage');

        try {
            // Optimistic update
            if (data) {
                const optimisticData = {
                    ...data,
                    usageCount: (data.usageCount || 0) + 1
                };
                await mutateTool(optimisticData, false);
            }

            // Make API call
            const response = await fetch(`/api/tools/${slug}/usage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Revalidate
            await mutateTool();
            await mutate('/api/tools?popular=true');

        } catch (error) {
            console.error('Failed to record tool usage:', error);
            await mutateTool(); // Revert on error
        } finally {
            perfMeasure.end();
        }
    }, [slug, data, mutateTool, measureRenderPerformance]);

    return {
        tool: data,
        isLoading,
        error,
        recordUsage
    };
} 