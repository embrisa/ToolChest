package com.toolchest.services

import io.kotest.core.spec.style.BehaviorSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.kotest.matchers.string.shouldStartWith
import java.io.ByteArrayInputStream
import java.util.Random

class Base64ServiceImplTest : BehaviorSpec({
    val service = Base64ServiceImpl()
    
    given("a Base64 service") {
        `when`("encoding a standard string") {
            val input = "Hello, World!"
            val result = service.encodeString(input)
            
            then("it should produce the correct Base64 value") {
                result shouldBe "SGVsbG8sIFdvcmxkIQ=="
            }
        }
        
        `when`("decoding a valid Base64 string") {
            val input = "SGVsbG8sIFdvcmxkIQ=="
            val result = service.decodeString(input)
            
            then("it should produce the original string") {
                result shouldBe "Hello, World!"
            }
        }
        
        `when`("encoding a file") {
            val testData = "Binary Test Data".toByteArray()
            val inputStream = ByteArrayInputStream(testData)
            val result = service.encodeFile(inputStream, false)
            
            then("it should produce the correct Base64 value") {
                result shouldBe "QmluYXJ5IFRlc3QgRGF0YQ=="
            }
        }
        
        `when`("decoding to bytes") {
            val encoded = "QmluYXJ5IFRlc3QgRGF0YQ=="
            val result = service.decodeToBytes(encoded)
            
            then("it should produce the original byte array") {
                result shouldBe "Binary Test Data".toByteArray()
            }
        }
        
        // Edge cases - Empty string
        `when`("encoding an empty string") {
            val input = ""
            val result = service.encodeString(input)
            
            then("it should produce an empty string") {
                result shouldBe ""
            }
        }
        
        `when`("decoding an empty string") {
            val input = ""
            val result = service.decodeString(input)
            
            then("it should produce an empty string") {
                result shouldBe ""
            }
        }
        
        // Special characters
        `when`("encoding and decoding special characters") {
            val input = "!@#$%^&*()_+{}:\"<>?[];\',./`~"
            val encoded = service.encodeString(input)
            val decoded = service.decodeString(encoded)
            
            then("special characters should be preserved through encode/decode cycle") {
                decoded shouldBe input
            }
        }
        
        // URL-safe encoding tests
        `when`("encoding with URL-safe option") {
            val input = "Hello+World/Test?End"
            val encoded = service.encodeString(input, true)
            
            then("the encoded string should not contain '+' or '/'") {
                encoded shouldNotContain "+"
                encoded shouldNotContain "/"
            }
            
            then("decoding should work correctly") {
                val decoded = service.decodeString(encoded, true)
                decoded shouldBe input
            }
        }
        
        `when`("comparing standard and URL-safe encoding") {
            val input = "This will+encode/differently?"
            val standard = service.encodeString(input, false)
            val urlSafe = service.encodeString(input, true)
            
            then("standard and URL-safe encodings should be different") {
                (standard != urlSafe) shouldBe true
            }
            
            then("both should decode back to the original") {
                service.decodeString(standard, false) shouldBe input
                service.decodeString(urlSafe, true) shouldBe input
            }
            
            then("URL-safe encoding should not contain '+' or '/'") {
                urlSafe shouldNotContain "+"
                urlSafe shouldNotContain "/"
            }
        }
        
        // Error handling
        `when`("decoding invalid input") {
            val invalidInput = "This is not valid Base64!"
            val result = service.decodeString(invalidInput)
            
            then("it should return an error message") {
                result shouldStartWith "Error:"
            }
        }
        
        `when`("decoding invalid input to bytes") {
            val invalidInput = "Not valid Base64#@!"
            val result = service.decodeToBytes(invalidInput)
            
            then("it should return an empty byte array") {
                result.size shouldBe 0
            }
        }
        
        // Large inputs
        `when`("handling large inputs") {
            val random = Random()
            val largeByteArray = ByteArray(10_000) { random.nextInt().toByte() }
            val inputStream = ByteArrayInputStream(largeByteArray)
            
            val encoded = service.encodeFile(inputStream, false)
            val decoded = service.decodeToBytes(encoded)
            
            then("large data should encode and decode correctly") {
                decoded shouldBe largeByteArray
            }
        }
        
        // Unicode handling
        `when`("encoding and decoding Unicode characters") {
            val input = "こんにちは世界 • Привет, мир • مرحبا بالعالم • 你好，世界"
            val encoded = service.encodeString(input)
            val decoded = service.decodeString(encoded)
            
            then("Unicode characters should be preserved through encode/decode cycle") {
                decoded shouldBe input
            }
        }
        
        // Empty file
        `when`("encoding an empty file") {
            val emptyBytes = ByteArray(0)
            val inputStream = ByteArrayInputStream(emptyBytes)
            
            val encoded = service.encodeFile(inputStream, false)
            
            then("it should produce an empty string") {
                encoded shouldBe ""
            }
        }
        
        // Binary data with nulls and special bytes
        `when`("encoding and decoding binary data with special bytes") {
            val binaryData = byteArrayOf(0, 1, 127, -1, -128)
            val inputStream = ByteArrayInputStream(binaryData)
            
            val encoded = service.encodeFile(inputStream, false)
            val decoded = service.decodeToBytes(encoded)
            
            then("binary data with special bytes should encode/decode correctly") {
                decoded shouldBe binaryData
            }
        }
    }
})