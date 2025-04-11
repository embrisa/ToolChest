package com.toolchest.routes

import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

/** Routes for the home page and other general pages */
fun Route.homeRoutes() {
    // Home page route
    get("/") {
        // Define the tools available in the ToolChest
        val availableTools =
                listOf(
                        mapOf(
                                "id" to "base64",
                                "name" to "Base64 Encoder/Decoder",
                                "description" to
                                        "Convert text to Base64, decode Base64 to text, encode files to Base64, and convert Base64 back to files.",
                                "icon" to "fa-code",
                                "url" to "/base64"
                        )
                        // Additional tools will be added here as they are implemented
                        )

        val model =
                mapOf(
                        "availableTools" to availableTools
                )

        // Render the template directly - no layout needed as it's handled by the page macro
        call.respond(FreeMarkerContent("pages/home.ftl", model))
    }

    // About page route
    get("/about") {
        val model = mapOf(
                "pageTitle" to "About Us",
                "pageDescription" to
                        "Learn more about ToolChest and our mission to provide free, useful tools."
        )
        
        // Render the template directly - no layout needed as it's handled by the page macro
        call.respond(FreeMarkerContent("pages/about.ftl", model))
    }
}
