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
import io.ktor.server.response.respondText
import io.ktor.server.routing.routing
import kotlinx.serialization.json.Json
import org.slf4j.event.Level
import freemarker.core.HTMLOutputFormat
import io.ktor.http.CacheControl

/** Configures all Ktor plugins and middleware for the application */
fun Application.configurePlugins() {
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
        setTemplateExceptionHandler { te, env, out ->
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

    // Setup global error handling
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            call.respondText(
                text = "500: ${cause.message ?: "An error occurred"}",
                contentType = ContentType.Text.Plain,
                status = HttpStatusCode.InternalServerError
            )
        }
    }
}
