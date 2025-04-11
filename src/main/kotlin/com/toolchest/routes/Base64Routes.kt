package com.toolchest.routes

import com.toolchest.services.Base64Service
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

    // Main page for the Base64 tool
    get {
        val model = mapOf(
            "pageTitle" to "Base64 Encoder and Decoder",
            "pageDescription" to "Free online Base64 encoder and decoder. Convert text to Base64, decode Base64 to text, encode files to Base64, and convert Base64 back to files.",
            "content" to FreeMarkerContent(
                "pages/base64.ftl",
                mapOf("currentTime" to LocalDateTime.now().toString())
            )
        )
        call.respond(FreeMarkerContent("layouts/base.ftl", model))
    }

    // Endpoint for encoding text to Base64
    post("/encode") {
        val parameters = call.receiveParameters()
        val text = parameters["text"] ?: ""
        val urlSafe = parameters["urlSafe"] == "on"
        
        val encodedText = base64Service.encodeString(text, urlSafe)
        
        call.respond(FreeMarkerContent(
            "pages/base64-result.ftl",
            mapOf(
                "result" to encodedText,
                "operation" to "encode",
                "inputLength" to text.length,
                "outputLength" to encodedText.length
            )
        ))
    }

    // Endpoint for decoding Base64 to text
    post("/decode") {
        val parameters = call.receiveParameters()
        val base64Text = parameters["text"] ?: ""
        val urlSafe = parameters["urlSafe"] == "on"
        
        val decodedText = base64Service.decodeString(base64Text, urlSafe)
        
        call.respond(FreeMarkerContent(
            "pages/base64-result.ftl",
            mapOf(
                "result" to decodedText,
                "operation" to "decode",
                "inputLength" to base64Text.length,
                "outputLength" to decodedText.length
            )
        ))
    }

    // Endpoint for encoding a file to Base64
    post("/encode-file") {
        val multipart = call.receiveMultipart()
        var fileName = ""
        var fileBytes: ByteArray? = null
        var urlSafe = false
        
        multipart.forEachPart { part ->
            when (part) {
                is PartData.FileItem -> {
                    fileName = part.originalFileName ?: "unknown"
                    fileBytes = part.streamProvider().readBytes()
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
        
        call.respond(FreeMarkerContent(
            "pages/base64-result.ftl",
            mapOf(
                "result" to result,
                "operation" to "fileEncode",
                "fileName" to fileName,
                "outputLength" to result.length
            )
        ))
    }

    // Endpoint for decoding Base64 to a file
    post("/decode-file") {
        val parameters = call.receiveParameters()
        val base64Text = parameters["text"] ?: ""
        val fileName = parameters["fileName"] ?: "decoded_file"
        val urlSafe = parameters["urlSafe"] == "on"
        
        val decodedBytes = base64Service.decodeToBytes(base64Text, urlSafe)
        
        if (decodedBytes.isEmpty()) {
            call.respond(HttpStatusCode.BadRequest, "Invalid Base64 input")
            return@post
        }
        
        call.response.header(
            HttpHeaders.ContentDisposition, 
            ContentDisposition.Attachment.withParameter(ContentDisposition.Parameters.FileName, fileName).toString()
        )
        call.respondBytes(decodedBytes)
    }
}