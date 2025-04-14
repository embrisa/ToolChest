import org.gradle.kotlin.dsl.testImplementation
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm") version "2.1.20"
    kotlin("plugin.serialization") version "2.1.20"
    id("io.ktor.plugin") version "2.3.7"
    application
}

group = "com.toolchest"
version = "0.0.1"

application {
    mainClass.set("com.toolchest.ApplicationKt")
}

repositories {
    mavenCentral()
}

val ktorVersion = "2.3.7"
val koinVersion = "3.5.6"
val logbackVersion = "1.4.14"
val caffeineVersion = "3.1.8"
val exposedVersion = "0.47.0"
val sqliteVersion = "3.44.1.0"
val freemarkerVersion = "2.3.32"
val kotlinTestVersion = "2.1.20"
val mockkVersion = "1.14.0"
val h2Version = "2.2.220"

dependencies {
    // Ktor server
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
    implementation("io.ktor:ktor-server-html-builder:$ktorVersion")
    implementation("io.ktor:ktor-server-freemarker:$ktorVersion")  // FreeMarker templating
    implementation("org.freemarker:freemarker:$freemarkerVersion") // FreeMarker library
    implementation("io.ktor:ktor-server-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-server-status-pages:$ktorVersion")
    implementation("io.ktor:ktor-server-compression:$ktorVersion")
    implementation("io.ktor:ktor-server-caching-headers:$ktorVersion")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")
    implementation("io.ktor:ktor-server-call-logging:$ktorVersion")
    
    // Configuration support for application.conf
    implementation("io.ktor:ktor-server-config-yaml:$ktorVersion")
    
    // Koin for dependency injection
    implementation("io.insert-koin:koin-core:$koinVersion")
    implementation("io.insert-koin:koin-ktor:$koinVersion")
    implementation("io.insert-koin:koin-logger-slf4j:$koinVersion")

    // Logging
    implementation("ch.qos.logback:logback-classic:$logbackVersion")

    // Database
    implementation("org.jetbrains.exposed:exposed-core:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-dao:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-jdbc:$exposedVersion")
    implementation("org.xerial:sqlite-jdbc:$sqliteVersion")

    // Caching
    implementation("com.github.ben-manes.caffeine:caffeine:$caffeineVersion")

    // Testing - kotlin.test with JUnit 5
    testImplementation("io.ktor:ktor-server-test-host:$ktorVersion")
    testImplementation("org.jetbrains.kotlin:kotlin-test:$kotlinTestVersion")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5:$kotlinTestVersion")

    // H2 Database for in-memory testing
    testImplementation("com.h2database:h2:$h2Version")

    // Mocking
    testImplementation("io.mockk:mockk:${mockkVersion}")

    // Jsoup for HTML parsing
    testImplementation("org.jsoup:jsoup:1.19.1")

    // Koin testing
    testImplementation("io.insert-koin:koin-test-junit5:$koinVersion")
}

// Force consistent kotlin-test version
configurations.all {
    resolutionStrategy.eachDependency {
        if (requested.group == "org.jetbrains.kotlin" && requested.name.startsWith("kotlin-test")) {
            useVersion(kotlinTestVersion)
        }
    }
}

// Configure Java toolchain to match system Java version
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21)) // Match your system Java version
    }
}

// Configure Kotlin to use the same JVM target as Java
tasks.withType<KotlinCompile> {
    kotlinOptions {
        jvmTarget = "21" // Match Java toolchain version
        freeCompilerArgs += "-Xjsr305=strict"
    }
}

// Keep using JUnit Platform runner for tests, which is compatible with kotlin-test-junit5
tasks.withType<Test> {
    useJUnitPlatform()
    systemProperty("ktor.testing", "true")
}