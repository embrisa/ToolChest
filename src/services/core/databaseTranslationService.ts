/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Tool, Tag } from "@prisma/client";

export type TranslatedTool = Tool & {
  name: string;
  description: string | null;
};

export type TranslatedTag = Tag & {
  name: string;
  description: string | null;
};

/**
 * Service for resolving database translation keys to localized text
 */
export class DatabaseTranslationService {
  /**
   * Load database translations for the given locale
   */
  private static async loadDatabaseTranslations(locale: string = "en") {
    try {
      const translations = await import(`../../../messages/database/${locale}.json`);
      return translations.default;
    } catch (error) {
      console.warn(`Failed to load database translations for locale ${locale}, falling back to English`);
      if (locale !== "en") {
        try {
          const fallbackTranslations = await import(`../../../messages/database/en.json`);
          return fallbackTranslations.default;
        } catch (fallbackError) {
          console.error("Failed to load fallback English database translations", fallbackError);
          return { tools: {}, tags: {} };
        }
      }
      return { tools: {}, tags: {} };
    }
  }

  /**
   * Translate a single tool by resolving its translation keys
   */
  static async translateTool(
    tool: Tool,
    locale: string = "en",
  ): Promise<TranslatedTool> {
    const translations = await this.loadDatabaseTranslations(locale);

    const translatedName = translations.tools?.[tool.toolKey]?.name || tool.nameKey;
    const translatedDescription = tool.descriptionKey
      ? translations.tools?.[tool.toolKey]?.description || tool.descriptionKey
      : null;

    return {
      ...tool,
      name: translatedName,
      description: translatedDescription,
    };
  }

  /**
   * Translate multiple tools
   */
  static async translateTools(
    tools: Tool[],
    locale: string = "en",
  ): Promise<TranslatedTool[]> {
    const translations = await this.loadDatabaseTranslations(locale);

    return tools.map(tool => {
      const translatedName = translations.tools?.[tool.toolKey]?.name || tool.nameKey;
      const translatedDescription = tool.descriptionKey
        ? translations.tools?.[tool.toolKey]?.description || tool.descriptionKey
        : null;

      return {
        ...tool,
        name: translatedName,
        description: translatedDescription,
      };
    });
  }

  /**
   * Translate a single tag by resolving its translation keys
   */
  static async translateTag(
    tag: Tag,
    locale: string = "en",
  ): Promise<TranslatedTag> {
    const translations = await this.loadDatabaseTranslations(locale);

    const translatedName = translations.tags?.[tag.tagKey]?.name || tag.nameKey;
    const translatedDescription = tag.descriptionKey
      ? translations.tags?.[tag.tagKey]?.description || tag.descriptionKey
      : null;

    return {
      ...tag,
      name: translatedName,
      description: translatedDescription,
    };
  }

  /**
   * Translate multiple tags
   */
  static async translateTags(
    tags: Tag[],
    locale: string = "en",
  ): Promise<TranslatedTag[]> {
    const translations = await this.loadDatabaseTranslations(locale);

    return tags.map(tag => {
      const translatedName = translations.tags?.[tag.tagKey]?.name || tag.nameKey;
      const translatedDescription = tag.descriptionKey
        ? translations.tags?.[tag.tagKey]?.description || tag.descriptionKey
        : null;

      return {
        ...tag,
        name: translatedName,
        description: translatedDescription,
      };
    });
  }

  /**
   * Get translation key for a tool name
   */
  static getToolNameKey(toolKey: string): string {
    return `tools.${toolKey}.name`;
  }

  /**
   * Get translation key for a tool description
   */
  static getToolDescriptionKey(toolKey: string): string {
    return `tools.${toolKey}.description`;
  }

  /**
   * Get translation key for a tag name
   */
  static getTagNameKey(tagKey: string): string {
    return `tags.${tagKey}.name`;
  }

  /**
   * Get translation key for a tag description
   */
  static getTagDescriptionKey(tagKey: string): string {
    return `tags.${tagKey}.description`;
  }

  /**
   * Generate database records with proper translation keys
   */
  static generateToolRecord(toolKey: string, additionalData?: Partial<Tool>) {
    return {
      toolKey,
      slug: toolKey,
      nameKey: this.getToolNameKey(toolKey),
      descriptionKey: this.getToolDescriptionKey(toolKey),
      ...additionalData,
    };
  }

  /**
   * Generate database records with proper translation keys
   */
  static generateTagRecord(tagKey: string, additionalData?: Partial<Tag>) {
    return {
      tagKey,
      slug: tagKey,
      nameKey: this.getTagNameKey(tagKey),
      descriptionKey: this.getTagDescriptionKey(tagKey),
      ...additionalData,
    };
  }
}

/**
 * Hook-like function for server components to get translated database content
 */
export async function getTranslatedTools(
  tools: Tool[],
  locale: string = "en",
): Promise<TranslatedTool[]> {
  return DatabaseTranslationService.translateTools(tools, locale);
}

export async function getTranslatedTags(
  tags: Tag[],
  locale: string = "en",
): Promise<TranslatedTag[]> {
  return DatabaseTranslationService.translateTags(tags, locale);
}
