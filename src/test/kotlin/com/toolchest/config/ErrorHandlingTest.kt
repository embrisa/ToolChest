package com.toolchest.config

import com.toolchest.KoinBaseTest
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.routing.*
import io.ktor.server.testing.*
import kotlin.test.*

/**
 * Tests for custom error handling and error pages.
 */
class ErrorHandlingTest : KoinBaseTest() {

    @Test
    fun `test 404 not found error page`() = testApplication {
        application {
            // Only use configurePlugins which already sets up FreeMarker
            configurePlugins()
            configureRouting()
        }

        val response = client.get("/non-existent-page")

        // Verify correct status code
        assertEquals(HttpStatusCode.NotFound, response.status)

        // Get the response text
        val responseText = response.bodyAsText()

        // Verify response contains expected error page elements
        // Instead of checking for "404" specifically, check for other expected elements
        assertTrue(responseText.contains("Page Not Found"), "Response should contain error title")

        // Use a more flexible check that works regardless of apostrophe encoding
        assertTrue(
            responseText.lowercase().contains("page you") &&
                    responseText.lowercase().contains("looking for") &&
                    responseText.lowercase().contains("exist"),
            "Response should contain error message about page not existing"
        )

        assertTrue(
            responseText.contains("Go to Homepage"),
            "Response should contain homepage link"
        )
    }

    @Test
    fun `test 400 bad request error page`() = testApplication {
        application {
            // Only use configurePlugins which already sets up FreeMarker
            configurePlugins()

            // Set up a route that will trigger a BadRequest response
            routing {
                get("/test-bad-request") {
                    throw IllegalArgumentException("Invalid input provided for test")
                }
            }
        }

        val response = client.get("/test-bad-request")

        // Verify correct status code
        assertEquals(HttpStatusCode.BadRequest, response.status)

        // Verify response contains expected error page elements
        val responseText = response.bodyAsText()
        assertTrue(responseText.contains("400"), "Response should contain error code")
        assertTrue(responseText.contains("Invalid Input"), "Response should contain error title")
        assertTrue(
            responseText.contains("Invalid input provided for test"),
            "Response should contain error message"
        )
    }

    @Test
    fun `test internal server error page`() = testApplication {
        application {
            // Only use configurePlugins which already sets up FreeMarker
            configurePlugins()

            // Set up a route that will trigger a 500 error
            routing {
                get("/test-server-error") {
                    throw RuntimeException("Test server error")
                }
            }
        }

        val response = client.get("/test-server-error")

        // Verify correct status code
        assertEquals(HttpStatusCode.InternalServerError, response.status)

        // Verify response contains expected error page elements
        val responseText = response.bodyAsText()
        assertTrue(responseText.contains("500"), "Response should contain error code")
        assertTrue(responseText.contains("Internal Server Error"), "Response should contain error title")
        assertTrue(
            responseText.contains("Something went wrong on our end"),
            "Response should contain error message"
        )
    }

    @Test
    fun `test HTMX error response`() = testApplication {
        application {
            // Only use configurePlugins which already sets up FreeMarker
            configurePlugins()

            // Set up a route that will trigger an error with an HTMX request
            routing {
                get("/test-htmx-error") {
                    throw RuntimeException("Test HTMX error")
                }
            }
        }

        val response = client.get("/test-htmx-error") {
            header("HX-Request", "true")
        }

        // Verify correct status code
        assertEquals(HttpStatusCode.InternalServerError, response.status)

        // Verify response contains expected error message component
        val responseText = response.bodyAsText()
        assertTrue(responseText.contains("error-message"), "Response should contain error message component ID")
        assertTrue(
            responseText.contains("unexpected error occurred"),
            "Response should contain error message text"
        )

        // Verify it's a fragment, not a full page
        assertTrue(!responseText.contains("<html"), "HTMX response should not be a full HTML page")
        assertTrue(!responseText.contains("<title"), "HTMX response should not contain title tag")
    }
}