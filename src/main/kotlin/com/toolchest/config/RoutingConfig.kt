package com.toolchest.config

import com.toolchest.routes.base64Routes
import com.toolchest.routes.homeRoutes
import io.ktor.http.CacheControl
import io.ktor.http.ContentType
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.freemarker.FreeMarkerContent
import io.ktor.server.http.content.staticResources
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.routing.routing

/** Configures all routes for the application */
fun Application.configureRouting() {
    routing {
        // Serve static resources from resources/static directory
        staticResources("/static", "static") {
            // Configure caching for static resources
            cacheControl {
                // 7 day caching for static assets as specified in project guidelines
                listOf(CacheControl.MaxAge(maxAgeSeconds = 60 * 60 * 24 * 7))
            }
        }

        // Health check endpoint
        get("/health") { call.respondText("OK", ContentType.Text.Plain) }

        // Apply home routes
        homeRoutes()

        // Base64 tool routes
        route("/base64") { base64Routes() }

        // Placeholder routes for links in header and footer
        get("/tools") {
            val model = mapOf(
                "pageTitle" to "All Tools",
                "pageDescription" to "Browse all available tools in ToolChest."
            )

            call.respond(FreeMarkerContent("pages/coming-soon.ftl", model))
        }

        // Legal pages
        get("/privacy") {
            val model = mapOf(
                "pageTitle" to "Privacy Policy",
                "pageDescription" to "ToolChest privacy policy."
            )

            call.respond(FreeMarkerContent("pages/coming-soon.ftl", model))
        }

        get("/terms") {
            val model = mapOf(
                "pageTitle" to "Terms of Service",
                "pageDescription" to "ToolChest terms of service."
            )

            call.respond(FreeMarkerContent("pages/coming-soon.ftl", model))
        }

        get("/contact") {
            val model = mapOf(
                "pageTitle" to "Contact Us",
                "pageDescription" to "Contact the ToolChest team."
            )

            call.respond(FreeMarkerContent("pages/coming-soon.ftl", model))
        }
        
        // Category pages
        val categoryRoutes = listOf(
            "encoders-decoders", 
            "formatters", 
            "converters", 
            "generators"
        )
        
        categoryRoutes.forEach { category ->
            get("/category/$category") {
                val formattedCategory = category.split("-")
                    .joinToString(" ") { it.capitalize() }
                
                val model = mapOf(
                    "pageTitle" to "$formattedCategory Tools",
                    "pageDescription" to "Browse $formattedCategory tools in ToolChest."
                )
                
                call.respond(FreeMarkerContent("pages/coming-soon.ftl", model))
            }
        }
    }
}
