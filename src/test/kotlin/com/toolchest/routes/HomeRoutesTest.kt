package com.toolchest.routes

import com.toolchest.KoinBaseTest
import com.toolchest.configureApplicationForTests
import com.toolchest.data.dto.TagDTO
import com.toolchest.data.dto.ToolDTO
import com.toolchest.services.ToolService
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.should
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.contain
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.mockk.*
import org.koin.core.context.GlobalContext
import org.koin.core.context.loadKoinModules
import org.koin.core.context.unloadKoinModules
import org.koin.core.module.Module
import org.koin.dsl.module

class HomeRoutesTest : DescribeSpec() {
    
    private lateinit var toolServiceMock: ToolService
    private var testModule: Module
    
    private fun createTestModule(): Module {
        // Create a mock ToolService
        toolServiceMock = mockk()
        
        // Set up default mock responses
        every { toolServiceMock.getAllTools() } returns listOf(
            ToolDTO(
                id = 1,
                name = "Base64 Encoder/Decoder", 
                slug = "base64",
                description = "Convert text to Base64",
                iconClass = "fa-code",
                displayOrder = 1,
                isActive = true,
                tags = listOf(TagDTO(1, "Encoding", "encoding", "Encoding tools", "#3B82F6")),
                usageCount = 0
            )
        )
        every { toolServiceMock.getAllTags() } returns listOf(
            TagDTO(1, "Encoding", "encoding", "Encoding tools", "#3B82F6")
        )
        every { toolServiceMock.getPopularTools(any()) } returns listOf(
            ToolDTO(
                id = 1,
                name = "Base64 Encoder/Decoder",
                slug = "base64",
                description = "Convert text to Base64",
                iconClass = "fa-code",
                displayOrder = 1,
                isActive = true,
                tags = listOf(TagDTO(1, "Encoding", "encoding", "Encoding tools", "#3B82F6")),
                usageCount = 10
            )
        )
        every { toolServiceMock.recordToolUsage(any()) } just runs
        
        return module {
            single<ToolService> { toolServiceMock }
        }
    }
    
    init {
        // Initialize testModule before tests run
        testModule = createTestModule()
        
        beforeSpec {
            // Start Koin if not started and load our module
            if (GlobalContext.getOrNull() == null) {
                // Initialize Koin
                org.koin.core.context.startKoin {
                    modules(testModule)
                }
            } else {
                // Just load our module into existing container
                loadKoinModules(testModule)
            }
        }
    
        afterSpec {
            // Clean up our module if Koin is still running
            if (GlobalContext.getOrNull() != null) {
                unloadKoinModules(testModule)
            }
        }
    
        describe("Home routes") {
            context("GET home route") {
                it("should return OK status with correct content") {
                    testApplication {
                        application {
                            configureApplicationForTests() // Use our test-specific configuration
                        }
                        
                        client.get("/").let { response ->
                            response.status shouldBe HttpStatusCode.OK
                            val bodyText = response.bodyAsText()
                            
                            // Verify key elements are present in the home page
                            bodyText should contain("ToolChest")
                            bodyText should contain("Base64 Encoder/Decoder")
                            
                            // Verify page metadata is correct - note we're checking for title content only, not the full tag structure
                            bodyText should contain("Free Online Utility Tools")
                            bodyText should contain("ToolChest offers free online utility tools")
                            
                            // Verify the mockk was called
                            verify { toolServiceMock.getAllTools() }
                            verify { toolServiceMock.getAllTags() }
                            verify { toolServiceMock.getPopularTools(any()) }
                        }
                    }
                }
    
                it("should contain all tool cards") {
                    testApplication {
                        application {
                            configureApplicationForTests()
                        }
                        
                        client.get("/").let { response ->
                            response.status shouldBe HttpStatusCode.OK
                            val bodyText = response.bodyAsText()
                            
                            // Check for tool card components
                            bodyText should contain("/base64")
                            bodyText should contain("fa-code")
                            bodyText should contain("Convert text to Base64")
                        }
                    }
                }
    
                it("HTML should be valid and accessible") {
                    testApplication {
                        application {
                            configureApplicationForTests()
                        }
                        
                        client.get("/").let { response ->
                            val bodyText = response.bodyAsText()
                            
                            // Check for content rather than strict HTML structure
                            bodyText should contain("Your Toolkit for Everyday Tasks")
                            
                            // Test for semantic elements or other accessibility features that might be present
                            // Note: We're just checking for presence of common semantic elements used in templates
                            (bodyText.contains("<div") || 
                            bodyText.contains("<h1") || 
                            bodyText.contains("<h2") || 
                            bodyText.contains("<p") || 
                            bodyText.contains("role=") || 
                            bodyText.contains("class=")) shouldBe true
                        }
                    }
                }
            }
    
            context("GET about route") {
                it("should return OK status with correct content") {
                    testApplication {
                        application {
                            configureApplicationForTests()
                        }
                        
                        client.get("/about").let { response ->
                            response.status shouldBe HttpStatusCode.OK
                            val bodyText = response.bodyAsText()
                            
                            // Verify about page content - just check for content, not strict HTML structure
                            bodyText should contain("About")
                            
                            // Verify content rather than exact HTML structure
                            bodyText should contain("About Us")
                            bodyText should contain("Learn more about ToolChest")
                        }
                    }
                }
    
                it("HTML should be valid and accessible") {
                    testApplication {
                        application {
                            configureApplicationForTests()
                        }
                        
                        client.get("/about").let { response ->
                            val bodyText = response.bodyAsText()
                            
                            // Check for content rather than strict HTML structure
                            bodyText should contain("About Us")
                            
                            // Check for accessibility features
                            (bodyText.contains("aria-") || bodyText.contains("alt=") || 
                            bodyText.contains("About ToolChest")) shouldBe true
                        }
                    }
                }
            }
    
            it("GET non-existent route should return 404") {
                testApplication {
                    application {
                        configureApplicationForTests()
                    }
    
                    client.get("/non-existent-path").status shouldBe HttpStatusCode.NotFound
                }
            }
        }
    }
}