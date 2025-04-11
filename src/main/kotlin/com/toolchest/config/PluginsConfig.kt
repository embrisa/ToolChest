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
import io.ktor.server.freemarker.FreeMarker
import io.ktor.server.plugins.callloging.CallLogging
import io.ktor.server.plugins.compression.Compression
import io.ktor.server.plugins.compression.gzip
import io.ktor.server.plugins.compression.minimumSize
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.response.respondText
import kotlinx.serialization.json.Json
import org.slf4j.event.Level

/**
 * Configures all Ktor plugins and middleware for the application
 */
fun Application.configurePlugins() {
    // Setup call logging
    install(CallLogging) {
        level = Level.INFO
    }

    // Configure FreeMarker template engine
    install(FreeMarker) {
        templateLoader = ClassTemplateLoader(this::class.java.classLoader, "templates")
    }

    // Enable gzip compression as specified in project guidelines
    install(Compression) {
        gzip {
            priority = 1.0
            minimumSize(1024) // Only compress content larger than 1KB
        }
    }

    // Custom headers to handle caching
    monitorAndInstallHeadersFor(this) {
        header(HttpHeaders.CacheControl, "public, max-age=${60 * 60 * 24 * 7}") // 7 days for static content
    }

    // Setup content negotiation with JSON
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
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

// Helper function to add headers without using DefaultHeaders plugin
private fun monitorAndInstallHeadersFor(
    application: Application,
    configuration: HeadersConfig.() -> Unit = {}
) {
    val config = HeadersConfig().apply(configuration)

    application.intercept(ApplicationCallPipeline.Plugins) {
        for ((name, value) in config.headers) {
            if (!call.response.headers.contains(name)) {
                call.response.headers.append(name, value)
            }
        }
    }
}

// Simple configuration class for headers
private class HeadersConfig {
    val headers = mutableListOf<Pair<String, String>>()

    fun header(name: String, value: String) {
        headers.add(name to value)
    }
}