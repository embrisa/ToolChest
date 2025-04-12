package com.toolchest.data.tables

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Table

/**
 * Database table definitions for ToolChest
 */

object Tools : IntIdTable() {
    val name = varchar("name", 100)
    val slug = varchar("slug", 100).uniqueIndex()
    val description = text("description")
    val iconClass = varchar("icon_class", 50).nullable()
    val displayOrder = integer("display_order").default(999)
    val isActive = bool("is_active").default(true)
    val createdAt = long("created_at")
    val updatedAt = long("updated_at")
}

object Tags : IntIdTable() {
    val name = varchar("name", 50).uniqueIndex()
    val slug = varchar("slug", 50).uniqueIndex()
    val description = text("description").nullable()
    val color = varchar("color", 7).default("#6B7280") // Default gray color hex
    val createdAt = long("created_at")
}

object ToolTags : Table() {
    val id = integer("id").autoIncrement()
    val toolId = reference("tool_id", Tools)
    val tagId = reference("tag_id", Tags)
    
    override val primaryKey = PrimaryKey(id)
    init {
        uniqueIndex(toolId, tagId) // Prevent duplicate tool-tag relationships
    }
}

object ToolUsageStats : IntIdTable() {
    val toolId = reference("tool_id", Tools)
    val usageCount = integer("usage_count").default(0)
    val lastUsed = long("last_used")
}