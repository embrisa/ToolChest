import { Tool, Tag } from "@prisma/client";

export type TranslatedTool = Tool;
export type TranslatedTag = Tag;

/**
 * Service for resolving database translation keys to localized text
 */
export class DatabaseTranslationService {
  /**
   * Translate a single tool by resolving its translation keys
   */
  static async translateTool(
    tool: Tool,
    _locale: string = "en",
  ): Promise<TranslatedTool> {
    // For now, just return the tool as-is since the schema already has name/description fields
    // This service was prepared for a future schema migration that hasn't happened yet
    return tool;
  }

  /**
   * Translate multiple tools
   */
  static async translateTools(
    tools: Tool[],
    locale: string = "en",
  ): Promise<TranslatedTool[]> {
    return Promise.all(tools.map((tool) => this.translateTool(tool, locale)));
  }

  /**
   * Translate a single tag by resolving its translation keys
   */
  static async translateTag(
    tag: Tag,
    _locale: string = "en",
  ): Promise<TranslatedTag> {
    // For now, just return the tag as-is since the schema migration may not be complete
    // This service was prepared for a future schema migration 
    return tag;
  }

  /**
   * Translate multiple tags
   */
  static async translateTags(
    tags: Tag[],
    locale: string = "en",
  ): Promise<TranslatedTag[]> {
    return Promise.all(tags.map((tag) => this.translateTag(tag, locale)));
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
