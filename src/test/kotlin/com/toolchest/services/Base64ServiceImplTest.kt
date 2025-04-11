package com.toolchest.services

import kotlin.test.*
import java.io.ByteArrayInputStream
import java.util.Random

class Base64ServiceImplTest {
    private val service = Base64ServiceImpl()

    @Test
    fun testEncodeString() {
        val input = "Hello, World!"
        val expected = "SGVsbG8sIFdvcmxkIQ=="
        assertEquals(expected, service.encodeString(input))
    }
    
    @Test
    fun testDecodeString() {
        val input = "SGVsbG8sIFdvcmxkIQ=="
        val expected = "Hello, World!"
        assertEquals(expected, service.decodeString(input))
    }
    
    @Test
    fun testEncodeFile() {
        val testData = "Binary Test Data".toByteArray()
        val inputStream = ByteArrayInputStream(testData)
        val expected = "QmluYXJ5IFRlc3QgRGF0YQ=="
        
        assertEquals(expected, service.encodeFile(inputStream, false))
    }
    
    @Test
    fun testDecodeToBytes() {
        val encoded = "QmluYXJ5IFRlc3QgRGF0YQ=="
        val expected = "Binary Test Data".toByteArray()
        
        assertContentEquals(expected, service.decodeToBytes(encoded))
    }
    
    // Edge cases - Empty string
    @Test
    fun testEncodeEmptyString() {
        val input = ""
        val expected = ""
        assertEquals(expected, service.encodeString(input))
    }
    
    @Test
    fun testDecodeEmptyString() {
        val input = ""
        val expected = ""
        assertEquals(expected, service.decodeString(input))
    }
    
    // Special characters
    @Test
    fun testEncodeSpecialCharacters() {
        val input = "!@#$%^&*()_+{}:\"<>?[];\',./`~"
        val encoded = service.encodeString(input)
        val decoded = service.decodeString(encoded)
        assertEquals(input, decoded, "Special characters should be preserved through encode/decode cycle")
    }
    
    // URL-safe encoding tests
    @Test
    fun testUrlSafeEncoding() {
        val input = "Hello+World/Test?End"
        val encoded = service.encodeString(input, true)
        
        // URL-safe encoding should not contain + or /
        assertFalse(encoded.contains("+"))
        assertFalse(encoded.contains("/"))
        
        // Decoding should work correctly
        val decoded = service.decodeString(encoded, true)
        assertEquals(input, decoded)
    }
    
    @Test
    fun testStandardVsUrlSafeEncoding() {
        // This input is designed to produce '+' and '/' characters in the encoded output,
        // which will be replaced with '-' and '_' in URL-safe encoding
        val input = "This will+encode/differently?"
        val standard = service.encodeString(input, false)
        val urlSafe = service.encodeString(input, true)
        
        assertNotEquals(standard, urlSafe, "Standard and URL-safe encodings should be different")
        
        // Both should decode back to the original
        assertEquals(input, service.decodeString(standard, false))
        assertEquals(input, service.decodeString(urlSafe, true))
        
        // Visual verification that URL-safe does not contain + or /
        assertFalse(urlSafe.contains("+"), "URL-safe encoding should not contain +")
        assertFalse(urlSafe.contains("/"), "URL-safe encoding should not contain /")
    }
    
    // Error handling
    @Test
    fun testDecodeInvalidInput() {
        val invalidInput = "This is not valid Base64!"
        val result = service.decodeString(invalidInput)
        
        assertTrue(result.startsWith("Error:"))
    }
    
    @Test
    fun testDecodeToBytesInvalidInput() {
        val invalidInput = "Not valid Base64#@!"
        val result = service.decodeToBytes(invalidInput)
        
        assertTrue(result.isEmpty(), "Invalid Base64 should return empty byte array")
    }
    
    // Large inputs
    @Test
    fun testLargeInput() {
        val random = Random()
        val largeByteArray = ByteArray(1_000_000) { random.nextInt().toByte() }
        val inputStream = ByteArrayInputStream(largeByteArray)
        
        val encoded = service.encodeFile(inputStream, false)
        val decoded = service.decodeToBytes(encoded)
        
        assertContentEquals(largeByteArray, decoded, "Large data should encode and decode correctly")
    }
    
    // Unicode handling
    @Test
    fun testUnicodeCharacters() {
        val input = "こんにちは世界 • Привет, мир • مرحبا بالعالم • 你好，世界"
        val encoded = service.encodeString(input)
        val decoded = service.decodeString(encoded)
        
        assertEquals(input, decoded, "Unicode characters should be preserved through encode/decode cycle")
    }
    
    // Empty file
    @Test
    fun testEncodeEmptyFile() {
        val emptyBytes = ByteArray(0)
        val inputStream = ByteArrayInputStream(emptyBytes)
        
        val encoded = service.encodeFile(inputStream, false)
        assertEquals("", encoded, "Empty file should produce empty string")
    }
    
    // Binary data with nulls and special bytes
    @Test
    fun testBinaryDataWithSpecialBytes() {
        val binaryData = byteArrayOf(0, 1, 127, -1, -128)
        val inputStream = ByteArrayInputStream(binaryData)
        
        val encoded = service.encodeFile(inputStream, false)
        val decoded = service.decodeToBytes(encoded)
        
        assertContentEquals(binaryData, decoded, "Binary data with special bytes should encode/decode correctly")
    }
}