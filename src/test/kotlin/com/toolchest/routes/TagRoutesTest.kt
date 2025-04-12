package com.toolchest.routes

import com.toolchest.configureApplicationForTests
import com.toolchest.data.dto.TagDTO
import com.toolchest.data.dto.ToolDTO
import com.toolchest.services.ToolService
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.ktor.server.routing.routing
import io.mockk.*
import org.koin.core.context.startKoin
import org.koin.core.context.stopKoin
import org.koin.dsl.module
import org.koin.test.KoinTest

class TagRoutesTest : StringSpec(), KoinTest {

    private lateinit var toolServiceMock: ToolService

    init {
        beforeTest {
            stopKoin() // Ensure no existing Koin instance is running
            toolServiceMock = mockk()
            startKoin {
                modules(module {
                    single { toolServiceMock }
                })
            }
        }

        afterTest {
            stopKoin()
        }

        "Tag route should return correct data for valid tag" {
            // Setup mock responses
            val testTag = TagDTO(1, "Testing", "testing", "For testing tools", "#FF5733")
            val testTools = listOf(
                ToolDTO(
                    1, "Test Tool 1", "test-tool-1", "A tool for testing", "fas fa-vial", 1, true,
                    listOf(testTag), 0
                ),
                ToolDTO(
                    2, "Test Tool 2", "test-tool-2", "Another tool for testing", "fas fa-vial", 2, true,
                    listOf(testTag), 0
                )
            )
            val allTags = listOf(
                testTag,
                TagDTO(2, "Development", "development", "Development tools", "#33FF57")
            )

            // Configure mocks
            every { toolServiceMock.getTagBySlug("testing") } returns testTag
            every { toolServiceMock.getToolsByTag("testing") } returns testTools
            every { toolServiceMock.getAllTags() } returns allTags
            // Mock the popularTools call which might be used in the template
            every { toolServiceMock.getPopularTools(any()) } returns emptyList()

            testApplication {
                application {
                    configureApplicationForTests()
                }

                // Execute the request
                val response = client.get("/tag/testing")

                // Verify response status
                response.status shouldBe HttpStatusCode.OK

                // Verify content
                val responseText = response.bodyAsText()
                responseText shouldContain "Testing"

                // Verify service interactions
                verify(exactly = 1) { toolServiceMock.getTagBySlug("testing") }
                verify(exactly = 1) { toolServiceMock.getToolsByTag("testing") }
                verify(exactly = 1) { toolServiceMock.getAllTags() }
            }
        }

        "Tag route should redirect to home page for invalid tag" {
            // Setup mock responses
            every { toolServiceMock.getTagBySlug("nonexistent") } returns null

            // Mock additional methods that might be called when home routes are registered
            every { toolServiceMock.getAllTools() } returns emptyList()
            every { toolServiceMock.getAllTags() } returns emptyList()
            every { toolServiceMock.getPopularTools(any()) } returns emptyList()

            testApplication {
                application {
                    configureApplicationForTests()
                    // Explicitly register home routes to ensure tag route handler is properly initialized
                    routing {
                        homeRoutes()
                    }
                }

                // Configure client to not follow redirects automatically
                val client = createClient {
                    followRedirects = false
                }

                // Execute the request
                val response = client.get("/tag/nonexistent")

                // Verify redirect to home page for invalid tag
                response.status shouldBe HttpStatusCode.Found
                response.headers[HttpHeaders.Location] shouldBe "/"

                // Verify service interaction
                verify(exactly = 1) { toolServiceMock.getTagBySlug("nonexistent") }
            }
        }

        "Home page should display tags and popular tools" {
            // Setup mock responses
            val tags = listOf(
                TagDTO(1, "Encoding", "encoding", "Encoding tools", "#3B82F6"),
                TagDTO(2, "Conversion", "conversion", "Conversion tools", "#10B981")
            )

            val allTools = listOf(
                ToolDTO(
                    1, "Base64", "base64", "Encode/decode Base64", "fas fa-exchange-alt", 1, true,
                    listOf(tags[0]), 10
                ),
                ToolDTO(
                    2, "JSON Formatter", "json", "Format JSON", "fas fa-code", 2, true,
                    listOf(tags[1]), 5
                )
            )

            val popularTools = listOf(
                ToolDTO(
                    1, "Base64", "base64", "Encode/decode Base64", "fas fa-exchange-alt", 1, true,
                    listOf(tags[0]), 10
                )
            )

            // Configure mocks
            every { toolServiceMock.getAllTools() } returns allTools
            every { toolServiceMock.getAllTags() } returns tags
            every { toolServiceMock.getPopularTools(5) } returns popularTools

            testApplication {
                application {
                    configureApplicationForTests()
                }

                // Execute request
                val response = client.get("/")

                // Verify response status
                response.status shouldBe HttpStatusCode.OK

                // Verify content
                val responseText = response.bodyAsText()

                // Test names and descriptions instead of just specific tags
                responseText shouldContain "Base64"
                responseText shouldContain "JSON Formatter"
                responseText shouldContain "Encode/decode Base64"
                responseText shouldContain "Format JSON"

                // Verify popular tools section
                responseText shouldContain "Popular"

                // Verify service interactions
                verify(exactly = 1) { toolServiceMock.getAllTools() }
                verify(exactly = 1) { toolServiceMock.getAllTags() }
                verify(exactly = 1) { toolServiceMock.getPopularTools(5) }
            }
        }

        "Tool usage should be recorded when visiting a tool page" {
            // Setup mock
            every { toolServiceMock.recordToolUsage("base64") } just runs

            testApplication {
                application {
                    configureApplicationForTests()
                }

                // Execute request to a tool page using the correct path
                client.get("/base64")

                // Verify service was called to record usage
                verify(exactly = 1) { toolServiceMock.recordToolUsage("base64") }
            }
        }
    }
}