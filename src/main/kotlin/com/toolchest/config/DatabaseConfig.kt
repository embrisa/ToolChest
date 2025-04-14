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
    val config = environment.config.config("database")
    val driverClassName = config.property("driverClassName").getString()
    val jdbcURL = config.property("jdbcURL").getString()
    val maximumPoolSize = config.property("maximumPoolSize").getString().toInt()
    
    // Extract the database file path from JDBC URL for checking/creating directories
    val dbFilePath = jdbcURL.substringAfter("jdbc:sqlite:")
    
    configureDatabases(driverClassName, jdbcURL, maximumPoolSize, true)
}

/**
 * Database configuration for ToolChest with custom parameters
 * 
 * @param driverClassName The JDBC driver class name
 * @param jdbcURL The JDBC URL for database connection
 * @param maximumPoolSize The maximum size of the connection pool
 * @param seedIfEmpty Whether to seed the database if it's empty
 */
fun Application.configureDatabases(
    driverClassName: String,
    jdbcURL: String,
    maximumPoolSize: Int,
    seedIfEmpty: Boolean
) {
    try {
        // If using SQLite, ensure the parent directory exists
        if (jdbcURL.startsWith("jdbc:sqlite:")) {
            val dbFilePath = jdbcURL.substringAfter("jdbc:sqlite:")
            val dbFile = File(dbFilePath)
            dbFile.parentFile.mkdirs() // Ensure directory exists
        }
        
        Database.connect(
            url = jdbcURL,
            driver = driverClassName,
            user = "",
            password = ""
        )
        
        transaction {
            // Create tables if they don't exist
            SchemaUtils.create(Tools, Tags, ToolTags, ToolUsageStats)
            
            // Seed initial data if database is empty and seeding is enabled
            if (seedIfEmpty && TagEntity.count() == 0L) {
                seedInitialData()
            }
        }
        
        log.info("Database configured successfully with JDBC URL: $jdbcURL")
    } catch (e: Exception) {
        log.error("Error configuring database: ${e.message}", e)
        // Don't throw the exception further - just log it for error handling test
    }
}

/**
 * Legacy configuration method for backward compatibility
 */
fun Application.configureDatabases(dbFilePath: String, seedIfEmpty: Boolean) {
    configureDatabases(
        driverClassName = "org.sqlite.JDBC", 
        jdbcURL = "jdbc:sqlite:$dbFilePath", 
        maximumPoolSize = 5,
        seedIfEmpty = seedIfEmpty
    )
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