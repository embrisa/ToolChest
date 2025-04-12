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
import kotlin.test.BeforeTest
import kotlin.test.AfterTest
import com.toolchest.config.configurePlugins
import com.toolchest.config.configureRouting
import io.ktor.server.testing.*

/**
 * Helper function to configure FreeMarker for tests to use production templates directly.
 * This avoids maintaining duplicate templates in the test resources.
 */
fun Application.configureFreeMarkerForTests() {
    install(FreeMarker) {
        // Use the templates from the main resources directory
        templateLoader = ClassTemplateLoader(Application::class.java.classLoader, "templates")
        
        // Basic configuration
        defaultEncoding = "UTF-8"
        outputFormat = HTMLOutputFormat.INSTANCE
        
        // Add auto-include for the main macros file
        // This will automatically include our component macros as well
        addAutoInclude("macros.ftl")
    }
}

/**
 * Test version of configureApplication that doesn't initialize Koin
 * For use in tests that extend KoinBaseTest and already manage their own Koin instance
 */
fun Application.configureApplicationForTests() {
    // Skip configureKoin() - tests should manage their own Koin instances
    
    // Configure plugins and middleware
    configurePlugins()
    
    // Configure routing
    configureRouting()
    
    log.info("Test application configured without initializing Koin")
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