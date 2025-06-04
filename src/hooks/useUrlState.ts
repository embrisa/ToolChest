import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo, useEffect, useState } from "react";

interface UseUrlStateOptions {
  defaultValues?: Record<string, string | string[]>;
  replace?: boolean; // Use router.replace instead of router.push
}

export function useUrlState(options: UseUrlStateOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { defaultValues = {}, replace = false } = options;

  // Add mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get current URL state
  const urlState = useMemo(() => {
    const state: Record<string, string | string[]> = {};

    // Only access searchParams after mounting to prevent hydration mismatch
    if (mounted) {
      searchParams.forEach((value, key) => {
        // Handle array parameters (e.g., tags)
        if (key.endsWith("[]") || searchParams.getAll(key).length > 1) {
          const baseKey = key.endsWith("[]") ? key.slice(0, -2) : key;
          state[baseKey] = searchParams.getAll(key);
        } else {
          state[key] = value;
        }
      });
    }

    // Apply default values for missing keys and ensure no undefined values
    Object.entries(defaultValues).forEach(([key, defaultValue]) => {
      if (!(key in state) || state[key] === undefined) {
        state[key] = defaultValue;
      }
    });

    return state;
  }, [searchParams, defaultValues, mounted]);

  // Update URL state
  const setUrlState = useCallback(
    (updates: Record<string, string | string[] | null | undefined>) => {
      // Prevent URL updates during hydration
      if (!mounted) return;

      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        // Remove parameter if value is null/undefined
        if (value === null || value === undefined || value === "") {
          newParams.delete(key);
          newParams.delete(`${key}[]`);
          return;
        }

        // Handle array parameters
        if (Array.isArray(value)) {
          // Remove existing values
          newParams.delete(key);
          newParams.delete(`${key}[]`);

          // Add new values
          if (value.length > 0) {
            value.forEach((v) => {
              if (v) newParams.append(`${key}[]`, v);
            });
          }
        } else {
          // Handle string parameters
          newParams.set(key, value);
        }
      });

      const paramsString = newParams.toString();
      const newUrl = paramsString ? `${pathname}?${paramsString}` : pathname;

      if (replace) {
        router.replace(newUrl);
      } else {
        router.push(newUrl);
      }
    },
    [pathname, router, searchParams, replace, mounted],
  );

  // Get a specific parameter value
  const getParam = useCallback(
    (key: string): string | string[] | undefined => {
      return urlState[key];
    },
    [urlState],
  );

  // Set a specific parameter value
  const setParam = useCallback(
    (key: string, value: string | string[] | null | undefined) => {
      setUrlState({ [key]: value });
    },
    [setUrlState],
  );

  // Clear all parameters
  const clearParams = useCallback(() => {
    if (!mounted) return;
    router.push(pathname);
  }, [pathname, router, mounted]);

  // Update multiple parameters at once
  const updateParams = useCallback(
    (updates: Record<string, string | string[] | null | undefined>) => {
      setUrlState(updates);
    },
    [setUrlState],
  );

  return {
    urlState,
    setUrlState,
    getParam,
    setParam,
    clearParams,
    updateParams,
    searchParams,
    mounted, // Expose mounted state for components that need it
  };
}

// Specialized hook for tool filtering
export interface ToolFilterState {
  query: string;
  tags: string[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

export function useToolFilterState() {
  const defaultValues: Record<string, string | string[]> = {
    query: "",
    tags: [],
    sortBy: "displayOrder",
    sortOrder: "asc",
    page: "1",
    limit: "24",
  };

  const { urlState, updateParams, clearParams, mounted } = useUrlState({
    defaultValues,
    replace: true, // Use replace for better UX
  });

  const filterState: ToolFilterState = useMemo(
    () => ({
      query: String(urlState.query || ""),
      tags: Array.isArray(urlState.tags) ? urlState.tags : [],
      sortBy: (urlState.sortBy as string) || "displayOrder",
      sortOrder: (urlState.sortOrder as "asc" | "desc") || "asc",
      page: parseInt((urlState.page as string) || "1", 10),
      limit: parseInt((urlState.limit as string) || "24", 10),
    }),
    [urlState],
  );

  const setQuery = useCallback(
    (query: string) => {
      updateParams({
        query: query || null,
        page: query ? "1" : null, // Reset page when searching
      });
    },
    [updateParams],
  );

  const setTags = useCallback(
    (tags: string[]) => {
      updateParams({
        tags: tags.length > 0 ? tags : null,
        page: "1", // Reset page when filtering
      });
    },
    [updateParams],
  );

  const setSorting = useCallback(
    (sortBy: string, sortOrder: "asc" | "desc") => {
      updateParams({ sortBy, sortOrder });
    },
    [updateParams],
  );

  const setPage = useCallback(
    (page: number) => {
      updateParams({ page: page.toString() });
    },
    [updateParams],
  );

  const clearAllFilters = useCallback(() => {
    clearParams();
  }, [clearParams]);

  return {
    filterState,
    setQuery,
    setTags,
    setSorting,
    setPage,
    clearAllFilters,
    updateParams,
    mounted,
  };
}
