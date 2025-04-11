package com.toolchest.routes

import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

/**
 * Routes for the home page and other general pages
 */
fun Route.homeRoutes() {
    // Home page route
    get("/") {
        call.respond(FreeMarkerContent("pages/home.ftl", null))
    }
    
    // About page route
    get("/about") {
        call.respond(FreeMarkerContent("pages/about.ftl", mapOf(
            "pageTitle" to "About Us",
            "pageDescription" to "Learn more about ToolChest and our mission to provide free, useful tools."
        )))
    }
}