package com.toolchest.services

import java.io.InputStream

/**
 * Service interface for Base64 encoding and decoding operations
 */
interface Base64Service {
    /**
     * Encodes a string to Base64
     * 
     * @param input String to encode
     * @param urlSafe Whether to use URL-safe Base64 encoding
     * @return Base64 encoded string
     */
    fun encodeString(input: String, urlSafe: Boolean = false): String
    
    /**
     * Decodes a Base64 string to a regular string
     * 
     * @param input Base64 encoded string
     * @param urlSafe Whether the input uses URL-safe Base64 encoding
     * @return Decoded string
     */
    fun decodeString(input: String, urlSafe: Boolean = false): String
    
    /**
     * Encodes binary data to Base64
     * 
     * @param inputStream Stream containing binary data to encode
     * @param urlSafe Whether to use URL-safe Base64 encoding
     * @return Base64 encoded string
     */
    fun encodeFile(inputStream: InputStream, urlSafe: Boolean = false): String
    
    /**
     * Decodes a Base64 string to binary data
     * 
     * @param input Base64 encoded string
     * @param urlSafe Whether the input uses URL-safe Base64 encoding
     * @return Byte array containing decoded binary data
     */
    fun decodeToBytes(input: String, urlSafe: Boolean = false): ByteArray
}