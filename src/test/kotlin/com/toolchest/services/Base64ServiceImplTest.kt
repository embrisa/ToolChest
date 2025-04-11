package com.toolchest.services

import kotlin.test.*
import java.io.ByteArrayInputStream

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
}