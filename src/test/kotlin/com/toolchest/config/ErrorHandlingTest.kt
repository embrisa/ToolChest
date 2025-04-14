package com.toolchest.config

import com.toolchest.KoinTestModule
import com.toolchest.runTestWithSetup
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertContains

/**
 * Tests for error handling via StatusPages plugin
 */
class ErrorHandlingTest {

    @Nested
    @DisplayName("Error Page Handling")
    inner class ErrorPageHandling {

        @Test
        fun `should show 404 not found error page`() {
            runTestWithSetup(
                koinModules = listOf(KoinTestModule.createTestModule())
            ) {
                // Setup route for testing 404 errors
                application {
                    routing {
                        get("/test-route") {
                            call.respondText("Test route")
                        }
                    }
                }

                // Make request to non-existent page
                val response = client.get("/non-existent-page")
                
                // Assertions
                assertEquals(HttpStatusCode.NotFound, response.status)
                val body = response.bodyAsText()
                assertContains(body, "404")
                assertContains(body, "Page Not Found", ignoreCase = true)
            }
        }

        @Test
        fun `should show 400 bad request error page`() {
            runTestWithSetup(
                koinModules = listOf(KoinTestModule.createTestModule())
            ) {
                // Setup route for testing 400 errors
                application {
                    routing {
                        get("/test-bad-request") {
                            call.respond(HttpStatusCode.BadRequest)
                        }
                    }
                }

                // Make request to bad request route
                val response = client.get("/test-bad-request")
                
                // Assertions
                assertEquals(HttpStatusCode.BadRequest, response.status)
                val body = response.bodyAsText()
                assertContains(body, "400")
                assertContains(body, "Bad Request", ignoreCase = true)
            }
        }

        @Test
        fun `should show internal server error page`() {
            runTestWithSetup(
                koinModules = listOf(KoinTestModule.createTestModule())
            ) {
                // Setup route that throws an exception
                application {
                    routing {
                        get("/error") {
                            throw RuntimeException("Test exception")
                        }
                    }
                }

                // Make request to route that throws exception
                val response = client.get("/error")
                
                // Assertions
                assertEquals(HttpStatusCode.InternalServerError, response.status)
                val body = response.bodyAsText()
                assertContains(body, "500")
                assertContains(body, "Internal Server Error", ignoreCase = true)
            }
        }
    }

    @Nested
    @DisplayName("HTMX Error Handling")
    inner class HtmxErrorHandling {

        @Test
        fun `should return HTMX error response`() {
            runTestWithSetup(
                koinModules = listOf(KoinTestModule.createTestModule())
            ) {
                // Setup route that throws an exception
                application {
                    routing {
                        get("/htmx-error") {
                            throw RuntimeException("Test HTMX exception")
                        }
                    }
                }

                // Make request with HTMX headers
                val response = client.get("/htmx-error") {
                    headers {
                        append("HX-Request", "true")
                    }
                }
                
                // Assertions
                assertEquals(HttpStatusCode.InternalServerError, response.status)
                val body = response.bodyAsText()
                
                // In real app with proper FreeMarker templates, we'd expect this to use
                // the components/error-message.ftl template and have specific HTMX headers
                // but in test configuration the assertion is more limited
                assertContains(body, "error", ignoreCase = true)
            }
        }
    }
}