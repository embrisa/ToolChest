import org.gradle.kotlin.dsl.testImplementation
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm") version "1.9.22"
    kotlin("plugin.serialization") version "1.9.22"
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
val koinVersion = "3.5.3"
val logbackVersion = "1.4.14"
val caffeineVersion = "3.1.8"
val exposedVersion = "0.47.0"
val sqliteVersion = "3.44.1.0"
val freemarkerVersion = "2.3.32"
val kotlinTestVersion = "1.9.22"
val mockkVersion = "1.14.0"

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

    // Mocking
    testImplementation("io.mockk:mockk:${mockkVersion}")

    // Jsoup for HTML parsing
    testImplementation("org.jsoup:jsoup:1.19.1")
    
    // Force Koin test to use our version of kotlin-test
    testImplementation("io.insert-koin:koin-test:$koinVersion") {
        exclude(group = "org.jetbrains.kotlin", module = "kotlin-test-junit")
    }

    // Kotest for testing
    testImplementation("io.kotest:kotest-runner-junit5:5.7.2")
    testImplementation("io.kotest:kotest-assertions-core:5.7.2")
    
    // Optional modules based on needs
    testImplementation("io.kotest:kotest-property:5.7.2") // For property testing
    testImplementation("io.kotest:kotest-framework-datatest:5.7.2") // For data-driven testing
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
}