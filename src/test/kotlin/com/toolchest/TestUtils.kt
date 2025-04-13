package com.toolchest

import freemarker.cache.ClassTemplateLoader
import freemarker.core.HTMLOutputFormat
import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.http.*
import io.ktor.server.response.*
import org.koin.core.context.startKoin
import org.koin.core.context.stopKoin
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
import kotlin.test.BeforeTest
import kotlin.test.AfterTest
import com.toolchest.config.configurePlugins
import com.toolchest.config.configureRouting
import io.mockk.*

/**
 * Helper function to configure FreeMarker for tests to use production templates directly.
 * This avoids maintaining duplicate templates in the test resources.
 * 
 * NOTE: Tests should typically not call this directly. Use configureApplicationForTests() instead
 * which calls this method and sets up other necessary components.
 */
fun Application.configureFreeMarkerForTests() {
    install(FreeMarker) {
        // Use the templates from the main resources directory
        templateLoader = ClassTemplateLoader(Application::class.java.classLoader, "templates")
        
        // Basic configuration
        defaultEncoding = "UTF-8"
        outputFormat = HTMLOutputFormat.INSTANCE
        
        // Add auto-includes for macros - note the correct paths
        addAutoInclude("components/macros.ftl")
        addAutoInclude("macros.ftl")
        
        // Add shared variables that are available in production
        setSharedVariable("appName", "ToolChest")
        setSharedVariable("appVersion", "1.0.0-test")
        setSharedVariable("isDevelopment", true)
        
        // Add current timestamp for templates that use ${.now}
        setSharedVariable("currentYear", java.time.Year.now().value)
        
        // Set template exception handler for tests
        setTemplateExceptionHandler { te, _, out ->
            log.error("FreeMarker template error in tests: ${te.message}", te)
            out.write("Test template error: ${te.message}")
        }
    }
}

/**
 * Test version of configureApplication that sets up a complete test environment 
 * including FreeMarker templates, plugins, and routing, but without initializing Koin.
 * 
 * For use in tests that extend KoinBaseTest and already manage their own Koin instance.
 * 
 * PREFERRED METHOD: All tests should use this method rather than calling configureFreeMarkerForTests()
 * directly to ensure consistent test setup.
 */
fun Application.configureApplicationForTests() {
    // Skip configureKoin() - tests should manage their own Koin instances
    
    // Configure FreeMarker templates for tests
    configureFreeMarkerForTests()
    
    // Configure plugins and middleware
    configurePlugins()
    
    // Configure routing
    configureRouting()
    
    log.info("Test application configured with FreeMarker templates and routing")
}

/**
 * Create a test application with controlled setup that doesn't affect global state.
 * This is useful for tests that need to create an isolated test application instance.
 * 
 * @param modules Koin modules to use for this test application
 * @param setup Additional setup to perform on the application
 * @param test The test code to run within this application context
 */
fun createTestApp(
    modules: List<Module> = listOf(),
    setup: Application.() -> Unit = {},
    test: suspend ApplicationTestBuilder.() -> Unit
) = testApplication {
    application {
        // Configure FreeMarker templates
        configureFreeMarkerForTests()
        
        // Apply additional custom setup
        setup()
        
        // Configure standard plugins and routing
        configurePlugins()
        configureRouting()
    }
    
    // Run the test
    test()
}

/**
 * Base test class that provides Koin test support
 * Extend this class to get automatic setup and teardown of Koin dependencies
 */
abstract class KoinBaseTest {
    /**
     * Custom modules to use in this test. Override this in subclasses if needed.
     */
    open fun provideTestModules(): List<Module> = listOf(defaultTestModule)
    
    /**
     * Default test module with common service implementations
     */
    private val defaultTestModule = module {
        single<Base64Service> { Base64ServiceImpl() }
        // Add other service implementations for testing as needed
    }
    
    /**
     * Set up Koin dependency injection before each test
     */
    @BeforeTest
    fun setupKoin() {
        try {
            stopKoin()
        } catch (e: IllegalStateException) {
            // Koin was not started, this is fine
        }
        
        startKoin {
            modules(provideTestModules())
        }
    }
    
    /**
     * Clean up Koin dependency injection after each test
     * This is crucial to prevent test state leakage
     */
    @AfterTest
    fun tearDownKoin() {
        try {
            stopKoin()
        } catch (e: IllegalStateException) {
            // Koin was already stopped, ignore
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
        val encodingTag = tags.find { it.slug == "encoding" } ?: tags.firstOrNull() ?: 
            TagDTO(1, "Encoding", "encoding", "Encoding tools", "#3B82F6")
            
        val formatterTag = tags.find { it.slug == "formatters" } ?: tags.lastOrNull() ?:
            TagDTO(3, "Formatters", "formatters", "Formatting tools", "#F59E0B")
            
        return listOf(
            ToolDTO(
                1, "Base64", "base64", "Encode/decode Base64", "fas fa-exchange-alt", 1, true,
                listOf(encodingTag), 10
            ),
            ToolDTO(
                2, "JSON Formatter", "json", "Format JSON", "fas fa-code", 2, true,
                listOf(formatterTag), 5
            )
        )
    }
}

/**
 * Helper functions for testing routes with specific configurations
 */
object RouteTestHelper {
    /**
     * Sets up a test environment for home routes
     * 
     * @param toolServiceMock Preconfigured ToolService mock to use
     * @param testBlock Test code to execute
     */
    suspend fun testHomeRoutes(
        toolServiceMock: ToolService = MockFactory.createToolServiceMock(),
        testBlock: suspend ApplicationTestBuilder.() -> Unit
    ) {
        testApplication {
            application {
                configureFreeMarkerForTests()
                
                routing {
                    homeRoutes()
                }
            }
            
            // Run the test code
            testBlock()
        }
    }
    
    /**
     * Sets up a test environment for base64 routes
     * 
     * @param toolServiceMock Preconfigured ToolService mock to use
     * @param base64ServiceMock Preconfigured Base64Service mock to use
     * @param testBlock Test code to execute
     */
    suspend fun testBase64Routes(
        toolServiceMock: ToolService = MockFactory.createToolServiceMock(),
        base64ServiceMock: Base64Service = MockFactory.createBase64ServiceMock(),
        testBlock: suspend ApplicationTestBuilder.() -> Unit
    ) {
        testApplication {
            application {
                configureFreeMarkerForTests()
                
                routing {
                    // Set up both home routes and base64 routes with the correct path structure
                    homeRoutes()
                    route("base64") {
                        base64Routes()
                    }
                }
            }
            
            // Run the test code
            testBlock()
        }
    }
    
    /**
     * Tests a specific HTTP endpoint with detailed error reporting
     * 
     * @param client The HTTP client to use for the request
     * @param path The path to request
     * @param method The HTTP method to use
     * @param setup Function to set up the request
     * @param assertions Function to run assertions on the response
     */
    suspend fun testEndpoint(
        client: io.ktor.client.HttpClient,
        path: String,
        method: HttpMethod = HttpMethod.Get,
        setup: io.ktor.client.request.HttpRequestBuilder.() -> Unit = {},
        assertions: suspend (HttpResponse) -> Unit
    ) {
        try {
            val response = when (method) {
                HttpMethod.Get -> client.get(path) { 
                    setup()
                }
                HttpMethod.Post -> client.post(path) { 
                    setup()
                }
                HttpMethod.Put -> client.put(path) { 
                    setup()
                }
                HttpMethod.Delete -> client.delete(path) { 
                    setup()
                }
                else -> client.request(path) {
                    this.method = method
                    setup()
                }
            }
            assertions(response)
        } catch (e: Throwable) {
            // Enhanced error reporting for easier test debugging
            throw AssertionError("Error testing endpoint $method $path: ${e.message}", e)
        }
    }
}

/**
 * Extensions to simplify common test operations
 */
suspend fun HttpResponse.assertOk() {
    if (status != HttpStatusCode.OK) {
        throw AssertionError("Expected status OK but was ${status}. Body: ${bodyAsText()}")
    }
}

suspend fun HttpResponse.assertStatus(expected: HttpStatusCode) {
    if (status != expected) {
        throw AssertionError("Expected status $expected but was $status. Body: ${bodyAsText()}")
    }
}

suspend fun HttpResponse.assertContains(text: String) {
    val body = bodyAsText()
    if (!body.contains(text)) {
        throw AssertionError("Expected response to contain '$text' but it didn't.\nBody: $body")
    }
}

suspend fun HttpResponse.assertRedirectTo(path: String) {
    if (status != HttpStatusCode.Found && status != HttpStatusCode.MovedPermanently) {
        throw AssertionError("Expected redirect status but was $status")
    }
    
    val location = headers[HttpHeaders.Location]
    if (location != path) {
        throw AssertionError("Expected redirect to '$path' but was '$location'")
    }
}