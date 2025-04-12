package com.toolchest.services

import com.toolchest.data.dto.TagDTO
import com.toolchest.data.dto.ToolDTO
import com.toolchest.data.dto.toDTO
import com.toolchest.data.entities.TagEntity
import com.toolchest.data.entities.ToolEntity
import com.toolchest.data.entities.ToolUsageStatsEntity
import com.toolchest.data.tables.ToolUsageStats
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.Instant

/**
 * Implementation of the ToolService interface
 */
class ToolServiceImpl : ToolService {
    
    override fun getAllTools(): List<ToolDTO> = transaction {
        ToolEntity.find { com.toolchest.data.tables.Tools.isActive eq true }
            .orderBy(com.toolchest.data.tables.Tools.displayOrder to SortOrder.ASC)
            .map { it.toDTO() }
    }
    
    override fun getToolBySlug(slug: String): ToolDTO? = transaction {
        ToolEntity.find { 
            (com.toolchest.data.tables.Tools.slug eq slug) and 
            (com.toolchest.data.tables.Tools.isActive eq true) 
        }.firstOrNull()?.toDTO()
    }
    
    override fun getToolsByTag(tagSlug: String): List<ToolDTO> = transaction {
        TagEntity.find { com.toolchest.data.tables.Tags.slug eq tagSlug }
            .firstOrNull()
            ?.tools
            ?.filter { it.isActive }
            ?.sortedBy { it.displayOrder }
            ?.map { it.toDTO() }
            ?: emptyList()
    }
    
    override fun getAllTags(): List<TagDTO> = transaction {
        TagEntity.all()
            .map { it.toDTO() }
            .sortedBy { it.name }
    }
    
    override fun getTagBySlug(slug: String): TagDTO? = transaction {
        TagEntity.find { com.toolchest.data.tables.Tags.slug eq slug }
            .firstOrNull()
            ?.toDTO()
    }
    
    override fun recordToolUsage(toolSlug: String) = transaction {
        val tool = ToolEntity.find { com.toolchest.data.tables.Tools.slug eq toolSlug }
            .firstOrNull() ?: return@transaction
        
        val now = Instant.now().toEpochMilli()
        val usageStat = ToolUsageStatsEntity.find { ToolUsageStats.toolId eq tool.id }
            .firstOrNull()
            
        if (usageStat != null) {
            usageStat.usageCount++
            usageStat.lastUsed = now
        } else {
            ToolUsageStatsEntity.new {
                this.tool = tool
                this.usageCount = 1
                this.lastUsed = now
            }
        }
    }
    
    override fun getPopularTools(limit: Int): List<ToolDTO> = transaction {
        // Find active tools with usage stats, ordered by usage count
        ToolUsageStatsEntity.all()
            .orderBy(ToolUsageStats.usageCount to SortOrder.DESC)
            .limit(limit)
            .map { it.tool }
            .filter { it.isActive }
            .map { it.toDTO() }
    }
}