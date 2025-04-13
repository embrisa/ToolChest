package com.toolchest.routes

import com.toolchest.MockFactory
import com.toolchest.RouteTestHelper
import com.toolchest.assertOk
import com.toolchest.assertRedirectTo
import com.toolchest.configureFreeMarkerForTests
import io.kotest.core.spec.style.StringSpec
import io.ktor.client.request.*
import io.ktor.server.routing.*
import io.ktor.server.testing.*
import io.mockk.*
import org.koin.core.context.startKoin
import org.koin.core.context.stopKoin
import org.koin.dsl.module
import org.koin.test.KoinTest

class TagRoutesTest : StringSpec(), KoinTest {

    init {
        beforeTest {
            stopKoin() // Ensure no existing Koin instance is running
        }

        afterTest {
            stopKoin()
        }

        "Tag route should return correct data for valid tag" {
            // Create mocks with the MockFactory
            val toolServiceMock = MockFactory.createToolServiceMock()
            val testTags = MockFactory.createSampleTags()
            val testTag = testTags.first()
            val testTools = MockFactory.createSampleTools(testTags)
            
            // Configure specific mock behaviors for this test
            every { toolServiceMock.getTagBySlug("testing") } returns testTag
            every { toolServiceMock.getToolsByTag("testing") } returns testTools
            every { toolServiceMock.getAllTags() } returns testTags

            // Set up Koin with our mocks
            startKoin {
                modules(module {
                    single { toolServiceMock }
                    single { MockFactory.createBase64ServiceMock() }
                })
            }

            testApplication {
                application {
                    configureFreeMarkerForTests()
                    
                    routing {
                        homeRoutes()
                    }
                }

                // Use our new test helper to simplify the test
                RouteTestHelper.testEndpoint(client, "/tag/testing") { response ->
                    response.assertOk()
                    
                    // Verify service interactions
                    verify(exactly = 1) { toolServiceMock.getTagBySlug("testing") }
                    verify(exactly = 1) { toolServiceMock.getToolsByTag("testing") }
                    verify(exactly = 1) { toolServiceMock.getAllTags() }
                }
            }
        }

        "Tag route should redirect to home page for invalid tag" {
            // Create mock with the MockFactory
            val toolServiceMock = MockFactory.createToolServiceMock()
            
            // Configure specific mock behavior for this test
            every { toolServiceMock.getTagBySlug("nonexistent") } returns null

            // Set up Koin with our mocks
            startKoin {
                modules(module {
                    single { toolServiceMock }
                    single { MockFactory.createBase64ServiceMock() }
                })
            }

            testApplication {
                application {
                    configureFreeMarkerForTests()
                    
                    routing {
                        homeRoutes()
                    }
                }

                // Configure client to not follow redirects automatically
                val client = createClient {
                    followRedirects = false
                }

                // Use our new test helper with redirect assertion
                RouteTestHelper.testEndpoint(client, "/tag/nonexistent") { response ->
                    response.assertRedirectTo("/")
                    
                    // Verify service interaction
                    verify(exactly = 1) { toolServiceMock.getTagBySlug("nonexistent") }
                }
            }
        }

        "Home page should display tags and popular tools" {
            // Create mocks with the MockFactory
            val toolServiceMock = MockFactory.createToolServiceMock()
            val tags = MockFactory.createSampleTags()
            val allTools = MockFactory.createSampleTools(tags)
            val popularTools = listOf(allTools.first())

            // Configure specific mock behaviors for this test
            every { toolServiceMock.getAllTools() } returns allTools
            every { toolServiceMock.getAllTags() } returns tags
            every { toolServiceMock.getPopularTools(5) } returns popularTools

            // Set up Koin with our mocks
            startKoin {
                modules(module {
                    single { toolServiceMock }
                    single { MockFactory.createBase64ServiceMock() }
                })
            }

            testApplication {
                application {
                    configureFreeMarkerForTests()
                    
                    routing {
                        homeRoutes()
                    }
                }

                // Use our new test helper
                RouteTestHelper.testEndpoint(client, "/") { response ->
                    response.assertOk()
                    
                    // Verify service interactions
                    verify(exactly = 1) { toolServiceMock.getAllTools() }
                    verify(exactly = 1) { toolServiceMock.getAllTags() }
                    verify(exactly = 1) { toolServiceMock.getPopularTools(any()) }
                }
            }
        }

        "Tool usage should be recorded when visiting a tool page" {
            // Create mocks with the MockFactory
            val toolServiceMock = MockFactory.createToolServiceMock()
            val base64ServiceMock = MockFactory.createBase64ServiceMock()
            
            // Set up Koin with our mocks
            startKoin {
                modules(module {
                    single { toolServiceMock }
                    single { base64ServiceMock }
                })
            }

            // Test using our specialized base64Routes test helper
            testApplication {
                application {
                    configureFreeMarkerForTests()
                    
                    routing {
                        homeRoutes()
                        route("base64") {
                            base64Routes()
                        }
                    }
                }

                // Execute request to the base64 page and verify
                RouteTestHelper.testEndpoint(client, "/base64") { response ->
                    response.assertOk()
                    
                    // Verify service was called to record usage
                    verify { toolServiceMock.recordToolUsage("base64") }
                }
            }
        }
    }
}