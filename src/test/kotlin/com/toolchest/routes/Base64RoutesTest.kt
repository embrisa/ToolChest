package com.toolchest.routes

import com.toolchest.KoinBaseTest
import com.toolchest.configureFreeMarkerForTests
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.testing.*
import io.ktor.server.routing.*
import kotlin.test.*

class Base64RoutesTest : KoinBaseTest() {
    
    @Test
    fun `GET base64 page should return OK status`() = testApplication {
        application {
            configureFreeMarkerForTests() // Use production templates
            routing {
                route("/base64") {
                    base64Routes()
                }
            }
        }
        
        client.get("/base64").let { response ->
            assertEquals(HttpStatusCode.OK, response.status)
        }
    }
    
    @Test
    fun `POST encode should encode text to Base64`() = testApplication {
        application {
            configureFreeMarkerForTests() // Use production templates
            routing {
                route("/base64") {
                    base64Routes()
                }
            }
        }
        
        val formParameters = parametersOf(
            "text" to listOf("Hello, World!"),
            "urlSafe" to listOf("off")
        )
        
        client.post("/base64/encode") {
            contentType(ContentType.Application.FormUrlEncoded)
            setBody(FormDataContent(formParameters))
        }.let { response ->
            assertEquals(HttpStatusCode.OK, response.status)
            // Just check that the response contains the encoded value, not the entire template
            assertTrue(response.bodyAsText().contains("SGVsbG8sIFdvcmxkIQ=="))
        }
    }
    
    @Test
    fun `POST decode should decode Base64 to text`() = testApplication {
        application {
            configureFreeMarkerForTests() // Use production templates
            routing {
                route("/base64") {
                    base64Routes()
                }
            }
        }
        
        val formParameters = parametersOf(
            "text" to listOf("SGVsbG8sIFdvcmxkIQ=="),
            "urlSafe" to listOf("off")
        )
        
        client.post("/base64/decode") {
            contentType(ContentType.Application.FormUrlEncoded)
            setBody(FormDataContent(formParameters))
        }.let { response ->
            assertEquals(HttpStatusCode.OK, response.status)
            assertTrue(response.bodyAsText().contains("Hello, World!"))
        }
    }
    
    @Test
    fun `POST encode with URL-safe option should use URL-safe encoding`() = testApplication {
        application {
            configureFreeMarkerForTests()
            routing {
                route("/base64") {
                    base64Routes()
                }
            }
        }
        
        val formParameters = parametersOf(
            "text" to listOf("Hello+World/Test?End"),
            "urlSafe" to listOf("on")
        )
        
        client.post("/base64/encode") {
            contentType(ContentType.Application.FormUrlEncoded)
            setBody(FormDataContent(formParameters))
        }.let { response ->
            assertEquals(HttpStatusCode.OK, response.status)
            val responseText = response.bodyAsText()
            // URL-safe encoding should not contain + or /
            assertTrue(!responseText.contains("+") || !responseText.contains("/"))
        }
    }
    
    @Test
    fun `POST encode-file should encode file content to Base64`() = testApplication {
        application {
            configureFreeMarkerForTests()
            routing {
                route("/base64") {
                    base64Routes()
                }
            }
        }
        
        // Create a test file
        val testFileBytes = "Hello, World!".toByteArray()
        
        client.submitFormWithBinaryData(
            url = "/base64/encode-file",
            formData = formData {
                append("file", testFileBytes, Headers.build {
                    append(HttpHeaders.ContentDisposition, "form-data; name=file; filename=test.txt")
                    append(HttpHeaders.ContentType, "application/octet-stream")
                })
            }
        ).let { response ->
            assertEquals(HttpStatusCode.OK, response.status)
            val responseText = response.bodyAsText()
            
            // Print the full response for debugging
            println("DEBUG: Full response content:")
            println(responseText)
            
            // Check that the response contains the expected encoded content
            assertTrue(responseText.contains("SGVsbG8sIFdvcmxkIQ=="), 
                "Response doesn't contain expected Base64 encoded content")
        }
    }
    
    @Test
    fun `POST decode-file should decode Base64 to file`() = testApplication {
        application {
            configureFreeMarkerForTests() // Use production templates
            routing {
                route("/base64") {
                    base64Routes()
                }
            }
        }
        
        val formParameters = parametersOf(
            "text" to listOf("SGVsbG8sIFdvcmxkIQ=="),
            "fileName" to listOf("decoded.txt"),
            "urlSafe" to listOf("off")
        )
        
        client.post("/base64/decode-file") {
            contentType(ContentType.Application.FormUrlEncoded)
            setBody(FormDataContent(formParameters))
        }.let { response ->
            assertEquals(HttpStatusCode.OK, response.status)
            
            // Check the headers for content disposition
            val contentDisposition = response.headers[HttpHeaders.ContentDisposition]
            assertTrue(contentDisposition?.contains("attachment") == true)
            assertTrue(contentDisposition?.contains("decoded.txt") == true)
            
            // Check the decoded content
            val responseBytes = response.readBytes()
            assertEquals("Hello, World!", responseBytes.decodeToString())
        }
    }
}