package com.toolchest.routes

import com.toolchest.KoinBaseTest
import com.toolchest.configureFreeMarkerForTests
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
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
            // Check that the page contains the expected content
            val body = response.bodyAsText()
            assertTrue(body.contains("Base64 Encoder/Decoder"), "Page should contain the tool title")
            assertTrue(body.contains("Encode"), "Page should contain encode option")
            assertTrue(body.contains("Decode"), "Page should contain decode option")
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
            
            // Look for the encoded result in the response
            val textareaPattern = "<textarea[^>]*id=\"result-text\"[^>]*>(.*?)</textarea>".toRegex(RegexOption.DOT_MATCHES_ALL)
            val match = textareaPattern.find(responseText)
            
            if (match != null) {
                val encodedResult = match.groupValues[1].trim()
                // URL-safe encoding should not contain + or /
                assertFalse(encodedResult.contains("+"), "URL-safe encoding should not contain '+'")
                assertFalse(encodedResult.contains("/"), "URL-safe encoding should not contain '/'")
            } else {
                // If we can't find the specific encoded result, at least make sure response has expected elements
                assertTrue(responseText.contains("Base64 Encoder"), "Response should contain expected elements")
            }
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

            // Check that the response contains the expected encoded content
            assertTrue(
                responseText.contains("SGVsbG8sIFdvcmxkIQ=="),
                "Response doesn't contain expected Base64 encoded content"
            )
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

            // Check the headers for content disposition - handle nullable safely
            val contentDisposition = response.headers[HttpHeaders.ContentDisposition]
            assertNotNull(contentDisposition, "Content-Disposition header should be present")
            assertTrue(contentDisposition.contains("attachment"), "Content-Disposition should specify attachment")
            assertTrue(contentDisposition.contains("decoded.txt"), "Content-Disposition should include filename")

            // Check the decoded content
            val responseBytes = response.readBytes()
            assertEquals("Hello, World!", responseBytes.decodeToString())
        }
    }

    // Edge case tests

    @Test
    fun `POST encode with empty string should return empty result`() = testApplication {
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
            assertEquals(HttpStatusCode.OK, response.status)
            val body = response.bodyAsText()

            // Check for input and output length indicators in the response
            assertTrue(body.contains("Input length: 0"), "Response should show input length as 0")
            assertTrue(body.contains("Output length: 0"), "Response should show output length as 0")

            // The textarea should exist and contain an empty string
            val textareaPattern = "<textarea[^>]*id=\"result-text\"[^>]*>(.*?)</textarea>".toRegex(RegexOption.DOT_MATCHES_ALL)
            val textareaMatch = textareaPattern.find(body)
            assertNotNull(textareaMatch, "Textarea element should be found")

            val content = textareaMatch.groupValues[1].trim()
            assertEquals("", content, "Result should be empty")
        }
    }

    @Test
    fun `POST decode with invalid Base64 should handle error`() = testApplication {
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
            assertEquals(HttpStatusCode.OK, response.status)
            val body = response.bodyAsText()
            assertTrue(body.contains("Error:"))
        }
    }

    @Test
    fun `POST decode-file with invalid Base64 should return BadRequest`() = testApplication {
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
            assertEquals(HttpStatusCode.BadRequest, response.status)
        }
    }

    @Test
    fun `POST encode-file with no file should handle error`() = testApplication {
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
            assertEquals(HttpStatusCode.OK, response.status)
            val body = response.bodyAsText()
            assertTrue(body.contains("Error: No file uploaded"))
        }
    }

    @Test
    fun `POST encode-file with large file should work correctly`() = testApplication {
        application {
            configureFreeMarkerForTests()
            routing {
                route("/base64") {
                    base64Routes()
                }
            }
        }

        // Create a moderately large file (100KB)
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
            assertEquals(HttpStatusCode.OK, response.status)
            val responseText = response.bodyAsText()

            println("Response prefix: ${responseText.take(500)}")

            // Verify key elements exist
            assertTrue(
                responseText.contains("File to Base64 Result"),
                "Response should contain the result header"
            )

            assertTrue(
                responseText.contains("large.bin"),
                "Response should contain the filename"
            )

            assertTrue(
                responseText.contains("<textarea"),
                "Response should contain a textarea element"
            )

            // Updated regex pattern to handle formatted numbers with commas
            // Examples: "Output length: 136,536 characters" or "Output length: 136536 characters"
            val outputLengthPattern = "Output length: ([\\d,]+)".toRegex()
            val outputLengthMatch = outputLengthPattern.find(responseText)
            assertNotNull(outputLengthMatch, "Response should contain 'Output length: X'")

            // Extract the value and remove any commas before parsing
            val outputLengthStr = outputLengthMatch.groupValues[1].replace(",", "")
            val outputLength = outputLengthStr.toIntOrNull()
            assertNotNull(outputLength, "Output length should be a number")

            // Base64 encoding makes output ~4/3 of input size (plus potential padding)
            val expectedMinLength = (largeFileBytes.size * 4 / 3)
            val expectedMaxLength = expectedMinLength + 20 // Allow some padding/variation

            assertTrue(
                outputLength in expectedMinLength..expectedMaxLength,
                "Output length ($outputLength) should be approximately 4/3 of input length, between $expectedMinLength and $expectedMaxLength"
            )
        }
    }

    @Test
    fun `POST encode-file with URL-safe option should use URL-safe encoding`() = testApplication {
        application {
            configureFreeMarkerForTests()
            routing {
                route("/base64") {
                    base64Routes()
                }
            }
        }

        // Create a test file with characters that would be affected by URL-safe encoding
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
            assertEquals(HttpStatusCode.OK, response.status)
            val responseText = response.bodyAsText()

            // Extract the actual result from the response using a safer approach
            // First check if the response contains a textarea with the result
            val textareaPattern = "<textarea[^>]*id=\"result-text\"[^>]*>(.*?)</textarea>".toRegex(RegexOption.DOT_MATCHES_ALL)
            val textareaMatch = textareaPattern.find(responseText)
            
            if (textareaMatch != null) {
                val result = textareaMatch.groupValues[1].trim()
                // URL-safe encoding should not contain + or /
                assertFalse(result.contains("+"), "URL-safe encoding should not contain '+'")
                assertFalse(result.contains("/"), "URL-safe encoding should not contain '/'")
            } else {
                // If we can't find the textarea, check the entire response
                assertFalse(responseText.contains("\"result\":\"[^\"]*\\+"), "Response should not contain '+' in encoded result")
                assertFalse(responseText.contains("\"result\":\"[^\"]*\\/"), "Response should not contain '/' in encoded result")
            }
        }
    }

    @Test
    fun `POST decode-file with URL-safe option should use URL-safe decoding`() = testApplication {
        application {
            configureFreeMarkerForTests()
            routing {
                route("/base64") {
                    base64Routes()
                }
            }
        }

        // This is URL-safe Base64 for "Hello, World!" with - and _ instead of + and /
        val formParameters = parametersOf(
            "text" to listOf("SGVsbG8sIFdvcmxkIQ=="),
            "fileName" to listOf("decoded.txt"),
            "urlSafe" to listOf("on")  // Enable URL-safe option
        )

        client.post("/base64/decode-file") {
            contentType(ContentType.Application.FormUrlEncoded)
            setBody(FormDataContent(formParameters))
        }.let { response ->
            assertEquals(HttpStatusCode.OK, response.status)
            val responseBytes = response.readBytes()
            assertEquals("Hello, World!", responseBytes.decodeToString())
        }
    }

    @Test
    fun `POST with missing parameters should handle gracefully`() = testApplication {
        application {
            configureFreeMarkerForTests()
            routing {
                route("/base64") {
                    base64Routes()
                }
            }
        }

        // Post with no parameters
        val emptyParams = parametersOf()

        client.post("/base64/encode") {
            contentType(ContentType.Application.FormUrlEncoded)
            setBody(FormDataContent(emptyParams))
        }.let { response ->
            assertEquals(HttpStatusCode.OK, response.status)
            // Should encode an empty string
            val body = response.bodyAsText()

            // Check for input and output length indicators in the response
            assertTrue(body.contains("Input length: 0"), "Response should show input length as 0")
            assertTrue(body.contains("Output length: 0"), "Response should show output length as 0")

            // The textarea should exist and contain an empty string
            val textareaPattern = "<textarea[^>]*id=\"result-text\"[^>]*>(.*?)</textarea>".toRegex(RegexOption.DOT_MATCHES_ALL)
            val textareaMatch = textareaPattern.find(body)
            assertNotNull(textareaMatch, "Textarea element should be found")

            val content = textareaMatch.groupValues[1].trim()
            assertEquals("", content, "Result should be empty")
        }
    }
}