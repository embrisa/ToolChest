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
import io.ktor.server.freemarker.FreeMarkerContent
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
        // Since this is a special test for error handling, we use configureFreeMarkerForTests directly
        // rather than configureApplicationForTests which might register routes we don't want
        application {
            configureFreeMarkerForTests()
            
            // We need to configure error handling specifically for these tests
            install(StatusPages) {
                status(HttpStatusCode.NotFound) { call, status ->
                    call.respond(
                        status,
                        FreeMarkerContent(
                            "pages/error.ftl", 
                            mapOf(
                                "pageTitle" to "Page Not Found | ToolChest",
                                "pageDescription" to "The requested page could not be found.",
                                "error" to ErrorPageModel(
                                    errorCode = 404,
                                    errorTitle = "Page Not Found",
                                    errorMessage = "The page you're looking for doesn't exist.",
                                    suggestedAction = "Check the URL or try searching for the tool you need.",
                                    showBackLink = true
                                )
                            )
                        )
                    )
                }
                
                status(HttpStatusCode.BadRequest) { call, status ->
                    call.respond(
                        status,
                        FreeMarkerContent(
                            "pages/error.ftl", 
                            mapOf(
                                "pageTitle" to "Bad Request | ToolChest",
                                "pageDescription" to "The request contains invalid data.",
                                "error" to ErrorPageModel(
                                    errorCode = 400,
                                    errorTitle = "Invalid Input",
                                    errorMessage = "The server couldn't process your request due to invalid syntax.",
                                    suggestedAction = "Please check your input and try again.",
                                    showBackLink = true
                                )
                            )
                        )
                    )
                }
                
                status(HttpStatusCode.InternalServerError) { call, status ->
                    call.respond(
                        status,
                        FreeMarkerContent(
                            "pages/error.ftl", 
                            mapOf(
                                "pageTitle" to "Error | ToolChest",
                                "pageDescription" to "An error occurred while processing your request.",
                                "error" to ErrorPageModel(
                                    errorCode = 500,
                                    errorTitle = "Internal Server Error",
                                    errorMessage = "Something went wrong on our end.",
                                    suggestedAction = "Please try again later. If the problem persists, please contact us.",
                                    showBackLink = true
                                )
                            )
                        )
                    )
                }
                
                exception<Throwable> { call, cause ->
                    // For HTMX requests, respond with a fragment
                    if (call.request.headers["HX-Request"] == "true") {
                        call.respond(
                            HttpStatusCode.InternalServerError,
                            FreeMarkerContent(
                                "components/error-message.ftl",
                                mapOf("errorMessage" to "An unexpected error occurred. Please try again later.")
                            )
                        )
                    } else {
                        call.respond(
                            HttpStatusCode.InternalServerError,
                            FreeMarkerContent(
                                "pages/error.ftl",
                                mapOf(
                                    "pageTitle" to "Error | ToolChest",
                                    "pageDescription" to "An error occurred while processing your request.",
                                    "error" to ErrorPageModel(
                                        errorCode = 500,
                                        errorTitle = "Internal Server Error",
                                        errorMessage = "Something went wrong on our end.",
                                        suggestedAction = "Please try again later. If the problem persists, please contact us.",
                                        showBackLink = true
                                    )
                                )
                            )
                        )
                    }
                }
            }
            
            // Configure test routes for error testing
            routing {
                // Route that returns 404 (handled by status page)
                // This is handled by default when a route doesn't exist
                
                // Route that returns 400 Bad Request
                get("/test-bad-request") {
                    call.respond(HttpStatusCode.BadRequest)
                }
                
                // Route that returns 500 Internal Server Error
                get("/test-server-error") {
                    call.respond(HttpStatusCode.InternalServerError)
                }
                
                // Route that throws an exception to test exception handling
                get("/test-htmx-error") {
                    throw RuntimeException("Test exception")
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
            
            // Check for expected content in the error page
            withClue("Response should contain error title") {
                responseText shouldContain "Page Not Found"
            }
            
            withClue("Response should contain error code") {
                responseText shouldContain "404"
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
            
            withClue("Response should contain error title") {
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
            
            // Verify response contains expected error message
            val responseText = response.bodyAsText()
            
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