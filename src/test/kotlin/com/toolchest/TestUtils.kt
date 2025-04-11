package com.toolchest

import freemarker.cache.ClassTemplateLoader
import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import org.koin.core.context.startKoin
import org.koin.core.context.stopKoin
import org.koin.dsl.module
import com.toolchest.services.Base64Service
import com.toolchest.services.Base64ServiceImpl
import kotlin.test.BeforeTest
import kotlin.test.AfterTest
import freemarker.core.HTMLOutputFormat

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
        
        // Add auto-includes for all templates - this is essential for the @page macro to work
        addAutoInclude("components/macros.ftl")
    }
}

/**
 * Base test class that provides Koin test support
 * Extend this class to get automatic setup and teardown of Koin dependencies
 */
abstract class KoinBaseTest {
    @BeforeTest
    fun setupKoin() {
        startKoin {
            modules(testModule)
        }
    }
    
    @AfterTest
    fun tearDownKoin() {
        stopKoin()
    }
    
    /**
     * Test module with all service implementations
     */
    private val testModule = module {
        single<Base64Service> { Base64ServiceImpl() }
        // Add other service implementations for testing as needed
    }
}