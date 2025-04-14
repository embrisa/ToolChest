package com.toolchest.services

import com.toolchest.KoinTestModule
import com.toolchest.runTestWithSetup
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.koin.core.context.loadKoinModules
import java.io.ByteArrayInputStream
import java.util.Random
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue
import kotlin.test.assertContentEquals

/**
 * Tests for Base64ServiceImpl using project test standards
 */
class Base64ServiceImplTest {
    
    @Nested
    @DisplayName("Basic Encoding and Decoding")
    inner class BasicEncodingAndDecoding {
        
        @Test
        fun `encoding a standard string should produce the correct Base64 value`() = runTestWithSetup {
            // Assign
            val service = Base64ServiceImpl()
            
            // Execute test
            val input = "Hello, World!"
            val result = service.encodeString(input)
            
            // Assertions
            assertEquals("SGVsbG8sIFdvcmxkIQ==", result)
        }
        
        @Test
        fun `decoding a valid Base64 string should produce the original string`() = runTestWithSetup {
            // Use a real implementation directly
            val service = Base64ServiceImpl()
            
            // Execute test
            val input = "SGVsbG8sIFdvcmxkIQ=="
            val result = service.decodeString(input)
            
            // Assertions
            assertEquals("Hello, World!", result)
        }
        
        @Test
        fun `encoding a file should produce the correct Base64 value`() = runTestWithSetup {
            // Use a real implementation directly
            val service = Base64ServiceImpl()
            
            // Execute test
            val testData = "Binary Test Data".toByteArray()
            val inputStream = ByteArrayInputStream(testData)
            val result = service.encodeFile(inputStream, false)
            
            // Assertions
            assertEquals("QmluYXJ5IFRlc3QgRGF0YQ==", result)
        }
        
        @Test
        fun `decoding to bytes should produce the original byte array`() = runTestWithSetup {
            // Use a real implementation directly
            val service = Base64ServiceImpl()
            
            // Execute test
            val encoded = "QmluYXJ5IFRlc3QgRGF0YQ=="
            val result = service.decodeToBytes(encoded)
            
            // Assertions
            assertContentEquals("Binary Test Data".toByteArray(), result)
        }
    }
    
    @Nested
    @DisplayName("Edge Cases")
    inner class EdgeCases {
        
        @Test
        fun `encoding an empty string should produce an empty string`() = runTestWithSetup {
            // Use a real implementation directly
            val service = Base64ServiceImpl()
            
            // Execute test
            val input = ""
            val result = service.encodeString(input)
            
            // Assertions
            assertEquals("", result)
        }
        
        @Test
        fun `decoding an empty string should produce an empty string`() = runTestWithSetup {
            // Use a real implementation directly
            val service = Base64ServiceImpl()
            
            // Execute test
            val input = ""
            val result = service.decodeString(input)
            
            // Assertions
            assertEquals("", result)
        }
        
        @Test
        fun `special characters should be preserved through encode decode cycle`() = runTestWithSetup {
            // Use a real implementation directly
            val service = Base64ServiceImpl()
            
            // Execute test
            val input = "!@#$%^&*()_+{}:\"<>?[];\',./`~"
            val encoded = service.encodeString(input)
            val decoded = service.decodeString(encoded)
            
            // Assertions
            assertEquals(input, decoded)
        }
    }
    
    @Nested
    @DisplayName("URL-safe Encoding")
    inner class UrlSafeEncoding {
        
        @Test
        fun `URL-safe encoding should not contain plus or slash characters`() = runTestWithSetup {
            // Use a real implementation directly
            val service = Base64ServiceImpl()
            
            // Execute test
            val input = "Hello+World/Test?End"
            val encoded = service.encodeString(input, true)
            
            // Assertions
            assertTrue("+" !in encoded)
            assertTrue("/" !in encoded)
            
            val decoded = service.decodeString(encoded, true)
            assertEquals(input, decoded)
        }
        
        @Test
        fun `standard and URL-safe encodings should be different`() = runTestWithSetup {
            // Use a real implementation directly
            val service = Base64ServiceImpl()
            
            // Execute test
            val input = "This will+encode/differently?"
            val standard = service.encodeString(input, false)
            val urlSafe = service.encodeString(input, true)
            
            // Assertions
            assertNotEquals(standard, urlSafe)
            assertEquals(input, service.decodeString(standard, false))
            assertEquals(input, service.decodeString(urlSafe, true))
            assertTrue("+" !in urlSafe)
            assertTrue("/" !in urlSafe)
        }
    }
    
    @Nested
    @DisplayName("Error Handling")
    inner class ErrorHandling {
        
        @Test
        fun `decoding invalid input should return an error message`() = runTestWithSetup {
            // Use a real implementation directly
            val service = Base64ServiceImpl()
            
            // Execute test
            val invalidInput = "This is not valid Base64!"
            val result = service.decodeString(invalidInput)
            
            // Assertions
            assertTrue(result.startsWith("Error:"))
        }
        
        @Test
        fun `decoding invalid input to bytes should return an empty byte array`() = runTestWithSetup {
            // Use a real implementation directly
            val service = Base64ServiceImpl()
            
            // Execute test
            val invalidInput = "Not valid Base64#@!"
            val result = service.decodeToBytes(invalidInput)
            
            // Assertions
            assertEquals(0, result.size)
        }
    }
    
    @Nested
    @DisplayName("Large and Special Content")
    inner class LargeAndSpecialContent {
        
        @Test
        fun `large data should encode and decode correctly`() = runTestWithSetup {
            // Use a real implementation directly
            val service = Base64ServiceImpl()
            
            // Execute test
            val random = Random()
            val largeByteArray = ByteArray(10_000) { random.nextInt().toByte() }
            val inputStream = ByteArrayInputStream(largeByteArray)
            
            val encoded = service.encodeFile(inputStream, false)
            val decoded = service.decodeToBytes(encoded)
            
            // Assertions
            assertContentEquals(largeByteArray, decoded)
        }
        
        @Test
        fun `Unicode characters should be preserved through encode decode cycle`() = runTestWithSetup {
            // Use a real implementation directly
            val service = Base64ServiceImpl()
            
            // Execute test
            val input = "こんにちは世界 • Привет, мир • مرحبا بالعالم • 你好，世界"
            val encoded = service.encodeString(input)
            val decoded = service.decodeString(encoded)
            
            // Assertions
            assertEquals(input, decoded)
        }
        
        @Test
        fun `encoding an empty file should produce an empty string`() = runTestWithSetup {
            // Use a real implementation directly
            val service = Base64ServiceImpl()
            
            // Execute test
            val emptyBytes = ByteArray(0)
            val inputStream = ByteArrayInputStream(emptyBytes)
            
            val encoded = service.encodeFile(inputStream, false)
            
            // Assertions
            assertEquals("", encoded)
        }
        
        @Test
        fun `binary data with special bytes should encode and decode correctly`() = runTestWithSetup {
            // Use a real implementation directly
            val service = Base64ServiceImpl()
            
            // Execute test
            val binaryData = byteArrayOf(0, 1, 127, -1, -128)
            val inputStream = ByteArrayInputStream(binaryData)
            
            val encoded = service.encodeFile(inputStream, false)
            val decoded = service.decodeToBytes(encoded)
            
            // Assertions
            assertContentEquals(binaryData, decoded)
        }
    }
}