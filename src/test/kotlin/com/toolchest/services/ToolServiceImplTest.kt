package com.toolchest.services

import com.toolchest.data.entities.TagEntity
import com.toolchest.data.entities.ToolEntity
import com.toolchest.data.entities.ToolUsageStatsEntity
import com.toolchest.data.tables.Tags
import com.toolchest.data.tables.ToolTags
import com.toolchest.data.tables.Tools
import com.toolchest.data.tables.ToolUsageStats
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.SizedCollection
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.time.Instant

class ToolServiceImplTest : FunSpec({

    lateinit var service: ToolService
    val testDbFile = File("data/toolchest-test.db")

    // Inner function for seeding test data
    fun seedTestData() {
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

    beforeTest {
        // Setup test database
        testDbFile.parentFile.mkdirs()
        if (testDbFile.exists()) {
            testDbFile.delete()
        }

        Database.connect("jdbc:sqlite:${testDbFile.absolutePath}", "org.sqlite.JDBC")

        transaction {
            SchemaUtils.create(Tools, Tags, ToolTags, ToolUsageStats)

            // Create test data
            seedTestData()
        }

        service = ToolServiceImpl()
    }

    afterTest {
        transaction {
            SchemaUtils.drop(ToolUsageStats, ToolTags, Tags, Tools)
        }
        if (testDbFile.exists()) {
            testDbFile.delete()
        }
    }

    test("getAllTools should return only active tools in correct order") {
        val tools = service.getAllTools()

        // Should return only active tools
        tools shouldHaveSize 3
        tools.all { it.isActive } shouldBe true

        // Check that the tools are in the right order
        tools[0].slug shouldBe "base64"
        tools[1].slug shouldBe "json-formatter"
        tools[2].slug shouldBe "url-encoder"
    }

    test("getToolBySlug should return the correct tool") {
        val tool = service.getToolBySlug("base64")
        (tool != null) shouldBe true
        tool!!.name shouldBe "Base64 Encoder/Decoder"
        tool.iconClass shouldBe "fas fa-exchange-alt"

        // Check that tags are loaded
        tool.tags shouldHaveSize 2
        tool.tags.any { it.slug == "encoding" } shouldBe true
        tool.tags.any { it.slug == "popular" } shouldBe true

        // Test getting an inactive tool (should return null)
        val inactiveTool = service.getToolBySlug("inactive-tool")
        (inactiveTool == null) shouldBe true

        // Test getting a non-existent tool
        val nonExistentTool = service.getToolBySlug("non-existent")
        (nonExistentTool == null) shouldBe true
    }

    test("getAllTags should return all tags") {
        val tags = service.getAllTags()

        tags shouldHaveSize 3
        tags.any { it.slug == "encoding" } shouldBe true
        tags.any { it.slug == "conversion" } shouldBe true
        tags.any { it.slug == "popular" } shouldBe true
    }

    test("getTagBySlug should return the correct tag") {
        val tag = service.getTagBySlug("encoding")
        (tag != null) shouldBe true
        tag!!.name shouldBe "Encoding"
        tag.color shouldBe "#3B82F6"

        // Test getting a non-existent tag
        val nonExistentTag = service.getTagBySlug("non-existent")
        (nonExistentTag == null) shouldBe true
    }

    test("getToolsByTag should return tools with the specified tag") {
        val encodingTools = service.getToolsByTag("encoding")
        encodingTools shouldHaveSize 2
        encodingTools.any { it.slug == "base64" } shouldBe true
        encodingTools.any { it.slug == "url-encoder" } shouldBe true

        // Test with conversion tag
        val conversionTools = service.getToolsByTag("conversion")
        conversionTools shouldHaveSize 2
        conversionTools.any { it.slug == "json-formatter" } shouldBe true
        conversionTools.any { it.slug == "url-encoder" } shouldBe true

        // Test with non-existent tag
        val emptyTools = service.getToolsByTag("non-existent")
        emptyTools.shouldBeEmpty()
    }

    test("recordToolUsage should increment usage count") {
        // Record usage for base64 tool
        service.recordToolUsage("base64")

        // Check that usage was recorded
        val usageStats = transaction {
            ToolUsageStatsEntity.find { ToolUsageStats.toolId eq ToolEntity.find { Tools.slug eq "base64" }.first().id }
                .firstOrNull()
        }

        (usageStats != null) shouldBe true
        usageStats!!.usageCount shouldBe 1

        // Record usage again
        service.recordToolUsage("base64")

        // Check that usage count increased
        val updatedUsageStats = transaction {
            ToolUsageStatsEntity.find { ToolUsageStats.toolId eq ToolEntity.find { Tools.slug eq "base64" }.first().id }
                .firstOrNull()
        }

        (updatedUsageStats != null) shouldBe true
        updatedUsageStats!!.usageCount shouldBe 2

        // Test recording usage for a non-existent tool
        service.recordToolUsage("non-existent")
        // This should not throw an exception
    }

    test("getPopularTools should return tools sorted by usage") {
        // Record usage to make tools popular
        repeat(5) { service.recordToolUsage("base64") }
        repeat(3) { service.recordToolUsage("json-formatter") }
        repeat(10) { service.recordToolUsage("url-encoder") }

        val popularTools = service.getPopularTools(2)

        popularTools shouldHaveSize 2
        popularTools[0].slug shouldBe "url-encoder"  // Most popular
        popularTools[1].slug shouldBe "base64"       // Second most popular
    }
})