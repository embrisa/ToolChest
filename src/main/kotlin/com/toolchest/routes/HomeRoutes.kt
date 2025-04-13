package com.toolchest.routes

import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.request.*
import io.ktor.http.*
import org.koin.ktor.ext.inject
import com.toolchest.services.ToolService

/** Routes for the home page and other general pages */
fun Route.homeRoutes() {
    val toolService by inject<ToolService>()
    
    // Home page route
    get("/") {
        val tools = toolService.getAllTools()
        val popularTools = toolService.getPopularTools(5)
        val allTags = toolService.getAllTags()
        
        val model = mapOf(
            "availableTools" to tools,
            "popularTools" to popularTools,
            "allTags" to allTags,
            "searchQuery" to "",
            "showLoadMore" to (tools.size > 9) // Show load more button if more than initial display count
        )

        // Render the template directly - no layout needed as it's handled by the page macro
        call.respond(FreeMarkerContent("pages/home.ftl", model))
    }

    // Search tools endpoint
    post("/search") {
        val parameters = call.receiveParameters()
        val query = parameters["query"] ?: ""
        
        val searchResults = toolService.searchTools(query)
        val allTags = toolService.getAllTags()
        
        val model = mapOf(
            "availableTools" to searchResults,
            "popularTools" to emptyList<Any>(), // Don't show popular tools in search results
            "allTags" to allTags,
            "searchQuery" to query,
            "showLoadMore" to false // No load more for search results initially
        )
        
        call.respond(FreeMarkerContent("pages/home.ftl", model))
    }
    
    // Load more tools (HTMX endpoint)
    get("/tools/more") {
        val offset = call.request.queryParameters["offset"]?.toIntOrNull() ?: 0
        val limit = call.request.queryParameters["limit"]?.toIntOrNull() ?: 9
        val tagSlug = call.request.queryParameters["tag"]
        
        val moreTools = if (tagSlug != null) {
            toolService.getToolsByTagPaginated(tagSlug, offset, limit)
        } else {
            toolService.getToolsPaginated(offset, limit)
        }
        
        // Only return the tool grid items for HTMX to insert
        call.respond(FreeMarkerContent("pages/partials/tool-grid-items.ftl", mapOf(
            "tools" to moreTools,
            "showLoadMore" to (moreTools.size == limit)
        )))
    }

    // Tag filtering route
    get("/tag/{slug}") {
        val tagSlug = call.parameters["slug"] ?: return@get call.respondRedirect("/")
        val tag = toolService.getTagBySlug(tagSlug)
        
        if (tag == null) {
            return@get call.respondRedirect("/")
        }
        
        val tools = toolService.getToolsByTag(tagSlug)
        val allTags = toolService.getAllTags()
        
        val model = mapOf(
            "tag" to tag,
            "availableTools" to tools,
            "allTags" to allTags,
            "searchQuery" to "",
            "showLoadMore" to (tools.size > 9)
        )
        
        call.respond(FreeMarkerContent("pages/home.ftl", model))
    }

    // About page route
    get("/about") {
        val model = mapOf(
            "pageTitle" to "About Us",
            "pageDescription" to "Learn more about ToolChest and our mission to provide free, useful tools."
        )
        
        // Render the template directly - no layout needed as it's handled by the page macro
        call.respond(FreeMarkerContent("pages/about.ftl", model))
    }
}
