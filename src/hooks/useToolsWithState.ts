import { useCallback, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { ToolDTO, TagDTO } from "@/types/tools/tool";
import { swrFetcher } from "@/lib/api";
import { useToolFilterState, ToolFilterState } from "./useUrlState";

interface ToolsWithStateResult {
  tools: ToolDTO[];
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  totalCount: number;
  filterState: ToolFilterState;
  actions: {
    setQuery: (query: string) => void;
    setTags: (tags: string[]) => void;
    setSorting: (sortBy: string, sortOrder: "asc" | "desc") => void;
    setPage: (page: number) => void;
    clearAllFilters: () => void;
    retry: () => void;
    recordUsage: (toolSlug: string) => Promise<void>;
    preloadNextPage: () => Promise<void>;
    prefetchTool: (toolSlug: string) => Promise<void>;
  };
}

/**
 * Enhanced hook for tools with URL state management
 */
export function useToolsWithState(): ToolsWithStateResult {
  const {
    filterState,
    setQuery,
    setTags,
    setSorting,
    setPage,
    clearAllFilters,
    mounted,
  } = useToolFilterState();

  // Build API endpoint based on filter state
  const apiEndpoint = useMemo(() => {
    // Don't return an endpoint until mounted to prevent hydration issues
    if (!mounted) return null;

    const params = new URLSearchParams();

    if (filterState.query) {
      // Use search endpoint for queries
      params.set("q", filterState.query);
      return `/api/tools/search?${params.toString()}`;
    } else {
      // Use regular tools endpoint with filters
      if (filterState.tags.length > 0) {
        filterState.tags.forEach((tag) => params.append("tag", tag));
      }
      if (filterState.sortBy !== "displayOrder") {
        params.set("sortBy", filterState.sortBy);
      }
      if (filterState.sortOrder !== "asc") {
        params.set("sortOrder", filterState.sortOrder);
      }
      if (filterState.page > 1) {
        params.set(
          "offset",
          ((filterState.page - 1) * filterState.limit).toString(),
        );
      }
      params.set("limit", filterState.limit.toString());

      return `/api/tools?${params.toString()}`;
    }
  }, [filterState, mounted]);

  // Fetch tools data with simplified SWR config
  // Only fetch when mounted and endpoint is available
  const {
    data,
    error,
    isLoading,
    mutate: mutateTools,
  } = useSWR<ToolDTO[]>(apiEndpoint, swrFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
    errorRetryInterval: 1000,
    dedupingInterval: 2000,
  });

  // Client-side filtering for tags when searching
  const filteredTools = useMemo(() => {
    if (!data) return [];

    let tools = data;

    // If we have both search query and tags, apply tag filtering client-side
    if (filterState.query && filterState.tags.length > 0) {
      tools = tools.filter((tool) =>
        tool.tags?.some((tag) => filterState.tags.includes(tag.slug)),
      );
    }

    return tools;
  }, [data, filterState.query, filterState.tags]);

  // Preload next page of results
  const preloadNextPage = useCallback(async () => {
    if (filterState.query || !data) return;

    // Since we don't have meta.total anymore, we can't determine if there's a next page
    // This functionality would need to be implemented differently
    return;

    const nextPageParams = new URLSearchParams();
    if (filterState.tags.length > 0) {
      filterState.tags.forEach((tag) => nextPageParams.append("tag", tag));
    }
    nextPageParams.set("sortBy", filterState.sortBy);
    nextPageParams.set("sortOrder", filterState.sortOrder);
    nextPageParams.set(
      "offset",
      (filterState.page * filterState.limit).toString(),
    );
    nextPageParams.set("limit", filterState.limit.toString());

    const nextPageUrl = `/api/tools?${nextPageParams.toString()}`;

    // Simple prefetch
    fetch(nextPageUrl).catch(() => {
      // Ignore errors for prefetch
    });
  }, [filterState, data]);

  // Prefetch individual tool data
  const prefetchTool = useCallback(async (toolSlug: string) => {
    const toolUrl = `/api/tools/${toolSlug}`;
    fetch(toolUrl).catch(() => {
      // Ignore errors for prefetch
    });
  }, []);

  // Enhanced retry function
  const retry = useCallback(async () => {
    await mutateTools();
  }, [mutateTools]);

  // Optimistic usage tracking
  const recordUsage = useCallback(
    async (toolSlug: string) => {
      try {
        // Optimistic update - increment usage count immediately
        if (data) {
          const optimisticData = data.map((tool) =>
            tool.slug === toolSlug
              ? { ...tool, usageCount: (tool.usageCount || 0) + 1 }
              : tool,
          );

          // Update local cache optimistically
          await mutateTools(optimisticData, false);
        }
        const response = await fetch(`/api/tools/${toolSlug}/usage`, {
          method: "POST",
        });
        if (!response.ok) {
          throw new Error("Failed to record usage");
        }
        await mutateTools();
        await mutate("/api/tools?popular=true");
      } catch (error) {
        console.error("Failed to record tool usage:", error);

        // Revert optimistic update on error
        await mutateTools();

        // Don't throw error - usage tracking is not critical to UX
      }
    },
    [data, mutateTools],
  );

  const totalCount = filteredTools.length;
  // Show as loading if not mounted or if SWR is loading
  const effectiveLoading = !mounted || isLoading;
  const isEmpty = !effectiveLoading && filteredTools.length === 0;

  return {
    tools: filteredTools,
    isLoading: effectiveLoading,
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
      prefetchTool,
    },
  };
}

/**
 * Hook for tags with simplified caching
 */
export function useTagsWithState() {
  // Get mounted state to prevent hydration issues
  const { mounted } = useToolFilterState();

  const {
    data,
    error,
    isLoading,
    mutate: mutateTags,
  } = useSWR<TagDTO[]>(mounted ? "/api/tags" : null, swrFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
    errorRetryInterval: 1000,
    dedupingInterval: 30000,
  });

  const retry = useCallback(async () => {
    await mutateTags();
  }, [mutateTags]);

  // Show as loading if not mounted or if SWR is loading
  const effectiveLoading = !mounted || isLoading;

  return {
    tags: data || [],
    isLoading: effectiveLoading,
    error,
    retry,
  };
}

/**
 * Hook for individual tool with usage tracking
 */
export function useToolWithUsage(slug: string) {
  const {
    data,
    error,
    isLoading,
    mutate: mutateTool,
  } = useSWR<ToolDTO>(slug ? `/api/tools/${slug}` : null, swrFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
  });

  const recordUsage = useCallback(async () => {
    if (!slug) return;

    try {
      // Optimistic update
      if (data) {
        const optimisticData = {
          ...data,
          usageCount: (data.usageCount || 0) + 1,
        };
        await mutateTool(optimisticData, false);
      }
      const response = await fetch(`/api/tools/${slug}/usage`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to record usage");
      }
      await mutateTool();
      await mutate("/api/tools?popular=true");
    } catch (error) {
      console.error("Failed to record tool usage:", error);
      await mutateTool(); // Revert on error
    }
  }, [slug, data, mutateTool]);

  return {
    tool: data,
    isLoading,
    error,
    recordUsage,
  };
}
