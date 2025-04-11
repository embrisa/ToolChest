package com.toolchest.routes

import com.toolchest.KoinBaseTest
import com.toolchest.configureFreeMarkerForTests
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.ktor.server.routing.*
import kotlin.test.*

class HomeRoutesTest : KoinBaseTest() {
    
    @Test
    fun testHomeRoute() = testApplication {
        application {
            configureFreeMarkerForTests() // Use production templates
            routing {
                homeRoutes()
            }
        }
        
        val response = client.get("/")
        assertEquals(HttpStatusCode.OK, response.status)
        // No need to check the exact content, just verify it contains some expected text
        assertTrue(response.bodyAsText().contains("ToolChest"))
    }
    
    @Test
    fun testAboutRoute() = testApplication {
        application {
            configureFreeMarkerForTests() // Use production templates
            routing {
                homeRoutes()
            }
        }
        
        val response = client.get("/about")
        assertEquals(HttpStatusCode.OK, response.status)
        // Verify it contains the expected title
        assertTrue(response.bodyAsText().contains("About"))
    }
}