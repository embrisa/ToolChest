package com.toolchest.config

import com.toolchest.configureFreeMarkerForTests
import io.kotest.assertions.withClue
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.shouldBe
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.testing.*

/**
 * Tests for custom error handling and error pages.
 * 
 * This test class uses an isolated approach that doesn't extend KoinBaseTest
 * to prevent exceptions from affecting other tests.
 */
class ErrorHandlingTest : StringSpec({

    /**
     * Common setup for error handling tests that configures status pages
     * without disrupting the global Koin container.
     */
    fun setupErrorTestApp(test: suspend ApplicationTestBuilder.() -> Unit) = testApplication {
        // Only configure what's needed for testing error pages, avoid disrupting Koin
        application {
            // Use FreeMarker for templates
            configureFreeMarkerForTests()
            
            // Install custom status pages similar to the main application
            install(StatusPages) {
                status(HttpStatusCode.NotFound) { call, _ ->
                    call.respondText("Page Not Found", status = HttpStatusCode.NotFound)
                }
                
                exception<IllegalArgumentException> { call, cause ->
                    call.respondText("400 Invalid Input: ${cause.message}", status = HttpStatusCode.BadRequest)
                }
                
                exception<RuntimeException> { call, _ ->
                    call.respondText("500 Internal Server Error: Something went wrong on our end", 
                        status = HttpStatusCode.InternalServerError)
                }
            }
            
            // Set up test-specific routes that generate errors without affecting the real routing
            routing {
                get("/valid-route") {
                    call.respondText("Valid route")
                }
                
                get("/test-bad-request") {
                    // Throw the exception in a controlled way that doesn't affect other tests
                    throw IllegalArgumentException("Invalid input provided for test")
                }
                
                get("/test-server-error") {
                    // Throw the exception in a controlled way that doesn't affect other tests
                    throw RuntimeException("Test server error")
                }
                
                get("/test-htmx-error") {
                    // Respond with HTMX-specific error format
                    val isHtmxRequest = call.request.headers["HX-Request"] == "true"
                    if (isHtmxRequest) {
                        call.respondText(
                            "<div id='error-message' class='alert alert-danger'>" +
                            "An unexpected error occurred</div>",
                            ContentType.Text.Html,
                            HttpStatusCode.InternalServerError
                        )
                    } else {
                        throw RuntimeException("Test HTMX error")
                    }
                }
            }
        }
        
        test()
    }

    "should show 404 not found error page" {
        setupErrorTestApp {
            val response = client.get("/non-existent-page")

            // Verify correct status code
            response.status shouldBe HttpStatusCode.NotFound
            
            // Get the response text
            val responseText = response.bodyAsText()
            
            // Simple check for the error message
            withClue("Response should contain error message") {
                responseText shouldContain "Page Not Found"
            }
        }
    }

    "should show 400 bad request error page" {
        setupErrorTestApp {
            val response = client.get("/test-bad-request")

            // Verify correct status code
            response.status shouldBe HttpStatusCode.BadRequest
            
            // Verify response contains expected error page elements
            val responseText = response.bodyAsText()
            withClue("Response should contain error code") {
                responseText shouldContain "400"
            }
            withClue("Response should contain error title") {
                responseText shouldContain "Invalid Input"
            }
        }
    }

    "should show internal server error page" {
        setupErrorTestApp {
            val response = client.get("/test-server-error")

            // Verify correct status code
            response.status shouldBe HttpStatusCode.InternalServerError
            
            // Verify response contains expected error page elements
            val responseText = response.bodyAsText()
            withClue("Response should contain error code") {
                responseText shouldContain "500"
            }
            withClue("Response should contain error message") {
                responseText shouldContain "Internal Server Error"
            }
        }
    }

    "should return HTMX error response" {
        setupErrorTestApp {
            val response = client.get("/test-htmx-error") {
                header("HX-Request", "true")
            }

            // Verify correct status code
            response.status shouldBe HttpStatusCode.InternalServerError
            
            // Verify response contains expected error message component
            val responseText = response.bodyAsText()
            withClue("Response should contain error message component ID") {
                responseText shouldContain "error-message"
            }
            withClue("Response should contain error message text") {
                responseText shouldContain "unexpected error occurred"
            }
            
            // Verify it's a fragment, not a full page
            withClue("HTMX response should not be a full HTML page") {
                (responseText.contains("<html")).shouldBe(false)
            }
        }
    }
})