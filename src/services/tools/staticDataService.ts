import { serviceFactory } from "@/services/core/serviceFactory";
import { TOOL_COMPONENTS } from "@/utils/tools/componentMapper";

/**
 * Service for generating static data needed for Next.js static generation
 */
export class StaticDataService {
  /**
   * Get all tool slugs for static generation
   */
  public static async getAllToolSlugs(): Promise<string[]> {
    // When DATABASE_URL is not set (e.g. during `next build` on providers that
    // don't expose secrets in the build phase), avoid instantiating Prisma and
    // just return the compile-time list of tool components. These slugs are
    // stable and locale-independent, so it's safe for static generation.
    if (!process.env.DATABASE_URL) {
      return Object.keys(TOOL_COMPONENTS);
    }

    try {
      const toolService = serviceFactory.getToolService();
      const tools = await toolService.getAllTools("en"); // Use English as base for slugs since they're locale-independent
      return tools.map((tool) => tool.slug);
    } catch (error) {
      console.error("Error fetching tool slugs:", error);
      return [];
    }
  }

  /**
   * Get tool data for a specific slug and locale
   */
  public static async getToolData(slug: string, locale: string) {
    // Same fallback logic as above to keep build free of DB access.
    if (!process.env.DATABASE_URL) {
      return null;
    }

    try {
      const toolService = serviceFactory.getToolService();
      return await toolService.getToolBySlug(slug, locale);
    } catch (error) {
      console.error(`Error fetching tool data for ${slug}:`, error);
      return null;
    }
  }
}
