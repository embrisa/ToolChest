package com.toolchest.services

import com.toolchest.data.dto.TagDTO
import com.toolchest.data.dto.ToolDTO

/**
 * Service interface for handling tool and tag operations
 */
interface ToolService {
    /**
     * Retrieves all active tools
     */
    fun getAllTools(): List<ToolDTO>
    
    /**
     * Retrieves a specific tool by its slug
     * @param slug The tool's unique slug
     * @return The tool or null if not found
     */
    fun getToolBySlug(slug: String): ToolDTO?
    
    /**
     * Retrieves tools that have a specific tag
     * @param tagSlug The tag's unique slug
     * @return List of tools with the specified tag
     */
    fun getToolsByTag(tagSlug: String): List<ToolDTO>
    
    /**
     * Retrieves all available tags
     */
    fun getAllTags(): List<TagDTO>
    
    /**
     * Retrieves a specific tag by its slug
     * @param slug The tag's unique slug
     * @return The tag or null if not found
     */
    fun getTagBySlug(slug: String): TagDTO?
    
    /**
     * Records tool usage for analytics
     * @param toolSlug The slug of the tool being used
     */
    fun recordToolUsage(toolSlug: String)
    
    /**
     * Gets the most popular tools based on usage count
     * @param limit Maximum number of tools to return
     * @return List of popular tools sorted by usage count
     */
    fun getPopularTools(limit: Int = 5): List<ToolDTO>
    
    /**
     * Search for tools by query string
     * @param query The search query
     * @return List of tools matching the query
     */
    fun searchTools(query: String): List<ToolDTO>
    
    /**
     * Get a paginated list of tools
     * @param offset Number of tools to skip
     * @param limit Maximum number of tools to return
     * @return List of tools
     */
    fun getToolsPaginated(offset: Int, limit: Int): List<ToolDTO>
    
    /**
     * Get a paginated list of tools by tag
     * @param tagSlug The tag's unique slug
     * @param offset Number of tools to skip
     * @param limit Maximum number of tools to return
     * @return List of tools with the specified tag
     */
    fun getToolsByTagPaginated(tagSlug: String, offset: Int, limit: Int): List<ToolDTO>
}