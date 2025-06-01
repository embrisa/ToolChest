import useSWR from "swr";
import { ToolDTO, TagDTO } from "@/types/tools/tool";
import { swrFetcher } from "@/lib/api";

/**
 * Hook to fetch all tools
 */
export function useTools() {
  const { data, error, isLoading, mutate } = useSWR<ToolDTO[]>(
    "/tools",
    swrFetcher,
  );

  return {
    tools: data || [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch tools with search
 */
export function useToolsSearch(query: string) {
  const shouldFetch = query && query.trim().length > 0;
  const endpoint = shouldFetch
    ? `/tools/search?q=${encodeURIComponent(query)}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<ToolDTO[]>(
    endpoint,
    swrFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300, // Dedupe requests within 300ms
    },
  );

  return {
    tools: data || [],
    isLoading: shouldFetch && isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch all tags
 */
export function useTags() {
  const { data, error, isLoading, mutate } = useSWR<TagDTO[]>(
    "/tags",
    swrFetcher,
  );

  return {
    tags: data || [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to get tools by tag
 */
export function useToolsByTag(tagSlug: string | null) {
  const shouldFetch = tagSlug && tagSlug.trim().length > 0;
  const endpoint = shouldFetch
    ? `/tools?tag=${encodeURIComponent(tagSlug)}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<ToolDTO[]>(
    endpoint,
    swrFetcher,
  );

  return {
    tools: data || [],
    isLoading: shouldFetch && isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to get popular tools
 */
export function usePopularTools(limit: number = 6) {
  const { data, error, isLoading, mutate } = useSWR<ToolDTO[]>(
    `/tools?popular=true&limit=${limit}`,
    swrFetcher,
  );

  return {
    tools: data || [],
    isLoading,
    error,
    mutate,
  };
}
