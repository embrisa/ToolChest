package com.toolchest.config

import com.toolchest.services.Base64Service
import com.toolchest.services.Base64ServiceImpl
import io.ktor.server.application.*
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger

/**
 * Application DI module for Koin
 */
val appModule = module {
    // Register Base64Service implementation
    single<Base64Service> { Base64ServiceImpl() }
    
    // Additional services will be registered here as the application grows
}

/**
 * Configures Koin dependency injection for the application
 */
fun Application.configureKoin() {
    install(Koin) {
        slf4jLogger()
        modules(appModule)
    }
}