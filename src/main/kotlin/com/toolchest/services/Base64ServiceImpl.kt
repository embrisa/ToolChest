package com.toolchest.services

import java.io.InputStream
import java.util.Base64

/**
 * Implementation of the Base64Service interface for encoding and decoding operations
 */
class Base64ServiceImpl : Base64Service {

    override fun encodeString(input: String, urlSafe: Boolean): String {
        return if (urlSafe) {
            // For URL-safe, we explicitly use the URL encoder and ensure no padding
            // This guarantees a different output from standard encoding
            Base64.getUrlEncoder().withoutPadding().encodeToString(input.toByteArray())
        } else {
            Base64.getEncoder().encodeToString(input.toByteArray())
        }
    }

    override fun decodeString(input: String, urlSafe: Boolean): String {
        return try {
            val decoder = if (urlSafe) Base64.getUrlDecoder() else Base64.getDecoder()
            String(decoder.decode(input))
        } catch (e: IllegalArgumentException) {
            "Error: Invalid Base64 input"
        }
    }

    override fun encodeFile(inputStream: InputStream, urlSafe: Boolean): String {
        return try {
            val bytes = inputStream.readAllBytes()
            val result = if (urlSafe) {
                // Consistent with encodeString - use withoutPadding for URL-safe encoding
                Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
            } else {
                Base64.getEncoder().encodeToString(bytes)
            }
            result
        } catch (e: Exception) {
            e.printStackTrace()
            "Error: Failed to process file"
        }
    }

    override fun decodeToBytes(input: String, urlSafe: Boolean): ByteArray {
        return try {
            val decoder = if (urlSafe) Base64.getUrlDecoder() else Base64.getDecoder()
            decoder.decode(input)
        } catch (e: IllegalArgumentException) {
            ByteArray(0) // Return empty array on error
        }
    }
}