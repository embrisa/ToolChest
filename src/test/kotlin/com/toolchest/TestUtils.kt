package com.toolchest

import freemarker.cache.ClassTemplateLoader
import freemarker.core.HTMLOutputFormat
import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.http.*
import io.ktor.server.response.*
import org.koin.core.module.Module
import org.koin.dsl.module
import com.toolchest.services.Base64Service
import com.toolchest.services.Base64ServiceImpl
import com.toolchest.services.ToolService
import com.toolchest.data.dto.TagDTO
import com.toolchest.data.dto.ToolDTO
import com.toolchest.routes.*
import io.ktor.server.testing.*
import io.ktor.server.routing.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import com.toolchest.config.configurePlugins
import com.toolchest.config.configureRouting
import com.toolchest.config.configureDatabases
import io.mockk.*
import io.ktor.server.plugins.compression.*
import io.ktor.server.plugins.callloging.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import org.slf4j.event.Level
import com.toolchest.config.ErrorPageModel
import java.io.File
import java.nio.file.Paths
import io.ktor.server.config.HoconApplicationConfig
import com.typesafe.config.ConfigFactory
import io.ktor.util.AttributeKey
import org.koin.ktor.plugin.Koin
import org.jetbrains.exposed.sql.Table

/**
 * Extension function for ApplicationTestBuilder
 * Sets up a Ktor test application environment with standardized configuration.
 *
 * @param enableDb Flag to enable database configuration through Ktor's configureDatabases.
 * @param useTestDatabase Flag to set up an in-memory H2 database for testing.
 * @param tables Tables to create when useTestDatabase is true.
 * @param koinModules List of Koin modules to load for this test.
 * @param testCode The block of test code to run
 */
fun runTestWithSetup(
    enableDb: Boolean = false,
    useTestDatabase: Boolean = false,
    tables: Array<Table> = emptyArray(),
    koinModules: List<Module> = emptyList(),
    testCode: suspend ApplicationTestBuilder.() -> Unit
) = testApplication {
    // Load test configuration
    environment {
        config = HoconApplicationConfig(ConfigFactory.load("application-test.conf"))
    }

    // Initialize test database if requested
    if (useTestDatabase) {
        DatabaseTestUtils.initH2Database()
        
        if (tables.isNotEmpty()) {
            DatabaseTestUtils.createSchema(*tables)
        }
    }

    // Configure application components
    application {
        install(Koin) {
            modules(koinModules)
        }

        if (enableDb) {
            configureDatabases()
        }

        // Configure plugins and middleware
        configurePlugins()
        configureRouting()
    }

    // Execute test-specific logic
    testCode()
    
    // Clean up test database if it was created
    if (useTestDatabase && tables.isNotEmpty()) {
        DatabaseTestUtils.dropSchema(*tables)
    }
}

/**
 * Utility class for creating Koin test modules with common service mocks
 */
object KoinTestModule {
    /**
     * Creates a Koin module with standard mock services for testing
     *
     * @param base64Service The Base64Service implementation to use (mock or real)
     * @param toolService The ToolService implementation to use (mock or real)
     * @return A configured Koin module for testing
     */
    fun createTestModule(
        base64Service: Base64Service = MockFactory.createBase64ServiceMock(),
        toolService: ToolService = MockFactory.createToolServiceMock()
    ): Module {
        return module {
            single { base64Service }
            single { toolService }
            // Add other dependencies as needed
        }
    }
}

/**
 * Test factory for creating mock services with standard configuration.
 * This helps standardize how mocks are created and configured across tests.
 */
object MockFactory {
    /**
     * Creates a mock ToolService with default configurations for common methods
     *
     * @param relaxed Whether the mock should be relaxed (allow unmocked methods to return default values)
     * @param relaxUnitFun Whether unit functions should be relaxed
     * @return A MockK instance of ToolService
     */
    fun createToolServiceMock(relaxed: Boolean = true, relaxUnitFun: Boolean = true): ToolService {
        val mock = mockk<ToolService>(relaxed = relaxed, relaxUnitFun = relaxUnitFun)

        // Default common behaviors
        every { mock.getAllTags() } returns emptyList()
        every { mock.getAllTools() } returns emptyList()
        every { mock.getPopularTools(any()) } returns emptyList()
        every { mock.recordToolUsage(any()) } just runs

        return mock
    }

    /**
     * Creates a mock Base64Service with default configurations
     *
     * @param relaxed Whether the mock should be relaxed
     * @return A MockK instance of Base64Service
     */
    fun createBase64ServiceMock(relaxed: Boolean = false): Base64Service {
        val mock = mockk<Base64Service>(relaxed = relaxed)

        // Default behaviors
        every { mock.encodeString(any(), any()) } returns "encoded-test-value"
        every { mock.decodeString(any(), any()) } returns "decoded-test-value"
        every { mock.encodeFile(any(), any()) } returns "encoded-file-test-value"
        every { mock.decodeToBytes(any(), any()) } returns "decoded-bytes".toByteArray()

        return mock
    }

    /**
     * Creates a set of sample Tag DTOs for testing
     *
     * @return List of sample TagDTO objects
     */
    fun createSampleTags(): List<TagDTO> = listOf(
        TagDTO(1, "Encoding", "encoding", "Encoding and decoding tools", "#3B82F6"),
        TagDTO(2, "Conversion", "conversion", "File and data conversion tools", "#10B981"),
        TagDTO(3, "Formatters", "formatters", "Code and text formatting tools", "#F59E0B")
    )

    /**
     * Creates a set of sample Tool DTOs for testing
     *
     * @param tags Optional list of tags to associate with tools
     * @return List of sample ToolDTO objects
     */
    fun createSampleTools(tags: List<TagDTO> = createSampleTags()): List<ToolDTO> {
        val encodingTag = tags.find { it.slug == "encoding" } ?: tags.firstOrNull() ?: TagDTO(1, "Encoding", "encoding", "Encoding tools", "#3B82F6")
        val formatterTag = tags.find { it.slug == "formatters" } ?: tags.lastOrNull() ?: TagDTO(3, "Formatters", "formatters", "Formatting tools", "#F59E0B")

        return listOf(
            ToolDTO(1, "Base64", "base64", "Encode/decode Base64", "fas fa-exchange-alt", 1, true, listOf(encodingTag), 10),
            ToolDTO(2, "JSON Formatter", "json", "Format JSON", "fas fa-code", 2, true, listOf(formatterTag), 5)
        )
    }
}