package com.toolchest.services

import com.toolchest.MockFactory
import com.toolchest.KoinTestModule
import com.toolchest.DatabaseTestUtils
import com.toolchest.runTestWithSetup
import com.toolchest.data.dto.TagDTO
import com.toolchest.data.dto.ToolDTO
import com.toolchest.data.entities.TagEntity
import com.toolchest.data.entities.ToolEntity
import com.toolchest.data.entities.ToolUsageStatsEntity
import com.toolchest.data.tables.Tags
import com.toolchest.data.tables.ToolTags
import com.toolchest.data.tables.Tools
import com.toolchest.data.tables.ToolUsageStats
import io.mockk.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.SizedCollection
import org.jetbrains.exposed.sql.transactions.transaction
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.koin.dsl.module
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue
import kotlin.test.assertFalse

/**
 * Tests for ToolServiceImpl using TestUtils for consistent test environment
 */
class ToolServiceImplTest {

    // We no longer need manual setup and cleanup methods
    // since we're using the DatabaseTestUtils for this

    @Nested
    @DisplayName("Tool Management Tests")
    inner class ToolManagementTests {
        
        @Test
        fun `getAllTools should return only active tools in correct order`() {
            runTestWithSetup(
                useTestDatabase = true,
                tables = arrayOf(Tools, Tags, ToolTags, ToolUsageStats)
            ) {
                // Setup test data
                seedTestData()
                
                // Create service instance
                val service = ToolServiceImpl()
                
                // Execute test
                val tools = service.getAllTools()
                
                // Assertions
                assertEquals(3, tools.size)
                assertTrue(tools.all { it.isActive })
                
                // Check that the tools are in the right order
                assertEquals("base64", tools[0].slug)
                assertEquals("json-formatter", tools[1].slug)
                assertEquals("url-encoder", tools[2].slug)
            }
        }
        
        @Test
        fun `getToolBySlug should return the correct tool`() {
            runTestWithSetup(
                useTestDatabase = true,
                tables = arrayOf(Tools, Tags, ToolTags, ToolUsageStats)
            ) {
                // Setup test data
                seedTestData()
                
                // Create service instance
                val service = ToolServiceImpl()
                
                // Execute test
                val tool = service.getToolBySlug("base64")
                
                // Assertions
                assertNotNull(tool)
                assertEquals("Base64 Encoder/Decoder", tool.name)
                assertEquals("fas fa-exchange-alt", tool.iconClass)
                
                // Check that tags are loaded
                assertEquals(2, tool.tags.size)
                assertTrue(tool.tags.any { it.slug == "encoding" })
                assertTrue(tool.tags.any { it.slug == "popular" })
                
                // Test getting an inactive tool (should return null)
                val inactiveTool = service.getToolBySlug("inactive-tool")
                assertNull(inactiveTool)
                
                // Test getting a non-existent tool
                val nonExistentTool = service.getToolBySlug("non-existent")
                assertNull(nonExistentTool)
            }
        }
    }
    
    @Nested
    @DisplayName("Tag Management Tests")
    inner class TagManagementTests {
        
        @Test
        fun `getAllTags should return all tags`() {
            runTestWithSetup(
                useTestDatabase = true,
                tables = arrayOf(Tools, Tags, ToolTags, ToolUsageStats)
            ) {
                // Setup test data
                seedTestData()
                
                // Create service instance
                val service = ToolServiceImpl()
                
                // Execute test
                val tags = service.getAllTags()
                
                // Assertions
                assertEquals(3, tags.size)
                assertTrue(tags.any { it.slug == "encoding" })
                assertTrue(tags.any { it.slug == "conversion" })
                assertTrue(tags.any { it.slug == "popular" })
            }
        }
        
        @Test
        fun `getTagBySlug should return the correct tag`() {
            runTestWithSetup(
                useTestDatabase = true,
                tables = arrayOf(Tools, Tags, ToolTags, ToolUsageStats)
            ) {
                // Setup test data
                seedTestData()
                
                // Create service instance
                val service = ToolServiceImpl()
                
                // Execute test
                val tag = service.getTagBySlug("encoding")
                
                // Assertions
                assertNotNull(tag)
                assertEquals("Encoding", tag.name)
                assertEquals("#3B82F6", tag.color)
                
                // Test getting a non-existent tag
                val nonExistentTag = service.getTagBySlug("non-existent")
                assertNull(nonExistentTag)
            }
        }
        
        @Test
        fun `getToolsByTag should return tools with the specified tag`() {
            runTestWithSetup(
                useTestDatabase = true,
                tables = arrayOf(Tools, Tags, ToolTags, ToolUsageStats)
            ) {
                // Setup test data
                seedTestData()
                
                // Create service instance
                val service = ToolServiceImpl()
                
                // Execute test
                val encodingTools = service.getToolsByTag("encoding")
                
                // Assertions
                assertEquals(2, encodingTools.size)
                assertTrue(encodingTools.any { it.slug == "base64" })
                assertTrue(encodingTools.any { it.slug == "url-encoder" })
                
                // Test with conversion tag
                val conversionTools = service.getToolsByTag("conversion")
                assertEquals(2, conversionTools.size)
                assertTrue(conversionTools.any { it.slug == "json-formatter" })
                assertTrue(conversionTools.any { it.slug == "url-encoder" })
                
                // Test with non-existent tag
                val emptyTools = service.getToolsByTag("non-existent")
                assertTrue(emptyTools.isEmpty())
            }
        }
    }
    
    @Nested
    @DisplayName("Usage Statistics Tests")
    inner class UsageStatisticsTests {
        
        @Test
        fun `recordToolUsage should increment usage count`() {
            runTestWithSetup(
                useTestDatabase = true,
                tables = arrayOf(Tools, Tags, ToolTags, ToolUsageStats)
            ) {
                // Setup test data
                seedTestData()
                
                // Create service instance
                val service = ToolServiceImpl()
                
                // Execute test
                service.recordToolUsage("base64")
                
                // Assertions - check that usage was recorded
                val usageStats = transaction {
                    ToolUsageStatsEntity.find { 
                        ToolUsageStats.toolId eq ToolEntity.find { 
                            Tools.slug eq "base64" 
                        }.first().id 
                    }.firstOrNull()
                }
                
                assertNotNull(usageStats)
                assertEquals(1, usageStats.usageCount)
                
                // Record usage again
                service.recordToolUsage("base64")
                
                // Check that usage count increased
                val updatedUsageStats = transaction {
                    ToolUsageStatsEntity.find { 
                        ToolUsageStats.toolId eq ToolEntity.find { 
                            Tools.slug eq "base64" 
                        }.first().id 
                    }.firstOrNull()
                }
                
                assertNotNull(updatedUsageStats)
                assertEquals(2, updatedUsageStats.usageCount)
                
                // Test recording usage for a non-existent tool
                service.recordToolUsage("non-existent")
                // This should not throw an exception
            }
        }
        
        @Test
        fun `getPopularTools should return tools sorted by usage`() {
            runTestWithSetup(
                useTestDatabase = true,
                tables = arrayOf(Tools, Tags, ToolTags, ToolUsageStats)
            ) {
                // Setup test data
                seedTestData()
                
                // Create service instance
                val service = ToolServiceImpl()
                
                // Record usage to make tools popular
                repeat(5) { service.recordToolUsage("base64") }
                repeat(3) { service.recordToolUsage("json-formatter") }
                repeat(10) { service.recordToolUsage("url-encoder") }
                
                // Execute test
                val popularTools = service.getPopularTools(2)
                
                // Assertions
                assertEquals(2, popularTools.size)
                assertEquals("url-encoder", popularTools[0].slug)  // Most popular
                assertEquals("base64", popularTools[1].slug)       // Second most popular
            }
        }
    }
    
    @Nested
    @DisplayName("Search Tests")
    inner class SearchTests {
        
        @Test
        fun `searchTools should find tools by name and description`() {
            runTestWithSetup(
                useTestDatabase = true,
                tables = arrayOf(Tools, Tags, ToolTags, ToolUsageStats)
            ) {
                // Setup test data
                seedTestData()
                
                // Create service instance
                val service = ToolServiceImpl()
                
                // Search by name
                val encoderResults = service.searchTools("encoder")
                assertTrue(encoderResults.size >= 2)
                assertTrue(encoderResults.any { it.slug == "base64" })
                assertTrue(encoderResults.any { it.slug == "url-encoder" })
                
                // Search by description fragment
                val formatResults = service.searchTools("format")
                assertTrue(formatResults.any { it.slug == "json-formatter" })
                
                // Search by tag name
                val encodingResults = service.searchTools("encoding")
                assertTrue(encodingResults.any { it.slug == "base64" })
                assertTrue(encodingResults.any { it.slug == "url-encoder" })
                
                // Empty search should return all active tools
                val allTools = service.searchTools("")
                assertEquals(service.getAllTools().size, allTools.size)
                
                // Test non-matching search
                val emptyResults = service.searchTools("nonexistentterm")
                assertTrue(emptyResults.isEmpty())
            }
        }
    }
    
    @Nested
    @DisplayName("Pagination Tests")
    inner class PaginationTests {
        
        @Test
        fun `getToolsPaginated should return correct page of tools`() {
            runTestWithSetup(
                useTestDatabase = true,
                tables = arrayOf(Tools, Tags, ToolTags, ToolUsageStats)
            ) {
                // Setup test data
                seedTestData()
                
                // Create service instance
                val service = ToolServiceImpl()
                
                // Get first page with limit 2
                val firstPage = service.getToolsPaginated(0, 2)
                assertEquals(2, firstPage.size)
                assertEquals("base64", firstPage[0].slug)
                assertEquals("json-formatter", firstPage[1].slug)
                
                // Get second page with limit 2
                val secondPage = service.getToolsPaginated(2, 2)
                assertEquals(1, secondPage.size)
                assertEquals("url-encoder", secondPage[0].slug)
                
                // Get a page beyond available tools
                val emptyPage = service.getToolsPaginated(10, 2)
                assertTrue(emptyPage.isEmpty())
            }
        }
        
        @Test
        fun `getToolsByTagPaginated should return correct page of tools for tag`() {
            runTestWithSetup(
                useTestDatabase = true,
                tables = arrayOf(Tools, Tags, ToolTags, ToolUsageStats)
            ) {
                // Setup test data
                seedTestData()
                
                // Create service instance
                val service = ToolServiceImpl()
                
                // Get first page of encoding tools with limit 1
                val encodingPage = service.getToolsByTagPaginated("encoding", 0, 1)
                assertEquals(1, encodingPage.size)
                assertEquals("base64", encodingPage[0].slug)
                
                // Get second page of encoding tools
                val encodingPage2 = service.getToolsByTagPaginated("encoding", 1, 1)
                assertEquals(1, encodingPage2.size)
                assertEquals("url-encoder", encodingPage2[0].slug)
                
                // Get page beyond available tools for tag
                val emptyPage = service.getToolsByTagPaginated("encoding", 10, 1)
                assertTrue(emptyPage.isEmpty())
                
                // Get page for non-existent tag
                val nonExistentTagPage = service.getToolsByTagPaginated("non-existent", 0, 10)
                assertTrue(nonExistentTagPage.isEmpty())
            }
        }
    }

    // Alternative demonstration using the withTestDatabase helper
    @Test
    fun `withTestDatabase example - getAllTools should work correctly`() {
        DatabaseTestUtils.withTestDatabase(Tools, Tags, ToolTags, ToolUsageStats) {
            // In a test database context
            seedTestData()
            
            val service = ToolServiceImpl()
            val tools = service.getAllTools()
            
            assertEquals(3, tools.size)
            assertTrue(tools.all { it.isActive })
            assertEquals("base64", tools[0].slug)
            assertEquals("json-formatter", tools[1].slug)
            assertEquals("url-encoder", tools[2].slug)
        }
    }
    
    // Helper function to seed test data
    private fun seedTestData() {
        transaction {
            // We don't need to drop tables since DatabaseTestUtils handles this
            
            // Create test tags
            val encodingTag = TagEntity.new {
                name = "Encoding"
                slug = "encoding"
                description = "Encoding and decoding tools"
                color = "#3B82F6" // blue
                createdAt = Instant.now().toEpochMilli()
            }
            
            val conversionTag = TagEntity.new {
                name = "Conversion"
                slug = "conversion"
                description = "Data conversion tools"
                color = "#10B981" // green
                createdAt = Instant.now().toEpochMilli()
            }
            
            val popularTag = TagEntity.new {
                name = "Popular"
                slug = "popular"
                description = "Popular tools"
                color = "#EF4444" // red
                createdAt = Instant.now().toEpochMilli()
            }
            
            // Create test tools
            val base64Tool = ToolEntity.new {
                name = "Base64 Encoder/Decoder"
                slug = "base64"
                description = "Encode or decode text and files using Base64"
                iconClass = "fas fa-exchange-alt"
                displayOrder = 1
                isActive = true
                createdAt = Instant.now().toEpochMilli()
                updatedAt = Instant.now().toEpochMilli()
            }
            
            val jsonTool = ToolEntity.new {
                name = "JSON Formatter"
                slug = "json-formatter"
                description = "Format and validate JSON data"
                iconClass = "fas fa-code"
                displayOrder = 2
                isActive = true
                createdAt = Instant.now().toEpochMilli()
                updatedAt = Instant.now().toEpochMilli()
            }
            
            val urlTool = ToolEntity.new {
                name = "URL Encoder/Decoder"
                slug = "url-encoder"
                description = "Encode or decode URL parameters"
                iconClass = "fas fa-link"
                displayOrder = 3
                isActive = true
                createdAt = Instant.now().toEpochMilli()
                updatedAt = Instant.now().toEpochMilli()
            }
            
            // Inactive tool for testing filtering
            ToolEntity.new {
                name = "Inactive Tool"
                slug = "inactive-tool"
                description = "This tool is inactive"
                iconClass = "fas fa-ban"
                displayOrder = 4
                isActive = false
                createdAt = Instant.now().toEpochMilli()
                updatedAt = Instant.now().toEpochMilli()
            }
            
            // Associate tools with tags
            base64Tool.tags = SizedCollection(listOf(encodingTag, popularTag))
            jsonTool.tags = SizedCollection(listOf(conversionTag))
            urlTool.tags = SizedCollection(listOf(encodingTag, conversionTag))
        }
    }
}