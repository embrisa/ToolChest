package com.toolchest.templates

import com.toolchest.MockFactory
import com.toolchest.KoinTestModule
import com.toolchest.runTestWithSetup
import com.toolchest.services.ToolService
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.*
import io.ktor.server.testing.*
import io.ktor.util.AttributeKey
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.mockk.every
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.DisplayName
import org.koin.core.context.stopKoin
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import kotlin.test.assertContains
import java.io.File
import freemarker.cache.ClassTemplateLoader
import freemarker.core.HTMLOutputFormat

class UIComponentsTest {

    // Sample data that will be used across all test cases
    private val sampleTags = MockFactory.createSampleTags()
    private val sampleTools = MockFactory.createSampleTools(sampleTags)
    private val toolServiceMock = MockFactory.createToolServiceMock()

    @BeforeEach
    fun setup() {
        // Configure mock responses
        every { toolServiceMock.getAllTools() } returns sampleTools
        every { toolServiceMock.getAllTags() } returns sampleTags
    }

    @AfterEach
    fun tearDown() {
        // Clean up any resources or reset states if necessary
        stopKoin()
    }

    @Nested
    @DisplayName("Template files existence")
    inner class TemplateFilesExistence {

        @Test
        fun `tag navigation should exist in the templates directory`() {
            val classLoader = javaClass.classLoader
            assertTrue(
                classLoader.getResource("templates/components/tag-navigation.ftl") != null,
                "Tag navigation template should exist"
            )
        }

        @Test
        fun `tool card should exist in the templates directory`() {
            val classLoader = javaClass.classLoader
            assertTrue(
                classLoader.getResource("templates/components/tool-card.ftl") != null,
                "Tool card template should exist"
            )
        }

        @Test
        fun `tool grid items should exist in the templates directory`() {
            val classLoader = javaClass.classLoader
            assertTrue(
                classLoader.getResource("templates/pages/partials/tool-grid-items.ftl") != null,
                "Tool grid items template should exist"
            )
        }

        @Test
        fun `tag page should exist in the templates directory`() {
            val classLoader = javaClass.classLoader
            assertTrue(
                classLoader.getResource("templates/pages/tag.ftl") != null,
                "Tag page template should exist"
            )
        }
    }

    @Nested
    @DisplayName("Template rendering")
    inner class TemplateRendering {

        @Test
        fun `should handle a simple response`() = runTestWithSetup {
            // Set up a simple route for testing
            routing {
                get("/test-simple") {
                    call.respondText("Simple test response", ContentType.Text.Plain)
                }
            }

            // Execute the test
            val response = client.get("/test-simple")
            assertEquals(HttpStatusCode.OK, response.status)
            assertEquals("Simple test response", response.bodyAsText())
        }

        @Test
        fun `should render tool card component correctly`() = runTestWithSetup(
            koinModules = listOf(KoinTestModule.createTestModule(toolService = toolServiceMock))
        ) {
            // Setup FreeMarker for this test
            
            // Set up routes for this specific test
            routing {
                get("/test-tool-card") {
                    val tool = sampleTools.first()

                    // Render the template with our test data
                    call.respond(
                        FreeMarkerContent(
                            "components/tool-card-test-wrapper.ftl",
                            mapOf("tool" to tool)
                        )
                    )
                }
            }

            // Execute the test
            val response = client.get("/test-tool-card")
            assertEquals(HttpStatusCode.OK, response.status)

            val content = response.bodyAsText()

            // Basic content checks
            assertContains(content, "Base64")

            // Check for tag links - consistency with tag route pattern
            assertContains(content, "/tag/encoding")

            // Check tool details
            assertContains(content, sampleTools.first().description)
        }

        @Test
        fun `should render tag navigation component correctly`() = runTestWithSetup(
            koinModules = listOf(KoinTestModule.createTestModule(toolService = toolServiceMock))
        ) {
            // Set up routes for this specific test
            routing {
                get("/test-tag-nav") {
                    // Render the template with our test data
                    call.respond(
                        FreeMarkerContent(
                            "components/tag-navigation-test-wrapper.ftl",
                            mapOf(
                                "allTags" to sampleTags,
                                "currentTag" to sampleTags.first()
                            )
                        )
                    )
                }
            }

            // Execute the test
            val response = client.get("/test-tag-nav")
            assertEquals(HttpStatusCode.OK, response.status)

            val content = response.bodyAsText()

            // Check for encoding tag - the first tag in our sample
            assertContains(content, "Encoding")
            assertContains(content, "/tag/encoding")

            // Check for active state attribute
            assertContains(content, "aria-current=\"page\"")
        }

        @Test
        fun `should render tool grid items correctly`() = runTestWithSetup(
            koinModules = listOf(KoinTestModule.createTestModule(toolService = toolServiceMock))
        ) {
            
            // Set up routes for this specific test
            routing {
                get("/test-tool-grid") {
                    call.respond(
                        FreeMarkerContent(
                            "pages/partials/tool-grid-items.ftl",
                            mapOf("tools" to sampleTools)
                        )
                    )
                }
            }

            // Execute the test
            val response = client.get("/test-tool-grid")
            assertEquals(HttpStatusCode.OK, response.status)

            val content = response.bodyAsText()

            // Test that all tools are rendered in the grid
            sampleTools.forEach { tool ->
                assertContains(content, tool.name)
                assertContains(content, tool.description)
                assertContains(content, "href=\"/${tool.slug}\"")
            }
        }
    }
}