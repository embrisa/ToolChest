import { serviceFactory } from "@/services/core/serviceFactory";

/**
 * Service for generating static data needed for Next.js static generation
 */
export class StaticDataService {
    /**
     * Get all tool slugs for static generation
     */
    public static async getAllToolSlugs(): Promise<string[]> {
        try {
            const toolService = serviceFactory.getToolService();
            const tools = await toolService.getAllTools("en"); // Use English as base for slugs since they're locale-independent
            return tools.map(tool => tool.slug);
        } catch (error) {
            console.error("Error fetching tool slugs:", error);
            return [];
        }
    }

    /**
     * Get tool data for a specific slug and locale
     */
    public static async getToolData(slug: string, locale: string) {
        try {
            const toolService = serviceFactory.getToolService();
            return await toolService.getToolBySlug(slug, locale);
        } catch (error) {
            console.error(`Error fetching tool data for ${slug}:`, error);
            return null;
        }
    }
} 