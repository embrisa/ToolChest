package com.toolchest.data.dto

import com.toolchest.data.entities.TagEntity
import com.toolchest.data.entities.ToolEntity
import com.toolchest.data.entities.ToolUsageStatsEntity
import com.toolchest.data.tables.ToolUsageStats
import org.jetbrains.exposed.sql.transactions.transaction

/**
 * Data Transfer Objects for ToolChest
 */

/**
 * Represents a tool for display and API purposes
 */
data class ToolDTO(
    val id: Int,
    val name: String,
    val slug: String,
    val description: String,
    val iconClass: String?,
    val displayOrder: Int,
    val isActive: Boolean,
    val tags: List<TagDTO> = emptyList(),
    val usageCount: Int = 0
)

/**
 * Represents a tag for display and API purposes
 */
data class TagDTO(
    val id: Int,
    val name: String,
    val slug: String,
    val description: String? = null,
    val color: String,
    val toolCount: Int = 0
)

/**
 * Extension function to convert ToolEntity to ToolDTO
 */
fun ToolEntity.toDTO(): ToolDTO = transaction {
    ToolDTO(
        id = this@toDTO.id.value,
        name = name,
        slug = slug,
        description = description,
        iconClass = iconClass,
        displayOrder = displayOrder,
        isActive = isActive,
        tags = tags.map { it.toDTO() },
        usageCount = ToolUsageStatsEntity.find { ToolUsageStats.toolId eq this@toDTO.id }
            .firstOrNull()?.usageCount ?: 0
    )
}

/**
 * Extension function to convert TagEntity to TagDTO
 */
fun TagEntity.toDTO(): TagDTO = transaction {
    TagDTO(
        id = this@toDTO.id.value,
        name = name,
        slug = slug,
        description = description,
        color = color,
        toolCount = tools.count().toInt()
    )
}