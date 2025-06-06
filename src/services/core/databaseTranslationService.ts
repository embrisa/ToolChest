import { getTranslations } from "next-intl/server";
import { Tool, Tag } from "@prisma/client";

interface ToolWithKeys extends Tool {
  nameKey?: string;
  descriptionKey?: string | null;
}

interface TagWithKeys extends Tag {
  nameKey?: string;
  descriptionKey?: string | null;
}

export interface TranslatedTool
  extends Omit<ToolWithKeys, "nameKey" | "descriptionKey"> {
  name: string;
  description: string | null;
}

export interface TranslatedTag
  extends Omit<TagWithKeys, "nameKey" | "descriptionKey"> {
  name: string;
  description: string | null;
}

/**
 * Service for resolving database translation keys to localized text
 */
export class DatabaseTranslationService {
  /**
   * Translate a single tool by resolving its translation keys
   */
  static async translateTool(
    tool: ToolWithKeys,
    locale: string = "en",
  ): Promise<TranslatedTool> {
    const t = await getTranslations({ locale, namespace: "database" });

    const name = tool.nameKey ? t(tool.nameKey) : tool.slug;
    const description = tool.descriptionKey ? t(tool.descriptionKey) : null;

    return {
      ...tool,
      name,
      description,
    };
  }

  /**
   * Translate multiple tools
   */
  static async translateTools(
    tools: ToolWithKeys[],
    locale: string = "en",
  ): Promise<TranslatedTool[]> {
    return Promise.all(tools.map((tool) => this.translateTool(tool, locale)));
  }

  /**
   * Translate a single tag by resolving its translation keys
   */
  static async translateTag(
    tag: TagWithKeys,
    locale: string = "en",
  ): Promise<TranslatedTag> {
    const t = await getTranslations({ locale, namespace: "database" });

    const name = tag.nameKey ? t(tag.nameKey) : tag.slug;
    const description = tag.descriptionKey ? t(tag.descriptionKey) : null;

    return {
      ...tag,
      name,
      description,
    };
  }

  /**
   * Translate multiple tags
   */
  static async translateTags(
    tags: TagWithKeys[],
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
