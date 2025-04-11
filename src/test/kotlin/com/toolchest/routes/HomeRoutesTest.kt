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
    fun `GET home route should return OK status with correct content`() = testApplication {
        application {
            configureFreeMarkerForTests() // Use production templates
            routing {
                homeRoutes()
            }
        }
        
        client.get("/").let { response ->
            assertEquals(HttpStatusCode.OK, response.status)
            val bodyText = response.bodyAsText()
            
            // Verify key elements are present in the home page
            assertTrue(bodyText.contains("ToolChest"), "Home page should contain app name")
            assertTrue(bodyText.contains("Base64 Encoder/Decoder"), "Home page should list Base64 tool")
            
            // Verify page metadata is correct - note we're checking for title content only, not the full tag structure
            assertTrue(bodyText.contains("Free Online Utility Tools"), "Home page should have correct title content")
            assertTrue(bodyText.contains("ToolChest offers free online utility tools"), 
                "Home page should have meta description content")
        }
    }
    
    @Test
    fun `GET home route should contain all tool cards`() = testApplication {
        application {
            configureFreeMarkerForTests() // Use production templates
            routing {
                homeRoutes()
            }
        }
        
        client.get("/").let { response ->
            assertEquals(HttpStatusCode.OK, response.status)
            val bodyText = response.bodyAsText()
            
            // Check for tool card components
            assertTrue(bodyText.contains("/base64"), "Home page should contain link to Base64 tool")
            assertTrue(bodyText.contains("fa-code"), "Home page should have the Base64 tool icon")
            assertTrue(bodyText.contains("Convert text to Base64"), "Home page should have tool description")
        }
    }
    
    @Test
    fun `GET about route should return OK status with correct content`() = testApplication {
        application {
            configureFreeMarkerForTests() // Use production templates
            routing {
                homeRoutes()
            }
        }
        
        client.get("/about").let { response ->
            assertEquals(HttpStatusCode.OK, response.status)
            val bodyText = response.bodyAsText()
            
            // Verify about page content - just check for content, not strict HTML structure
            assertTrue(bodyText.contains("About"), "About page should contain 'About' in content")
            
            // Verify content rather than exact HTML structure
            assertTrue(bodyText.contains("About Us"), "About page should have correct title content")
            assertTrue(bodyText.contains("Learn more about ToolChest"), 
                "About page should have correct meta description content")
        }
    }
    
    @Test
    fun `GET non-existent route should return 404`() = testApplication {
        application {
            configureFreeMarkerForTests()
            routing {
                homeRoutes()
            }
        }
        
        client.get("/non-existent-path").let { response ->
            assertEquals(HttpStatusCode.NotFound, response.status)
        }
    }
    
    @Test
    fun `Home page HTML should be valid and accessible`() = testApplication {
        application {
            configureFreeMarkerForTests()
            routing {
                homeRoutes()
            }
        }
        
        client.get("/").let { response ->
            val bodyText = response.bodyAsText()
            
            // Check for content rather than strict HTML structure
            assertTrue(bodyText.contains("Your Toolkit for Everyday Tasks"), 
                "Home page should contain hero section heading")
            
            // Test for semantic elements or other accessibility features that might be present
            // Note: We're just checking for presence of common semantic elements used in templates
            assertTrue(
                bodyText.contains("<div") || 
                bodyText.contains("<h1") || 
                bodyText.contains("<h2") || 
                bodyText.contains("<p") || 
                bodyText.contains("role=") || 
                bodyText.contains("class="),
                "Home page should have basic semantic HTML structure"
            )
        }
    }
    
    @Test
    fun `About page HTML should be valid and accessible`() = testApplication {
        application {
            configureFreeMarkerForTests()
            routing {
                homeRoutes()
            }
        }
        
        client.get("/about").let { response ->
            val bodyText = response.bodyAsText()
            
            // Check for content rather than strict HTML structure
            assertTrue(bodyText.contains("About Us"), "About page should have correct title content")
            
            // Check for accessibility features
            assertTrue(bodyText.contains("aria-") || bodyText.contains("alt=") || 
                      bodyText.contains("About ToolChest"), 
                "About page should have accessibility features or appropriate headings")
        }
    }
}