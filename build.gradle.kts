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

val ktor_version = "2.3.7"
val koin_version = "3.5.3"
val logback_version = "1.4.14"
val caffeine_version = "3.1.8"
val exposed_version = "0.47.0"
val sqlite_version = "3.44.1.0"
val freemarker_version = "2.3.32"
val kotlin_test_version = "1.9.22"

dependencies {
    // Ktor server
    implementation("io.ktor:ktor-server-core:$ktor_version")
    implementation("io.ktor:ktor-server-netty:$ktor_version")
    implementation("io.ktor:ktor-server-html-builder:$ktor_version")
    implementation("io.ktor:ktor-server-freemarker:$ktor_version")  // FreeMarker templating
    implementation("org.freemarker:freemarker:$freemarker_version") // FreeMarker library
    implementation("io.ktor:ktor-server-content-negotiation:$ktor_version")
    implementation("io.ktor:ktor-server-status-pages:$ktor_version")
    implementation("io.ktor:ktor-server-compression:$ktor_version")
    implementation("io.ktor:ktor-server-caching-headers:$ktor_version")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktor_version")
    implementation("io.ktor:ktor-server-call-logging:$ktor_version")
    
    // Koin for dependency injection
    implementation("io.insert-koin:koin-core:$koin_version")
    implementation("io.insert-koin:koin-ktor:$koin_version")
    implementation("io.insert-koin:koin-logger-slf4j:$koin_version")

    // Logging
    implementation("ch.qos.logback:logback-classic:$logback_version")

    // Database
    implementation("org.jetbrains.exposed:exposed-core:$exposed_version")
    implementation("org.jetbrains.exposed:exposed-dao:$exposed_version")
    implementation("org.jetbrains.exposed:exposed-jdbc:$exposed_version")
    implementation("org.xerial:sqlite-jdbc:$sqlite_version")

    // Caching
    implementation("com.github.ben-manes.caffeine:caffeine:$caffeine_version")

    // Testing - kotlin.test with JUnit 5
    testImplementation("io.ktor:ktor-server-test-host:$ktor_version")
    testImplementation("org.jetbrains.kotlin:kotlin-test:$kotlin_test_version")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5:$kotlin_test_version")
    
    // Force Koin test to use our version of kotlin-test
    testImplementation("io.insert-koin:koin-test:$koin_version") {
        exclude(group = "org.jetbrains.kotlin", module = "kotlin-test-junit")
    }
}

// Force consistent kotlin-test version
configurations.all {
    resolutionStrategy.eachDependency {
        if (requested.group == "org.jetbrains.kotlin" && requested.name.startsWith("kotlin-test")) {
            useVersion(kotlin_test_version)
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