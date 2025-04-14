package com.toolchest

import com.toolchest.config.configureDatabases
import com.toolchest.config.configureKoin
import com.toolchest.config.configurePlugins
import com.toolchest.config.configureRouting
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*

fun main(args: Array<String>) {
    // Use EngineMain instead of embeddedServer to start the server
    // EngineMain will read configuration from application.conf
    EngineMain.main(args)
}

/**
 * Application module function that will be referenced in application.conf
 * This is where we configure our application components
 */
@Suppress("unused") // Referenced in application.conf
fun Application.module() {
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