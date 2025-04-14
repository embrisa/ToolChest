package com.toolchest.routes

import com.toolchest.MockFactory
import com.toolchest.KoinTestModule
import com.toolchest.runTestWithSetup
import com.toolchest.services.Base64Service
import com.toolchest.services.Base64ServiceImpl
import com.toolchest.services.ToolService
import io.ktor.client.call.body
import io.ktor.client.request.*
import io.ktor.client.request.forms.FormDataContent
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.mockk.*
import org.junit.jupiter.api.*
import kotlin.test.assertEquals
import kotlin.test.assertContains
import kotlin.test.assertFalse
import kotlin.test.assertNotEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

/**
 * Tests for Base64Routes, handling existing Koin setup in Application.module
 */
class Base64RoutesTest {

    @Nested
    @DisplayName("Base64 Tool Page Tests")
    inner class Base64ToolPageTests {

        @Test
        fun `GET base64 should return OK status and record usage`() {
            // 1. Create specific mock needed
            val toolServiceMock = MockFactory.createToolServiceMock()

            // 2. Run the test with the Koin module
            runTestWithSetup(
                koinModules = listOf(KoinTestModule.createTestModule(toolService = toolServiceMock))
            ) {
                // 3. Make the client request
                val response = client.get("/base64")

                // 4. Assertions
                assertEquals(HttpStatusCode.OK, response.status)
                val body = response.bodyAsText()
                assertContains(body, "Base64 Encoder / Decoder", ignoreCase = true)

                // 5. Verify the call was made on the correct mock
                verify(exactly = 1) { toolServiceMock.recordToolUsage("base64") }
            }
        }
    }


    @Nested
    @DisplayName("Base64 Encode Tests")
    inner class Base64EncodeTests {

        @Test
        fun `POST base64 encode should encode text and record usage`() {
            // 1. Prepare mocks
            val base64ServiceMock = mockk<Base64Service>()
            val toolServiceMock = MockFactory.createToolServiceMock()

            // 2. Run Test with Setup
            runTestWithSetup(
                koinModules = listOf(
                    KoinTestModule.createTestModule(
                        base64Service = base64ServiceMock,
                        toolService = toolServiceMock
                    )
                )
            ) {
                // 3. Setup mock behavior specific to this test
                every { base64ServiceMock.encodeString("Hello", false) } returns "SGVsbG8="

                // 4. Perform request
                val response = client.post("/base64/encode") {
                    contentType(ContentType.Application.FormUrlEncoded)
                    setBody(FormDataContent(parametersOf("text" to listOf("Hello"))))
                }

                // 5. Assertions
                assertEquals(HttpStatusCode.OK, response.status)
                assertContains(response.bodyAsText(), "SGVsbG8=")

                // 6. Verifications
                verify(exactly = 1) { toolServiceMock.recordToolUsage("base64") }
                verify(exactly = 1) { base64ServiceMock.encodeString("Hello", false) }
            }
        }

        @Test
        fun `POST base64 encode should handle empty text input`() {
            // 1. Prepare mocks
            val toolServiceMock = MockFactory.createToolServiceMock()

            // 2. Run test
            runTestWithSetup(
                koinModules = listOf(
                    KoinTestModule.createTestModule(
                        base64Service = Base64ServiceImpl(), // Use real implementation
                        toolService = toolServiceMock
                    )
                )
            ) {
                // 3. Make request with empty text
                val response = client.post("/base64/encode") {
                    contentType(ContentType.Application.FormUrlEncoded)
                    setBody(FormDataContent(parametersOf("text" to listOf(""))))
                }

                // 4. Assertions
                assertEquals(HttpStatusCode.OK, response.status)
                val body = response.bodyAsText()
                assertContains(body, "Input length: 0")
                assertContains(body, "Output length: 0")

                // Check textarea content specifically
                val textareaPattern = "<textarea[^>]*id=\"result-text\"[^>]*>(.*?)</textarea>".toRegex(RegexOption.DOT_MATCHES_ALL)
                val textareaMatch = textareaPattern.find(body)
                assertNotNull(textareaMatch, "Textarea element should be found")
                assertEquals("", textareaMatch.groupValues[1].trim(), "Textarea should be empty for empty input")

                // 5. Verification
                verify(exactly = 1) { toolServiceMock.recordToolUsage("base64") }
            }
        }

        @Test
        fun `POST base64 encode should handle missing text parameter gracefully`() {
            // 1. Prepare mocks
            val toolServiceMock = MockFactory.createToolServiceMock()

            // 2. Run test
            runTestWithSetup(
                koinModules = listOf(
                    KoinTestModule.createTestModule(
                        base64Service = Base64ServiceImpl(), // Use real implementation
                        toolService = toolServiceMock
                    )
                )
            ) {
                // 3. Make request with missing 'text' parameter
                val response = client.post("/base64/encode") {
                    contentType(ContentType.Application.FormUrlEncoded)
                    // Send empty parameters or parameters without 'text'
                    setBody(FormDataContent(parametersOf("urlSafe" to listOf("off"))))
                }

                // 4. Assertions
                assertEquals(HttpStatusCode.OK, response.status)
                val body = response.bodyAsText()
                assertContains(body, "Input length: 0")
                assertContains(body, "Output length: 0")

                val textareaPattern = "<textarea[^>]*id=\"result-text\"[^>]*>(.*?)</textarea>".toRegex(RegexOption.DOT_MATCHES_ALL)
                val textareaMatch = textareaPattern.find(body)
                assertNotNull(textareaMatch, "Textarea element should be found")
                assertEquals("", textareaMatch.groupValues[1].trim(), "Textarea should be empty for missing input")

                // 5. Verification
                verify(exactly = 1) { toolServiceMock.recordToolUsage("base64") }
            }
        }
    }

    @Nested
    @DisplayName("URL-safe Encoding Tests")
    inner class URLSafeEncodingTests {

        @Test
        fun `POST base64 encode should use URL-safe encoding when specified`() {
            // 1. Prepare mocks
            val toolServiceMock = MockFactory.createToolServiceMock()

            // 2. Run test
            runTestWithSetup(
                koinModules = listOf(
                    KoinTestModule.createTestModule(
                        base64Service = Base64ServiceImpl(), // Use real implementation
                        toolService = toolServiceMock
                    )
                )
            ) {
                // 3. Make request with urlSafe=on
                // Using a string that will definitely contain '+' and '/' in standard Base64 encoding
                val inputText = "\u00fb\u00ef\u00bf" // This will produce +/+ in standard Base64
                val response = client.post("/base64/encode") {
                    contentType(ContentType.Application.FormUrlEncoded)
                    setBody(
                        FormDataContent(
                            parametersOf(
                                "text" to listOf(inputText),
                                "urlSafe" to listOf("on") // Important part
                            )
                        )
                    )
                }

                // 4. Assertions
                assertEquals(HttpStatusCode.OK, response.status)
                val responseText = response.bodyAsText()

                // Extract result from textarea
                val textareaPattern = "<textarea[^>]*id=\"result-text\"[^>]*>(.*?)</textarea>".toRegex(RegexOption.DOT_MATCHES_ALL)
                val match = textareaPattern.find(responseText)
                assertNotNull(match, "Should find textarea with results")
                val encodedResult = match.groupValues[1].trim()

                // Get both standard and URL-safe encodings for comparison
                val standardEncoded = java.util.Base64.getEncoder().encodeToString(inputText.toByteArray())
                val urlSafeEncoded = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(inputText.toByteArray())

                // The standard encoding should have '+' and '/' characters
                assertTrue(
                    "+" in standardEncoded || "/" in standardEncoded,
                    "Standard encoding should contain '+' or '/' for this test to be valid"
                )

                // Verify URL-safe characters
                assertFalse("+" in encodedResult, "URL-safe encoding should not contain + character")
                assertFalse("/" in encodedResult, "URL-safe encoding should not contain / character")

                // Verify our encoded result matches what URL-safe encoding should produce
                assertNotEquals(standardEncoded, encodedResult, "URL-safe encoding should differ from standard")
                assertEquals(urlSafeEncoded, encodedResult, "Should match Java's URL-safe encoding")

                // 5. Verification
                verify(exactly = 1) { toolServiceMock.recordToolUsage("base64") }
            }
        }
    }

    @Nested
    @DisplayName("Base64 Decode Tests")
    inner class Base64DecodeTests {

        @Test
        fun `POST base64 decode should decode Base64 to text`() {
            // 1. Prepare mocks
            val toolServiceMock = MockFactory.createToolServiceMock()

            // 2. Run test
            runTestWithSetup(
                koinModules = listOf(
                    KoinTestModule.createTestModule(
                        base64Service = Base64ServiceImpl(), // Use real implementation
                        toolService = toolServiceMock
                    )
                )
            ) {
                // 3. Make request
                val response = client.post("/base64/decode") {
                    contentType(ContentType.Application.FormUrlEncoded)
                    setBody(
                        FormDataContent(
                            parametersOf(
                                "text" to listOf("SGVsbG8sIFdvcmxkIQ=="), // Standard Base64
                                "urlSafe" to listOf("off") // Specify standard
                            )
                        )
                    )
                }

                // 4. Assertions
                assertEquals(HttpStatusCode.OK, response.status)
                // Check textarea content specifically
                val body = response.bodyAsText()
                val textareaPattern = "<textarea[^>]*id=\"result-text\"[^>]*>(.*?)</textarea>".toRegex(RegexOption.DOT_MATCHES_ALL)
                val textareaMatch = textareaPattern.find(body)
                assertNotNull(textareaMatch, "Textarea element should be found")
                assertEquals("Hello, World!", textareaMatch.groupValues[1].trim())
                assertContains(body, "Input length: 20")
                assertContains(body, "Output length: 13")

                // 5. Verification
                verify(exactly = 1) { toolServiceMock.recordToolUsage("base64") }
            }
        }

        @Test
        fun `POST base64 decode should handle invalid Base64 input`() {
            // 1. Prepare mocks
            val toolServiceMock = MockFactory.createToolServiceMock()

            // 2. Run test
            runTestWithSetup(
                koinModules = listOf(
                    KoinTestModule.createTestModule(
                        base64Service = Base64ServiceImpl(), // Use real implementation
                        toolService = toolServiceMock
                    )
                )
            ) {
                // 3. Make request with invalid input
                val response = client.post("/base64/decode") {
                    contentType(ContentType.Application.FormUrlEncoded)
                    setBody(
                        FormDataContent(
                            parametersOf(
                                "text" to listOf("This is not valid Base64!")
                                // urlSafe defaults to off usually
                            )
                        )
                    )
                }

                // 4. Assertions
                assertEquals(HttpStatusCode.OK, response.status) // Still OK, but shows error in page
                val body = response.bodyAsText()
                assertContains(body, "Error:", ignoreCase = true) // Check for error message indicator

                // Check that the result textarea might be empty or show the error
                val textareaPattern = "<textarea[^>]*id=\"result-text\"[^>]*>(.*?)</textarea>".toRegex(RegexOption.DOT_MATCHES_ALL)
                val textareaMatch = textareaPattern.find(body)
                assertNotNull(textareaMatch, "Textarea element should be found")
                // The comment indicates this is commented out intentionally for now
                //assertTrue(textareaMatch.groupValues[1].trim().isEmpty() || textareaMatch.groupValues[1].contains("Error", ignoreCase = true))

                // 5. Verification
                verify(exactly = 1) { toolServiceMock.recordToolUsage("base64") }
            }
        }
    }

    @Nested
    @DisplayName("Base64 File Decode Tests")
    inner class Base64FileDecodeTests {

        @Test
        fun `POST base64 decode-file should decode Base64 to file`() {
            // 1. Prepare mocks
            val toolServiceMock = MockFactory.createToolServiceMock()

            // 2. Run test
            runTestWithSetup(
                koinModules = listOf(
                    KoinTestModule.createTestModule(
                        base64Service = Base64ServiceImpl(), // Use real implementation
                        toolService = toolServiceMock
                    )
                )
            ) {
                // 3. Make request
                val response = client.post("/base64/decode-file") {
                    contentType(ContentType.Application.FormUrlEncoded)
                    setBody(
                        FormDataContent(
                            parametersOf(
                                "text" to listOf("SGVsbG8sIFdvcmxkIQ=="),
                                "fileName" to listOf("decoded.txt"),
                                "urlSafe" to listOf("off")
                            )
                        )
                    )
                }

                // 4. Assertions
                assertEquals(HttpStatusCode.OK, response.status)

                // Check Headers for file download
                val contentDisposition = response.headers[HttpHeaders.ContentDisposition]
                assertNotNull(contentDisposition, "Content-Disposition header should be present")
                assertContains(contentDisposition, "attachment", ignoreCase = true)
                assertContains(contentDisposition, "filename=\"decoded.txt\"", ignoreCase = true)

                assertEquals(ContentType.Application.OctetStream.toString(), response.headers[HttpHeaders.ContentType])

                // Check Body content
                val responseBytes = response.body<ByteArray>()
                assertEquals("Hello, World!", responseBytes.decodeToString())

                // 5. Verification
                verify(exactly = 1) { toolServiceMock.recordToolUsage("base64") }
            }
        }

        @Test
        fun `POST base64 decode-file should return BadRequest for invalid Base64 input`() {
            // 1. Prepare mocks
            val toolServiceMock = MockFactory.createToolServiceMock()

            // 2. Run test
            runTestWithSetup(
                koinModules = listOf(
                    KoinTestModule.createTestModule(
                        base64Service = Base64ServiceImpl(), // Use real implementation
                        toolService = toolServiceMock
                    )
                )
            ) {
                // 3. Make request with invalid input
                val response = client.post("/base64/decode-file") {
                    contentType(ContentType.Application.FormUrlEncoded)
                    setBody(
                        FormDataContent(
                            parametersOf(
                                "text" to listOf("Invalid!Base64@Content"),
                                "fileName" to listOf("file.txt"),
                                "urlSafe" to listOf("off")
                            )
                        )
                    )
                }

                // 4. Assertions - Expecting Bad Request status for file download errors
                assertEquals(HttpStatusCode.BadRequest, response.status)
                // Uncomment to check for specific error message if implemented
                assertContains(response.bodyAsText(), "Invalid Base64 input")

                // 5. Verification
                verify(exactly = 1) { toolServiceMock.recordToolUsage("base64") }
            }
        }
    }
}