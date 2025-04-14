package com.toolchest.services

import com.toolchest.data.dto.TagDTO
import com.toolchest.data.dto.ToolDTO
import com.toolchest.data.entities.TagEntity
import com.toolchest.data.entities.ToolEntity
import com.toolchest.data.entities.ToolUsageStatsEntity
import com.toolchest.data.tables.Tools
import com.toolchest.data.tables.Tags
import com.toolchest.data.tables.ToolTags
import com.toolchest.data.tables.ToolUsageStats
import com.toolchest.data.dto.toDTO
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import com.github.benmanes.caffeine.cache.Caffeine
import org.jetbrains.exposed.sql.selectAll
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit

/**
 * Implementation of the ToolService interface
 */
class ToolServiceImpl : ToolService {
    
    // Cache for frequently accessed data
    private val toolCache = Caffeine.newBuilder()
        .expireAfterWrite(10, TimeUnit.MINUTES)
        .maximumSize(100)
        .build<String, Any>()
    
    // Usage tracking with concurrent map for thread safety
    private val usageCounter = ConcurrentHashMap<String, Int>()
    
    override fun getAllTools(): List<ToolDTO> {
        return transaction {
            Tools.selectAll().where { Tools.isActive eq true }
                .orderBy(Tools.displayOrder)
                .map { row ->
                    val toolId = row[Tools.id].value
                    val tool = ToolEntity.wrapRow(row).toDTO()
                    tool
                }
        }
    }
    
    override fun getToolBySlug(slug: String): ToolDTO? {
        return transaction {
            ToolEntity.find { 
                Tools.slug eq slug and (Tools.isActive eq true) 
            }.firstOrNull()?.toDTO()
        }
    }
    
    override fun getToolsByTag(tagSlug: String): List<ToolDTO> {
        return transaction {
            // Find the tag first
            val tag = TagEntity.find { Tags.slug eq tagSlug }.firstOrNull() 
                ?: return@transaction emptyList<ToolDTO>()
                
            // Get tools with this tag
            tag.tools
                .filter { it.isActive }
                .sortedBy { it.displayOrder }
                .map { it.toDTO() }
        }
    }
    
    override fun getAllTags(): List<TagDTO> {
        return transaction {
            TagEntity.all().map { it.toDTO() }
        }
    }
    
    override fun getTagBySlug(slug: String): TagDTO? {
        return transaction {
            TagEntity.find { Tags.slug eq slug }.firstOrNull()?.toDTO()
        }
    }
    
    override fun recordToolUsage(toolSlug: String) {
        // First update the in-memory counter
        usageCounter.compute(toolSlug) { _, count -> (count ?: 0) + 1 }
        
        // Then update the database
        transaction {
            // Find the tool
            val toolEntity = ToolEntity.find { Tools.slug eq toolSlug }.firstOrNull()
            
            if (toolEntity != null) {
                // Find or create usage stats record
                val statsEntity = ToolUsageStatsEntity.find { 
                    ToolUsageStats.toolId eq toolEntity.id 
                }.firstOrNull()
                
                if (statsEntity != null) {
                    // Update existing record
                    statsEntity.usageCount += 1
                    statsEntity.lastUsed = System.currentTimeMillis()
                } else {
                    // Create new record
                    ToolUsageStatsEntity.new {
                        tool = toolEntity
                        usageCount = 1
                        lastUsed = System.currentTimeMillis()
                    }
                }
            }
        }
    }
    
    override fun getPopularTools(limit: Int): List<ToolDTO> {
        return transaction {
            (ToolUsageStats innerJoin Tools)
                .slice(Tools.columns + ToolUsageStats.columns)
                .select { Tools.isActive eq true }
                .orderBy(ToolUsageStats.usageCount, SortOrder.DESC)
                .limit(limit)
                .map { row -> 
                    ToolEntity.wrapRow(row).toDTO()
                }
                .ifEmpty {
                    // Fallback to newest tools if no usage data
                    Tools.selectAll().where { Tools.isActive eq true }
                        .orderBy(Tools.id, SortOrder.DESC)
                        .limit(limit)
                        .map { row -> 
                            ToolEntity.wrapRow(row).toDTO()
                        }
                }
        }
    }
    
    override fun searchTools(query: String): List<ToolDTO> {
        // If query is empty, return all tools
        if (query.isBlank()) {
            return getAllTools()
        }
        
        // Split the query into search terms
        val terms = query.lowercase().split(" ", ",", ";").filter { it.isNotBlank() }
        
        return transaction {
            // First, find tags matching the terms
            val matchingTags = TagEntity.find {
                (Tags.name.lowerCase() inList terms) or
                (Tags.slug.lowerCase() inList terms)
            }.toList()
            
            // Get tools by matching tags
            val toolsByTags = if (matchingTags.isNotEmpty()) {
                matchingTags.flatMap { tag -> 
                    tag.tools.filter { it.isActive }
                }
            } else {
                emptyList()
            }
            
            // Get tools by direct name/description match
            val toolsByTerms = terms.flatMap { term ->
                ToolEntity.find {
                    (Tools.isActive eq true) and
                    ((Tools.name.lowerCase() like "%$term%") or
                     (Tools.description.lowerCase() like "%$term%") or
                     (Tools.slug.lowerCase() like "%$term%"))
                }.toList()
            }
            
            // Combine results and remove duplicates
            (toolsByTags + toolsByTerms)
                .distinctBy { it.id.value }
                .sortedBy { it.displayOrder }
                .map { it.toDTO() }
        }
    }
    
    override fun getToolsPaginated(offset: Int, limit: Int): List<ToolDTO> {
        return transaction {
            Tools.select { Tools.isActive eq true }
                .orderBy(Tools.displayOrder)
                .limit(limit, offset.toLong())
                .map { row -> 
                    ToolEntity.wrapRow(row).toDTO() 
                }
        }
    }
    
    override fun getToolsByTagPaginated(tagSlug: String, offset: Int, limit: Int): List<ToolDTO> {
        return transaction {
            // Find the tag
            val tag = TagEntity.find { Tags.slug eq tagSlug }.firstOrNull() 
                ?: return@transaction emptyList<ToolDTO>()
                
            // Get paginated tools with this tag
            tag.tools
                .filter { it.isActive }
                .sortedBy { it.displayOrder }
                .drop(offset)
                .take(limit)
                .map { it.toDTO() }
        }
    }
}