package com.toolchest.config

import freemarker.cache.ClassTemplateLoader
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCallPipeline
import io.ktor.server.application.call
import io.ktor.server.application.install
import io.ktor.server.application.log
import io.ktor.server.freemarker.FreeMarker
import io.ktor.server.freemarker.FreeMarkerContent
import io.ktor.server.http.content.staticResources
import io.ktor.server.plugins.callloging.CallLogging
import io.ktor.server.plugins.compression.Compression
import io.ktor.server.plugins.compression.gzip
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.routing
import kotlinx.serialization.json.Json
import org.slf4j.event.Level
import freemarker.core.HTMLOutputFormat
import io.ktor.http.CacheControl

/** Configures all Ktor plugins and middleware for the application */
fun Application.configurePlugins() {
    println("Configuring Ktor plugins...")
    // Determine if we're in development mode
    val isDevelopmentMode = System.getenv("TOOLCHEST_DEV_MODE")?.equals("true", ignoreCase = true) == true

    if (isDevelopmentMode) {
        log.info("🛠️ Running in DEVELOPMENT MODE - caching is minimized for faster development")
    } else {
        log.info("🚀 Running in PRODUCTION MODE - caching is optimized for performance")
    }

    // Setup call logging
    install(CallLogging) { level = Level.INFO }

    // Configure FreeMarker template engine
    install(FreeMarker) {
        templateLoader = ClassTemplateLoader(this::class.java.classLoader, "templates")
        outputFormat = HTMLOutputFormat.INSTANCE
        defaultEncoding = "UTF-8"

        // Enable auto-includes for all templates
        addAutoInclude("components/macros.ftl")

        // Set shared variables that will be available in all templates
        setSharedVariable("appName", "ToolChest")
        setSharedVariable("appVersion", "1.0.0")

        // Set template exception handler
        setTemplateExceptionHandler { te, _, out ->
            log.error("FreeMarker template error: ${te.message}", te)
            out.write("An error occurred while rendering the page. Please try again later.")
        }
    }

    // Configure static resource serving with appropriate caching
    routing {
        // Serve static resources from the classpath with caching
        staticResources("/static", "static") {
            // Configure caching for static resources based on environment
            if (!isDevelopmentMode) {
                cacheControl {
                    // 7 day caching for static assets in production
                    listOf(CacheControl.MaxAge(maxAgeSeconds = 60 * 60 * 24 * 7))
                }
            } else {
                // In development mode, use a very short cache time
                cacheControl {
                    // 1 second caching in development for quick feedback during changes
                    listOf(CacheControl.MaxAge(maxAgeSeconds = 1))
                }
            }
        }
    }

    // Enable gzip compression as specified in project guidelines
    install(Compression) { gzip { priority = 1.0 } }

    // Custom headers to control caching based on environment and content type
    intercept(ApplicationCallPipeline.Plugins) {
        if (isDevelopmentMode) {
            // In development mode, disable caching for all responses for immediate feedback
            call.response.headers.append(HttpHeaders.CacheControl, "no-store, no-cache, must-revalidate, max-age=0")
            // Add additional headers to prevent caching in development
            call.response.headers.append(HttpHeaders.Pragma, "no-cache")
            call.response.headers.append(HttpHeaders.Expires, "0")
        } else {
            // In production, control caching based on content type
            val contentTypeValue = call.response.headers[HttpHeaders.ContentType]
            if (contentTypeValue?.startsWith("text/html") == true) {
                // For HTML pages in production, use short-lived cache
                call.response.headers.append(
                    HttpHeaders.CacheControl,
                    "public, max-age=300" // 5 minutes cache for HTML in production
                )
            }
        }
    }

    // Setup content negotiation with JSON
    install(ContentNegotiation) {
        json(
            Json {
                prettyPrint = true
                isLenient = true
            }
        )
    }

    // Setup enhanced error handling with custom error pages
    install(StatusPages) {
        // Handle common HTTP status codes
        status(HttpStatusCode.NotFound) { call, _ ->
            val referer = call.request.headers["Referer"]
            call.respond(
                HttpStatusCode.NotFound,
                FreeMarkerContent(
                    "pages/error.ftl",
                    mapOf(
                        "pageTitle" to "Page Not Found | ToolChest",
                        "pageDescription" to "The requested page could not be found.",
                        "error" to ErrorPageModel(
                            errorCode = 404,
                            errorTitle = "Page Not Found",
                            errorMessage = "The page you're looking for doesn't exist or has been moved.",
                            suggestedAction = "Check the URL or try searching for the tool you need.",
                            showBackLink = referer != null
                        )
                    )
                )
            )
        }
        
        status(HttpStatusCode.Forbidden) { call, _ ->
            call.respond(
                HttpStatusCode.Forbidden,
                FreeMarkerContent(
                    "pages/error.ftl",
                    mapOf(
                        "pageTitle" to "Access Denied | ToolChest",
                        "pageDescription" to "You don't have permission to access this resource.",
                        "error" to ErrorPageModel(
                            errorCode = 403,
                            errorTitle = "Access Denied",
                            errorMessage = "You don't have permission to access this resource.",
                            suggestedAction = "Please check your credentials or contact us if you think this is an error."
                        )
                    )
                )
            )
        }
        
        status(HttpStatusCode.BadRequest) { call, _ ->
            call.respond(
                HttpStatusCode.BadRequest,
                FreeMarkerContent(
                    "pages/error.ftl",
                    mapOf(
                        "pageTitle" to "Bad Request | ToolChest",
                        "pageDescription" to "The request could not be processed.",
                        "error" to ErrorPageModel(
                            errorCode = 400,
                            errorTitle = "Bad Request",
                            errorMessage = "The server couldn't process your request due to invalid syntax.",
                            suggestedAction = "Please check your input and try again."
                        )
                    )
                )
            )
        }

        // Add specific exception handlers for known exceptions
        exception<IllegalArgumentException> { call, cause ->
            // Determine if this is an HTMX request
            val isHtmxRequest = call.request.headers["HX-Request"] == "true"
            
            if (isHtmxRequest) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    FreeMarkerContent(
                        "components/error-message.ftl",
                        mapOf("errorMessage" to (cause.message ?: "Invalid input provided"))
                    )
                )
            } else {
                call.respond(
                    HttpStatusCode.BadRequest,
                    FreeMarkerContent(
                        "pages/error.ftl",
                        mapOf(
                            "pageTitle" to "Invalid Input | ToolChest",
                            "pageDescription" to "The provided input is invalid.",
                            "error" to ErrorPageModel(
                                errorCode = 400,
                                errorTitle = "Invalid Input",
                                errorMessage = cause.message ?: "The provided input is invalid.",
                                suggestedAction = "Please check your input and try again."
                            )
                        )
                    )
                )
            }
        }

        // Generic exception handler for unexpected errors
        exception<Throwable> { call, cause ->
            // Log the error with structured information
            call.application.log.error("Unhandled exception", cause)
            
            // Determine if this is an HTMX request
            val isHtmxRequest = call.request.headers["HX-Request"] == "true"
            
            // For API endpoints and HTMX requests, consider different responses
            if (isHtmxRequest) {
                // For HTMX requests, return a fragment that can be inserted
                call.respond(
                    HttpStatusCode.InternalServerError,
                    FreeMarkerContent(
                        "components/error-message.ftl",
                        mapOf(
                            "errorMessage" to "An unexpected error occurred. Please try again later."
                        )
                    )
                )
            } else {
                // Full page response for regular web requests
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
                                suggestedAction = "Please try again later. If the problem persists, please contact us."
                            )
                        )
                    )
                )
            }
        }
    }
}
