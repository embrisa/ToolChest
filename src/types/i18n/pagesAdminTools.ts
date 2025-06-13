import { z } from "zod";

/**
 * Canonical schema for `pages.admin.tools` translation namespace.
 */
export const PagesAdminToolsSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    actions: z.object({
      createTool: z.string(),
      editTool: z.string(),
      deleteTool: z.string(),
      bulkActions: z.string(),
    }),
    table: z.object({
      name: z.string(),
      slug: z.string(),
      status: z.string(),
      tags: z.string(),
      usage: z.string(),
      lastModified: z.string(),
      actions: z.string(),
    }),
    emptyState: z.object({
      description: z.string(),
    }),
    bulkOperations: z.object({
      title: z.string(),
      selectedCount: z.string(),
      operationType: z.string(),
      selectTags: z.string(),
      selectedTools: z.string(),
      previewChanges: z.string(),
      operationSummary: z.string(),
      totalChanges: z.string(),
      toolsToUpdate: z.string(),
      warnings: z.string(),
      executing: z.string(),
      executingMessage: z.string(),
      completed: z.string(),
      failed: z.string(),
      successMessage: z.string(),
      errorMessage: z.string(),
      results: z.string(),
      toolsAffected: z.string(),
      tagsAffected: z.string(),
      errors: z.string(),
      startNew: z.string(),
    }),
  })
  .strict();

export type PagesAdminToolsMessages = z.infer<typeof PagesAdminToolsSchema>;
