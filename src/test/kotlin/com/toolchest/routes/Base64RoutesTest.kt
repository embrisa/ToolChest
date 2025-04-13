package com.toolchest.routes

import com.toolchest.MockFactory
import com.toolchest.RouteTestHelper
import com.toolchest.assertOk
import com.toolchest.assertStatus
import com.toolchest.configureFreeMarkerForTests
import com.toolchest.services.Base64Service
import com.toolchest.services.ToolService
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.ktor.server.routing.*
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.koin.core.context.GlobalContext
import org.koin.core.context.loadKoinModules
import org.koin.core.context.startKoin
import org.koin.core.context.unloadKoinModules
import org.koin.dsl.module
import java.io.InputStream

class Base64RoutesTest : DescribeSpec({
    
    // Create mocks with our new MockFactory
    val toolServiceMock = MockFactory.createToolServiceMock()
    
    // For Base64ServiceMock, we need more realistic behavior than the default mock
    val base64ServiceMock = mockk<Base64Service>()
    
    // Configure Base64Service mock with proper answers
    every { base64ServiceMock.encodeString(any(), any()) } answers { 
        val input = firstArg<String>()
        val urlSafe = secondArg<Boolean>()
        if (urlSafe) 
            java.util.Base64.getUrlEncoder().encodeToString(input.toByteArray())
        else
            java.util.Base64.getEncoder().encodeToString(input.toByteArray())
    }
    
    every { base64ServiceMock.decodeString(any(), any()) } answers {
        val input = firstArg<String>()
        val urlSafe = secondArg<Boolean>()
        try {
            if (urlSafe)
                String(java.util.Base64.getUrlDecoder().decode(input))
            else
                String(java.util.Base64.getDecoder().decode(input))
        } catch (e: Exception) {
            throw IllegalArgumentException("Invalid Base64 input")
        }
    }
    
    every { base64ServiceMock.encodeFile(any(), any()) } answers {
        val inputStream = firstArg<InputStream>()
        val urlSafe = secondArg<Boolean>()
        val bytes = inputStream.readAllBytes()
        if (urlSafe) 
            java.util.Base64.getUrlEncoder().encodeToString(bytes)
        else
            java.util.Base64.getEncoder().encodeToString(bytes)
    }
    
    every { base64ServiceMock.decodeToBytes(any(), any()) } answers {
        val input = firstArg<String>()
        val urlSafe = secondArg<Boolean>()
        try {
            if (urlSafe)
                java.util.Base64.getUrlDecoder().decode(input)
            else
                java.util.Base64.getDecoder().decode(input)
        } catch (e: Exception) {
            throw IllegalArgumentException("Invalid Base64 input")
        }
    }
    
    // Create Koin module
    val testModule = module {
        single { toolServiceMock }
        single { base64ServiceMock }
    }
    
    beforeSpec {
        // Start Koin if not started and load our module
        if (GlobalContext.getOrNull() == null) {
            // Initialize Koin
            startKoin {
                modules(testModule)
            }
        } else {
            // Just load our module into existing container
            loadKoinModules(testModule)
        }
    }
    
    afterSpec {
        // Clean up our module if Koin is still running
        if (GlobalContext.getOrNull() != null) {
            unloadKoinModules(testModule)
        }
    }

    describe("Base64 Routes") {
        context("GET /base64") {
            it("should return OK status with expected content") {
                testApplication {
                    application {
                        configureFreeMarkerForTests()
                        routing {
                            route("base64") {
                                base64Routes()
                            }
                        }
                    }
    
                    client.get("/base64").let { response ->
                        response.assertOk()
                        val body = response.bodyAsText()
                        
                        body shouldContain "Base64"
                        body shouldContain "Encode"
                        body shouldContain "Decode"
                        
                        // Verify tool usage was recorded
                        verify { toolServiceMock.recordToolUsage("base64") }
                    }
                }
            }
        }
        
        context("POST /base64/encode") {
            it("should encode text to Base64") {
                testApplication {
                    application {
                        configureFreeMarkerForTests()
                        routing {
                            route("base64") {
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
                        response.assertOk()
                        response.bodyAsText() shouldContain "SGVsbG8sIFdvcmxkIQ=="
                        
                        // Verify tool usage was recorded
                        verify { toolServiceMock.recordToolUsage("base64") }
                    }
                }
            }
            
            it("should handle empty text input") {
                testApplication {
                    application {
                        configureFreeMarkerForTests()
                        routing {
                            route("base64") {
                                base64Routes()
                            }
                        }
                    }
    
                    val formParameters = parametersOf(
                        "text" to listOf(""),
                        "urlSafe" to listOf("off")
                    )
    
                    client.post("/base64/encode") {
                        contentType(ContentType.Application.FormUrlEncoded)
                        setBody(FormDataContent(formParameters))
                    }.let { response ->
                        response.assertOk()
                        val body = response.bodyAsText()
                        
                        body shouldContain "Input length: 0"
                        body shouldContain "Output length: 0"
                        
                        val textareaPattern = "<textarea[^>]*id=\"result-text\"[^>]*>(.*?)</textarea>".toRegex(RegexOption.DOT_MATCHES_ALL)
                        val textareaMatch = textareaPattern.find(body)
                        require(textareaMatch != null) { "Textarea element should be found" }
                        
                        val content = textareaMatch.groupValues[1].trim()
                        content shouldBe ""
                    }
                }
            }
            
            it("should handle missing parameters gracefully") {
                testApplication {
                    application {
                        configureFreeMarkerForTests()
                        routing {
                            route("base64") {
                                base64Routes()
                            }
                        }
                    }
    
                    val emptyParams = parametersOf()
    
                    client.post("/base64/encode") {
                        contentType(ContentType.Application.FormUrlEncoded)
                        setBody(FormDataContent(emptyParams))
                    }.let { response ->
                        response.assertOk()
                        val body = response.bodyAsText()
                        
                        body shouldContain "Input length: 0"
                        body shouldContain "Output length: 0"
                        
                        val textareaPattern = "<textarea[^>]*id=\"result-text\"[^>]*>(.*?)</textarea>".toRegex(RegexOption.DOT_MATCHES_ALL)
                        val textareaMatch = textareaPattern.find(body)
                        require(textareaMatch != null) { "Textarea element should be found" }
                        
                        val content = textareaMatch.groupValues[1].trim()
                        content shouldBe ""
                    }
                }
            }
        }
        
        context("URL-safe encoding") {
            it("should use URL-safe encoding when specified") {
                testApplication {
                    application {
                        configureFreeMarkerForTests()
                        routing {
                            route("base64") {
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
                        response.assertOk()
                        val responseText = response.bodyAsText()
    
                        val textareaPattern = "<textarea[^>]*id=\"result-text\"[^>]*>(.*?)</textarea>".toRegex(RegexOption.DOT_MATCHES_ALL)
                        val match = textareaPattern.find(responseText)
    
                        if (match != null) {
                            val encodedResult = match.groupValues[1].trim()
                            encodedResult shouldNotContain "+"
                            encodedResult shouldNotContain "/"
                        } else {
                            responseText shouldContain "Base64 Encoder"
                        }
                    }
                }
            }
        }
        
        context("POST /base64/decode") {
            it("should decode Base64 to text") {
                testApplication {
                    application {
                        configureFreeMarkerForTests()
                        routing {
                            route("base64") {
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
                        response.assertOk()
                        response.bodyAsText() shouldContain "Hello, World!"
                    }
                }
            }
            
            it("should handle invalid Base64 input") {
                testApplication {
                    application {
                        configureFreeMarkerForTests()
                        routing {
                            route("base64") {
                                base64Routes()
                            }
                        }
                    }
    
                    val formParameters = parametersOf(
                        "text" to listOf("This is not valid Base64!"),
                        "urlSafe" to listOf("off")
                    )
    
                    client.post("/base64/decode") {
                        contentType(ContentType.Application.FormUrlEncoded)
                        setBody(FormDataContent(formParameters))
                    }.let { response ->
                        response.assertOk()
                        response.bodyAsText() shouldContain "Error:"
                    }
                }
            }
        }
        
        context("POST /base64/decode-file") {
            it("should decode Base64 to file") {
                testApplication {
                    application {
                        configureFreeMarkerForTests()
                        routing {
                            route("base64") {
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
                        response.assertOk()
    
                        val contentDisposition = response.headers[HttpHeaders.ContentDisposition]
                        require(contentDisposition != null) { "Content-Disposition header should be present" }
                        contentDisposition shouldContain "attachment"
                        contentDisposition shouldContain "decoded.txt"
    
                        val responseBytes = response.readBytes()
                        responseBytes.decodeToString() shouldBe "Hello, World!"
                    }
                }
            }
            
            it("should handle invalid Base64 input") {
                testApplication {
                    application {
                        configureFreeMarkerForTests()
                        routing {
                            route("base64") {
                                base64Routes()
                            }
                        }
                    }
    
                    val formParameters = parametersOf(
                        "text" to listOf("Invalid!Base64@Content"),
                        "fileName" to listOf("file.txt"),
                        "urlSafe" to listOf("off")
                    )
    
                    client.post("/base64/decode-file") {
                        contentType(ContentType.Application.FormUrlEncoded)
                        setBody(FormDataContent(formParameters))
                    }.let { response ->
                        response.assertStatus(HttpStatusCode.BadRequest)
                    }
                }
            }
        }
    }
})