package com.toolchest.data.entities

import com.toolchest.data.tables.Tags
import com.toolchest.data.tables.Tools
import com.toolchest.data.tables.ToolTags
import com.toolchest.data.tables.ToolUsageStats
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID

/**
 * Entity classes for ToolChest database tables
 */

class ToolEntity(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<ToolEntity>(Tools)

    var name by Tools.name
    var slug by Tools.slug
    var description by Tools.description
    var iconClass by Tools.iconClass
    var displayOrder by Tools.displayOrder
    var isActive by Tools.isActive
    var createdAt by Tools.createdAt
    var updatedAt by Tools.updatedAt
    var tags by TagEntity via ToolTags
}

class TagEntity(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<TagEntity>(Tags)

    var name by Tags.name
    var slug by Tags.slug
    var description by Tags.description
    var color by Tags.color
    var createdAt by Tags.createdAt
    var tools by ToolEntity via ToolTags
}

class ToolUsageStatsEntity(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<ToolUsageStatsEntity>(ToolUsageStats)

    var tool by ToolEntity referencedOn ToolUsageStats.toolId
    var usageCount by ToolUsageStats.usageCount
    var lastUsed by ToolUsageStats.lastUsed
}