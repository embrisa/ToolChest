export interface ToolTranslations {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  page: {
    title: string;
    description: string;
  };
  tool: Record<string, any>;
  validation: Record<string, string>;
  info: {
    title: string;
    description: string;
    keyFeatures?: {
      title: string;
      items: string[];
    };
    useCases?: {
      title: string;
      items: string[];
    };
    security?: {
      title: string;
      items: string[];
    };
  };
}

export interface CommonToolTranslations {
  ui: {
    modes: Record<string, string>;
    inputTypes: Record<string, string>;
    actions: Record<string, string>;
    status: Record<string, string>;
    placeholders: Record<string, string>;
  };
  validation: Record<string, string>;
  privacy: Record<string, string>;
  features: Record<string, string>;
  errors: Record<string, string>;
}

/**
 * Load tool-specific translations and merge with common tool translations
 */
export async function getToolTranslations(
  toolSlug: string,
  locale: string = "en",
): Promise<{
  common: CommonToolTranslations;
  tool: ToolTranslations;
}> {
  try {
    // Load common tool translations
    const commonMessages = await import(
      `../../../messages/tools/common/${locale}.json`
    );

    // Load tool-specific translations
    const toolMessages = await import(
      `../../../messages/tools/${toolSlug}/${locale}.json`
    );

    return {
      common: commonMessages.default,
      tool: toolMessages.default,
    };
  } catch (error) {
    // Fallback to English if locale not found
    if (locale !== "en") {
      return getToolTranslations(toolSlug, "en");
    }

    console.error(error);
    throw new Error(`Tool translations not found for: ${toolSlug}`);
  }
}

/**
 * Get all available tool translation files
 */
export async function getAvailableTools(): Promise<string[]> {
  // This would be dynamically populated in a real implementation
  // For now, return the tools we know exist
  return ["base64", "hash-generator"];
}

/**
 * Merge tool translations with a specific pattern for easy access
 */
export function mergeToolTranslations(
  common: CommonToolTranslations,
  tool: ToolTranslations,
) {
  return {
    // Expose common patterns with tool-specific overrides
    ui: {
      ...common.ui,
      ...tool.tool,
    },
    validation: {
      ...common.validation,
      ...tool.validation,
    },
    metadata: tool.metadata,
    page: tool.page,
    info: tool.info,
    privacy: common.privacy,
    features: common.features,
    errors: {
      ...common.errors,
    },
  };
}

/**
 * Hook-like function for components to use tool translations
 */
export async function useToolTranslations(
  toolSlug: string,
  locale: string = "en",
) {
  const { common, tool } = await getToolTranslations(toolSlug, locale);
  return mergeToolTranslations(common, tool);
}

/**
 * Get tool translations with proper merged structure
 */
export async function getToolTranslationsForPage(
  toolSlug: string,
  locale: string = "en",
) {
  const { common, tool } = await getToolTranslations(toolSlug, locale);
  return mergeToolTranslations(common, tool);
}
