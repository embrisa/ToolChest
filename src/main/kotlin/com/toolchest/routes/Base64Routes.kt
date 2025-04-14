package com.toolchest.routes

import com.toolchest.services.Base64Service
import com.toolchest.services.ToolService
import io.ktor.http.content.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import java.time.LocalDateTime

/**
 * Routes for the Base64 encoder/decoder tool
 */
fun Route.base64Routes() {
    val base64Service by inject<Base64Service>()
    val toolService by inject<ToolService>()

    // Main page for the Base64 tool
    get {
        // Record tool usage
        toolService.recordToolUsage("base64")

        val model = mapOf(
            "title" to "Base64 Encoder / Decoder",
            "pageDescription" to "Free online tool to encode and decode text or files using Base64 encoding.",
            "currentTime" to LocalDateTime.now().toString()
        )

        call.respond(FreeMarkerContent("pages/base64.ftl", model))
    }

    // Endpoint for encoding text to Base64
    post("/encode") {
        // Record tool usage
        toolService.recordToolUsage("base64")
        
        val parameters = call.receiveParameters()
        val text = parameters["text"] ?: ""
        val urlSafe = parameters["urlSafe"] == "on"
        
        val encodedText = base64Service.encodeString(text, urlSafe)
        
        // Create a model with all necessary information
        val model = mapOf(
            "result" to encodedText,
            "operation" to "encode",
            "inputLength" to text.length,
            "outputLength" to encodedText.length
        )
        
        // Respond with the proper FreeMarker template
        call.respond(FreeMarkerContent("pages/base64-result.ftl", model))
    }

    // Endpoint for decoding Base64 to text
    post("/decode") {
        // Record tool usage
        toolService.recordToolUsage("base64")
        
        val parameters = call.receiveParameters()
        val base64Text = parameters["text"] ?: ""
        val urlSafe = parameters["urlSafe"] == "on"
        
        val decodedText = try {
            base64Service.decodeString(base64Text, urlSafe)
        } catch (e: Exception) {
            "Error: ${e.message ?: "Invalid Base64 input"}"
        }
        
        // Create a model with all necessary information
        val model = mapOf(
            "result" to decodedText,
            "operation" to "decode",
            "inputLength" to base64Text.length,
            "outputLength" to decodedText.length
        )
        
        // Respond with the proper FreeMarker template
        call.respond(FreeMarkerContent("pages/base64-result.ftl", model))
    }

    // Endpoint for encoding a file to Base64
    post("/encode-file") {
        // Record tool usage
        toolService.recordToolUsage("base64")
        
        val multipart = call.receiveMultipart()
        var fileName = ""
        var fileBytes: ByteArray? = null
        var urlSafe = false
        
        multipart.forEachPart { part ->
            when (part) {
                is PartData.FileItem -> {
                    if (part.name == "file") {
                        fileName = part.originalFileName ?: "unknown"
                        fileBytes = part.streamProvider().readBytes()
                    }
                }
                is PartData.FormItem -> {
                    if (part.name == "urlSafe") {
                        urlSafe = part.value == "on"
                    }
                }
                else -> {}
            }
            part.dispose()
        }
        
        val result = fileBytes?.let { 
            base64Service.encodeFile(it.inputStream(), urlSafe) 
        } ?: "Error: No file uploaded"
        
        val inputLength = fileBytes?.size ?: 0
        
        // Calculate the output length for Base64 encoding
        val outputLength = if (result.startsWith("Error")) {
            result.length
        } else {
            // Standard Base64 encoding formula: 3 bytes encode to 4 characters
            val fullGroups = inputLength / 3
            val remainderBytes = inputLength % 3
            (fullGroups * 4) + (if (remainderBytes > 0) 4 else 0)
        }
        
        // Create a model with all necessary information
        val model = mapOf(
            "result" to result,
            "operation" to "fileEncode", // Use consistent naming matching test expectations
            "fileName" to fileName,
            "inputLength" to inputLength,
            "outputLength" to outputLength
        )
        
        // Respond with the proper FreeMarker template
        call.respond(FreeMarkerContent("pages/base64-result.ftl", model))
    }

    // Endpoint for decoding Base64 to a file
    post("/decode-file") {
        // Record tool usage
        toolService.recordToolUsage("base64")
        
        val parameters = call.receiveParameters()
        val base64Text = parameters["text"] ?: ""
        val fileName = parameters["fileName"] ?: "decoded_file"
        val urlSafe = parameters["urlSafe"] == "on"
        
        try {
            val decodedBytes = base64Service.decodeToBytes(base64Text, urlSafe)
            
            if (decodedBytes.isEmpty()) {
                // Return a proper formatted error response
                val model = mapOf(
                    "result" to "Error: Invalid Base64 input",
                    "operation" to "fileDecode",
                    "inputLength" to base64Text.length,
                    "outputLength" to 0,
                    "error" to "Invalid Base64 input"
                )
                
                call.respond(HttpStatusCode.BadRequest, FreeMarkerContent("pages/base64-result.ftl", model))
                return@post
            }
            
            // Set content disposition header for attachment download
            call.response.header(
                HttpHeaders.ContentDisposition, 
                "attachment; filename=\"${fileName}\""
            )
            
            // Set content type to application/octet-stream
            call.respondBytes(
                bytes = decodedBytes,
                contentType = ContentType.Application.OctetStream
            )
        } catch (e: Exception) {
            // Return a proper formatted error response
            val errorMessage = "Invalid Base64 input: ${e.message}"
            val model = mapOf(
                "result" to "Error: $errorMessage",
                "operation" to "fileDecode",
                "inputLength" to base64Text.length,
                "outputLength" to 0,
                "error" to errorMessage
            )
            
            call.respond(HttpStatusCode.BadRequest, FreeMarkerContent("pages/base64-result.ftl", model))
        }
    }
}
