package com.toolchest.config

import com.toolchest.routes.base64Routes
import io.ktor.http.CacheControl
import io.ktor.http.ContentType
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.freemarker.FreeMarkerContent
import io.ktor.server.html.respondHtml
import io.ktor.server.http.content.staticResources
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.routing.routing

/**
 * Configures all routes for the application
 */
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
        get("/health") {
            call.respondText("OK", ContentType.Text.Plain)
        }

        // Home page route
        get("/") {
            // Define the tools available in the ToolChest
            val availableTools = listOf(
                mapOf(
                    "id" to "base64",
                    "name" to "Base64 Encoder/Decoder",
                    "description" to "Convert text to Base64, decode Base64 to text, encode files to Base64, and convert Base64 back to files.",
                    "icon" to "fa-code",
                    "url" to "/base64"
                )
                // Additional tools will be added here as they are implemented
            )
            
            val model = mapOf(
                "pageTitle" to "Free Online Utility Tools",
                "pageDescription" to "ToolChest provides free online utility tools for everyday tasks.",
                "availableTools" to availableTools
            )
            
            call.respond(FreeMarkerContent("pages/home.ftl", model))
        }

        // Base64 tool routes
        route("/base64") {
            base64Routes()
        }
        
        // Placeholder routes for links in header and footer
        get("/tools") {
            val model = mapOf(
                "pageTitle" to "All Tools",
                "pageDescription" to "Browse all available tools in ToolChest."
            )
            
            call.respond(FreeMarkerContent("pages/coming-soon.ftl", model, "base.ftl"))
        }
        
        // Category routes
        route("/category") {
            get("/encoders-decoders") {
                val model = mapOf(
                    "pageTitle" to "Encoders & Decoders",
                    "pageDescription" to "Tools for encoding and decoding various formats.",
                    "categoryName" to "Encoders & Decoders"
                )
                
                call.respond(FreeMarkerContent("pages/coming-soon.ftl", model, "base.ftl"))
            }
            
            get("/formatters") {
                val model = mapOf(
                    "pageTitle" to "Formatters",
                    "pageDescription" to "Tools for formatting and beautifying code and data.",
                    "categoryName" to "Formatters"
                )
                
                call.respond(FreeMarkerContent("pages/coming-soon.ftl", model, "base.ftl"))
            }
            
            get("/converters") {
                val model = mapOf(
                    "pageTitle" to "Converters",
                    "pageDescription" to "Tools for converting between different formats and units.",
                    "categoryName" to "Converters"
                )
                
                call.respond(FreeMarkerContent("pages/coming-soon.ftl", model, "base.ftl"))
            }
            
            get("/generators") {
                val model = mapOf(
                    "pageTitle" to "Generators",
                    "pageDescription" to "Tools for generating various types of content.",
                    "categoryName" to "Generators"
                )
                
                call.respond(FreeMarkerContent("pages/coming-soon.ftl", model, "base.ftl"))
            }
        }
        
        // About page
        get("/about") {
            val model = mapOf(
                "pageTitle" to "About ToolChest",
                "pageDescription" to "Learn more about ToolChest and our mission."
            )
            
            call.respond(FreeMarkerContent("pages/coming-soon.ftl", model, "base.ftl"))
        }
        
        // Legal pages
        get("/privacy") {
            val model = mapOf(
                "pageTitle" to "Privacy Policy",
                "pageDescription" to "ToolChest privacy policy."
            )
            
            call.respond(FreeMarkerContent("pages/coming-soon.ftl", model, "base.ftl"))
        }
        
        get("/terms") {
            val model = mapOf(
                "pageTitle" to "Terms of Service",
                "pageDescription" to "ToolChest terms of service."
            )
            
            call.respond(FreeMarkerContent("pages/coming-soon.ftl", model, "base.ftl"))
        }
        
        get("/contact") {
            val model = mapOf(
                "pageTitle" to "Contact Us",
                "pageDescription" to "Contact the ToolChest team."
            )
            
            call.respond(FreeMarkerContent("pages/coming-soon.ftl", model, "base.ftl"))
        }
    }
}