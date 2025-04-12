package com.toolchest.routes

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
import io.mockk.just
import io.mockk.mockk
import io.mockk.runs
import org.koin.core.context.GlobalContext
import org.koin.core.context.loadKoinModules
import org.koin.core.context.startKoin
import org.koin.core.context.unloadKoinModules
import org.koin.core.module.Module
import org.koin.dsl.module
import java.io.InputStream

class Base64RoutesTest : DescribeSpec({

    // Mock services
    val toolServiceMock = mockk<ToolService>()
    val base64ServiceMock = mockk<Base64Service>()
    
    // Configure mocks
    every { toolServiceMock.recordToolUsage(any()) } just runs
    
    // Configure Base64Service mock
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
                            route("/base64") {
                                base64Routes()
                            }
                        }
                    }
    
                    client.get("/base64").let { response ->
                        response.status shouldBe HttpStatusCode.OK
                        val body = response.bodyAsText()
                        
                        body shouldContain "Base64"
                        body shouldContain "Encode"
                        body shouldContain "Decode"
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
                        response.status shouldBe HttpStatusCode.OK
                        response.bodyAsText() shouldContain "SGVsbG8sIFdvcmxkIQ=="
                    }
                }
            }
            
            it("should handle empty text input") {
                testApplication {
                    application {
                        configureFreeMarkerForTests()
                        routing {
                            route("/base64") {
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
                        response.status shouldBe HttpStatusCode.OK
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
                            route("/base64") {
                                base64Routes()
                            }
                        }
                    }
    
                    val emptyParams = parametersOf()
    
                    client.post("/base64/encode") {
                        contentType(ContentType.Application.FormUrlEncoded)
                        setBody(FormDataContent(emptyParams))
                    }.let { response ->
                        response.status shouldBe HttpStatusCode.OK
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
                        response.status shouldBe HttpStatusCode.OK
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
            
            it("should use URL-safe encoding for files when specified") {
                testApplication {
                    application {
                        configureFreeMarkerForTests()
                        routing {
                            route("/base64") {
                                base64Routes()
                            }
                        }
                    }
    
                    val testFileBytes = "Test+/=?".toByteArray()
    
                    client.submitFormWithBinaryData(
                        url = "/base64/encode-file",
                        formData = formData {
                            append("file", testFileBytes, Headers.build {
                                append(HttpHeaders.ContentDisposition, "form-data; name=file; filename=test.txt")
                                append(HttpHeaders.ContentType, "application/octet-stream")
                            })
                            append("urlSafe", "on")
                        }
                    ).let { response ->
                        response.status shouldBe HttpStatusCode.OK
                        val responseText = response.bodyAsText()
    
                        val textareaPattern = "<textarea[^>]*id=\"result-text\"[^>]*>(.*?)</textarea>".toRegex(RegexOption.DOT_MATCHES_ALL)
                        val textareaMatch = textareaPattern.find(responseText)
    
                        if (textareaMatch != null) {
                            val result = textareaMatch.groupValues[1].trim()
                            result shouldNotContain "+"
                            result shouldNotContain "/"
                        } else {
                            responseText shouldNotContain "\"result\":\"[^\"]*\\+"
                            responseText shouldNotContain "\"result\":\"[^\"]*\\/"
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
                        response.status shouldBe HttpStatusCode.OK
                        response.bodyAsText() shouldContain "Hello, World!"
                    }
                }
            }
            
            it("should handle invalid Base64 input") {
                testApplication {
                    application {
                        configureFreeMarkerForTests()
                        routing {
                            route("/base64") {
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
                        response.status shouldBe HttpStatusCode.OK
                        response.bodyAsText() shouldContain "Error:"
                    }
                }
            }
        }
        
        context("POST /base64/encode-file") {
            it("should encode file content to Base64") {
                testApplication {
                    application {
                        configureFreeMarkerForTests()
                        routing {
                            route("/base64") {
                                base64Routes()
                            }
                        }
                    }
    
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
                        response.status shouldBe HttpStatusCode.OK
                        response.bodyAsText() shouldContain "SGVsbG8sIFdvcmxkIQ=="
                    }
                }
            }
            
            it("should handle large files") {
                testApplication {
                    application {
                        configureFreeMarkerForTests()
                        routing {
                            route("/base64") {
                                base64Routes()
                            }
                        }
                    }
    
                    val largeFileBytes = ByteArray(100 * 1024) { it.toByte() }
    
                    client.submitFormWithBinaryData(
                        url = "/base64/encode-file",
                        formData = formData {
                            append("file", largeFileBytes, Headers.build {
                                append(HttpHeaders.ContentDisposition, "form-data; name=file; filename=large.bin")
                                append(HttpHeaders.ContentType, "application/octet-stream")
                            })
                        }
                    ).let { response ->
                        response.status shouldBe HttpStatusCode.OK
                        val responseText = response.bodyAsText()
    
                        responseText shouldContain "File to Base64 Result"
                        responseText shouldContain "large.bin"
                        responseText shouldContain "<textarea"
    
                        val outputLengthPattern = "Output length: ([\\d,]+)".toRegex()
                        val outputLengthMatch = outputLengthPattern.find(responseText)
                        require(outputLengthMatch != null) { "Response should contain 'Output length: X'" }
    
                        val outputLengthStr = outputLengthMatch.groupValues[1].replace(",", "")
                        val outputLength = outputLengthStr.toIntOrNull()
                        require(outputLength != null) { "Output length should be a number" }
    
                        val expectedMinLength = (largeFileBytes.size * 4 / 3)
                        val expectedMaxLength = expectedMinLength + 20
    
                        (outputLength >= expectedMinLength && outputLength <= expectedMaxLength) shouldBe true
                    }
                }
            }
            
            it("should handle missing file") {
                testApplication {
                    application {
                        configureFreeMarkerForTests()
                        routing {
                            route("/base64") {
                                base64Routes()
                            }
                        }
                    }
    
                    client.submitFormWithBinaryData(
                        url = "/base64/encode-file",
                        formData = formData {
                            // No file appended
                        }
                    ).let { response ->
                        response.status shouldBe HttpStatusCode.OK
                        response.bodyAsText() shouldContain "Error: No file uploaded"
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
                        response.status shouldBe HttpStatusCode.OK
    
                        val contentDisposition = response.headers[HttpHeaders.ContentDisposition]
                        require(contentDisposition != null) { "Content-Disposition header should be present" }
                        contentDisposition shouldContain "attachment"
                        contentDisposition shouldContain "decoded.txt"
    
                        val responseBytes = response.readBytes()
                        responseBytes.decodeToString() shouldBe "Hello, World!"
                    }
                }
            }
            
            it("should use URL-safe decoding when specified") {
                testApplication {
                    application {
                        configureFreeMarkerForTests()
                        routing {
                            route("/base64") {
                                base64Routes()
                            }
                        }
                    }
    
                    val formParameters = parametersOf(
                        "text" to listOf("SGVsbG8sIFdvcmxkIQ=="),
                        "fileName" to listOf("decoded.txt"),
                        "urlSafe" to listOf("on")
                    )
    
                    client.post("/base64/decode-file") {
                        contentType(ContentType.Application.FormUrlEncoded)
                        setBody(FormDataContent(formParameters))
                    }.let { response ->
                        response.status shouldBe HttpStatusCode.OK
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
                            route("/base64") {
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
                        response.status shouldBe HttpStatusCode.BadRequest
                    }
                }
            }
        }
    }
})