import { z } from "zod";

/**
 * Canonical schema for `pages.home` translation namespace.
 */
export const PagesHomeSchema = z
  .object({
    hero: z.object({
      title: z.string(),
      subtitle: z.string(),
      description: z.string(),
      searchPlaceholder: z.string(),
    }),
    stats: z.object({
      toolsAvailable: z.string(),
      clientSideProcessing: z.string(),
      clientSideValue: z.string(),
      freeForever: z.string(),
      freeValue: z.string(),
    }),
    sections: z.object({
      allTools: z.string(),
      searchResults: z.string(),
      filterTools: z.string(),
      active: z.string(),
    }),
    loading: z.object({
      loadingTools: z.string(),
      toolsFound: z.string(),
    }),
    noResults: z.object({
      title: z.string(),
      description: z.string(),
      descriptionFilters: z.string(),
    }),
    errors: z.object({
      troubleLoading: z.string(),
    }),
    search: z.object({
      placeholder: z.string(),
      clearSearch: z.string(),
      searchResults: z.string(),
    }),
    filtering: z.object({
      filterByTags: z.string(),
      allTags: z.string(),
      selectedTags: z.string(),
      clearAll: z.string(),
      noTags: z.string(),
    }),
    toolCard: z.object({
      newTool: z.string(),
      popularTool: z.string(),
      openTool: z.string(),
    }),
  })
  .strict();

export type PagesHomeMessages = z.infer<typeof PagesHomeSchema>;
