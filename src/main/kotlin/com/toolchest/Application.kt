package com.toolchest

import com.toolchest.config.configureDatabases
import com.toolchest.config.configureKoin
import com.toolchest.config.configurePlugins
import com.toolchest.config.configureRouting
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import java.net.BindException

fun main() {
    val preferredPort = System.getenv("PORT")?.toIntOrNull() ?: 8080
    val fallbackPorts = listOf(8081, 8082, 8083, 8084, 8085)

    // Try the preferred port first, then fallback ports if necessary
    var server: ApplicationEngine? = null
    var port = preferredPort
    var portIndex = 0

    while (server == null && (portIndex == 0 || portIndex < fallbackPorts.size)) {
        try {
            port = if (portIndex == 0) preferredPort else fallbackPorts[portIndex - 1]
            server = embeddedServer(Netty, port = port, host = "0.0.0.0") { configureApplication() }
            println("Successfully starting server on port $port")
            println("\n===========================================")
            println("🚀 GO TO http://localhost:$port TO SEE 🚀")
            println("===========================================\n")
        } catch (e: BindException) {
            println("Port $port is already in use, trying next port...")
            portIndex++
            if (portIndex > fallbackPorts.size) {
                throw BindException(
                    "Could not bind to ports $preferredPort or any of fallbacks $fallbackPorts. All ports are in use."
                )
            }
        }
    }

    server?.start(wait = true) ?: throw IllegalStateException("Failed to start server on any port")
}

fun Application.configureApplication() {
    // Configure database connection first to ensure it's ready before any routes are handled
    configureDatabases()
    
    // Configure dependency injection
    configureKoin()

    // Configure plugins and middleware
    configurePlugins()

    // Configure routing last
    configureRouting()

    log.info("ToolChest application started")
}