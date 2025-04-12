package com.toolchest.routes

import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import com.toolchest.services.ToolService

/** Routes for the home page and other general pages */
fun Route.homeRoutes() {
    val toolService by inject<ToolService>()
    
    // Home page route
    get("/") {
        val tools = toolService.getAllTools()
        val tags = toolService.getAllTags()
        val popularTools = toolService.getPopularTools(5)
        
        val model = mapOf(
            "availableTools" to tools,
            "tags" to tags,
            "popularTools" to popularTools
        )

        // Render the template directly - no layout needed as it's handled by the page macro
        call.respond(FreeMarkerContent("pages/home.ftl", model))
    }
    
    // Tag filtering route
    get("/tag/{slug}") {
        val tagSlug = call.parameters["slug"] ?: return@get call.respondRedirect("/")
        val tag = toolService.getTagBySlug(tagSlug)
        
        // If tag is null, redirect to home page
        if (tag == null) {
            return@get call.respondRedirect("/")
        }
        
        val tools = toolService.getToolsByTag(tagSlug)
        val allTags = toolService.getAllTags()
        
        call.respond(FreeMarkerContent("pages/tag.ftl", mapOf(
            "tag" to tag,
            "tools" to tools,
            "allTags" to allTags
        )))
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
