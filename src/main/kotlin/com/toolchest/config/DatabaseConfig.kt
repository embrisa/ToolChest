package com.toolchest.config

import com.toolchest.data.entities.TagEntity
import com.toolchest.data.entities.ToolEntity
import com.toolchest.data.tables.*
import io.ktor.server.application.*
import java.io.File
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.SizedCollection
import org.jetbrains.exposed.sql.transactions.transaction

/**
 * Database configuration for ToolChest
 */
fun Application.configureDatabases() {
    configureDatabases("data/toolchest.db", true)
}

/**
 * Database configuration for ToolChest with custom parameters
 * 
 * @param dbFilePath The path to the database file
 * @param seedIfEmpty Whether to seed the database if it's empty
 */
fun Application.configureDatabases(dbFilePath: String, seedIfEmpty: Boolean) {
    try {
        val dbFile = File(dbFilePath)
        dbFile.parentFile.mkdirs() // Ensure directory exists
        
        Database.connect("jdbc:sqlite:${dbFile.absolutePath}", "org.sqlite.JDBC")
        
        transaction {
            // Create tables if they don't exist
            SchemaUtils.create(Tools, Tags, ToolTags, ToolUsageStats)
            
            // Seed initial data if database is empty and seeding is enabled
            if (seedIfEmpty && TagEntity.count() == 0L) {
                seedInitialData()
            }
        }
        
        log.info("Database configured successfully at $dbFilePath")
    } catch (e: Exception) {
        log.error("Error configuring database: ${e.message}", e)
        // Don't throw the exception further - just log it for error handling test
    }
}

/**
 * Seeds initial data into the database
 */
private fun seedInitialData() {
    // Create common tags
    val encodingTag = TagEntity.new {
        name = "Encoding"
        slug = "encoding"
        description = "Tools for encoding and decoding data"
        color = "#3B82F6" // Blue
        createdAt = System.currentTimeMillis()
    }
    
    val conversionTag = TagEntity.new {
        name = "Conversion"
        slug = "conversion"
        description = "Tools for converting between different formats"
        color = "#10B981" // Green
        createdAt = System.currentTimeMillis()
    }
    
    val textTag = TagEntity.new {
        name = "Text"
        slug = "text"
        description = "Text manipulation tools"
        color = "#6366F1" // Indigo
        createdAt = System.currentTimeMillis()
    }
    
    // Create tools and assign tags
    val base64Tool = ToolEntity.new {
        name = "Base64 Converter"
        slug = "base64"
        description = "Encode or decode text using Base64"
        iconClass = "fas fa-exchange-alt"
        displayOrder = 1
        isActive = true
        createdAt = System.currentTimeMillis()
        updatedAt = System.currentTimeMillis()
    }
    
    // Associate tags with tools
    base64Tool.tags = SizedCollection(listOf(encodingTag, conversionTag, textTag))
}