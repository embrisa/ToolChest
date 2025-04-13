# ToolChest Testing Guide

This document outlines the testing patterns, utilities, and best practices used in the ToolChest project.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Testing Architecture](#testing-architecture)
3. [Test Organization](#test-organization)
4. [Test Helpers and Utilities](#test-helpers-and-utilities)
5. [Mock Factory](#mock-factory)
6. [Route Testing](#route-testing)
7. [Service Testing](#service-testing)
8. [Template Testing](#template-testing)
9. [Best Practices](#best-practices)
10. [Common Testing Patterns](#common-testing-patterns)
11. [Troubleshooting](#troubleshooting)

## Getting Started

### Running Tests

To run all tests:
```bash
./gradlew test
```

To run a specific test:
```bash
./gradlew test --tests "com.toolchest.routes.Base64RoutesTest"
```

After running tests, reports can be found at:
- HTML Test Report: `build/reports/tests/test/index.html`

## Testing Architecture

ToolChest uses a multi-layered testing approach:

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test interactions between components
3. **Template Tests**: Verify FreeMarker templates render correctly
4. **Route Tests**: Test HTTP endpoints and their responses

### Testing Libraries

- **Kotest**: Main testing framework with multiple spec styles
- **MockK**: Mocking library for Kotlin
- **Ktor Test**: Testing utilities for Ktor applications
- **Koin Test**: Testing utilities for Koin dependency injection

## Test Organization

Tests are organized to mirror the main source code structure:

```
src/test/kotlin/com/toolchest/
  ├── config/         # Tests for application configuration
  ├── routes/         # Tests for HTTP routes and controllers
  ├── services/       # Tests for business logic services
  ├── templates/      # Tests for FreeMarker templates
  └── TestUtils.kt    # Common test utilities and helpers
```

## Test Helpers and Utilities

ToolChest provides a comprehensive set of testing utilities in `TestUtils.kt`:

### Application Configuration

```kotlin
// Configure FreeMarker for tests
fun Application.configureFreeMarkerForTests()

// Set up a complete test application environment
fun Application.configureApplicationForTests()

// Create isolated test application
fun createTestApp(modules: List<Module>, setup: Application.() -> Unit, test: suspend ApplicationTestBuilder.() -> Unit)
```

### Assertions Extensions

```kotlin
// Assert response has OK status
suspend fun HttpResponse.assertOk()

// Assert response has specific status
suspend fun HttpResponse.assertStatus(expected: HttpStatusCode)

// Assert response body contains text
suspend fun HttpResponse.assertContains(text: String)

// Assert response is a redirect to a specific path
suspend fun HttpResponse.assertRedirectTo(path: String)
```

### Test Base Class

```kotlin
// Base class for tests requiring Koin dependency injection
abstract class KoinBaseTest {
    // Override to provide custom test modules
    open fun provideTestModules(): List<Module>
    
    // Automatically called before each test to set up Koin
    @BeforeTest
    fun setupKoin()
    
    // Automatically called after each test to clean up Koin
    @AfterTest
    fun tearDownKoin()
}
```

## Mock Factory

The `MockFactory` object provides standardized mocks for common services:

```kotlin
// Create a mock ToolService with default configurations
fun createToolServiceMock(relaxed: Boolean = true, relaxUnitFun: Boolean = true): ToolService

// Create a mock Base64Service with default configurations
fun createBase64ServiceMock(relaxed: Boolean = false): Base64Service

// Create sample tag data for tests
fun createSampleTags(): List<TagDTO>

// Create sample tool data for tests
fun createSampleTools(tags: List<TagDTO> = createSampleTags()): List<ToolDTO>
```

### Example: Using MockFactory

```kotlin
// Create a mock with default configuration
val toolServiceMock = MockFactory.createToolServiceMock()

// Override specific behaviors as needed
every { toolServiceMock.getToolsByTag("base64") } returns listOf(baseTool)
```

## Route Testing

The `RouteTestHelper` object provides utilities for testing routes:

```kotlin
// Test home routes with custom setup
suspend fun testHomeRoutes(
    toolServiceMock: ToolService = MockFactory.createToolServiceMock(),
    testBlock: suspend ApplicationTestBuilder.() -> Unit
)

// Test base64 routes with custom setup
suspend fun testBase64Routes(
    toolServiceMock: ToolService = MockFactory.createToolServiceMock(),
    base64ServiceMock: Base64Service = MockFactory.createBase64ServiceMock(),
    testBlock: suspend ApplicationTestBuilder.() -> Unit
)

// Test a specific HTTP endpoint with detailed error reporting
suspend fun testEndpoint(
    client: HttpClient,
    path: String,
    method: HttpMethod = HttpMethod.Get,
    setup: HttpRequestBuilder.() -> Unit = {},
    assertions: suspend (HttpResponse) -> Unit
)
```

### Example: Route Testing Pattern

```kotlin
@Test
fun `route should return correct response`() {
    testApplication {
        application {
            configureFreeMarkerForTests()
            routing {
                route("base64") {
                    base64Routes()
                }
            }
        }

        // Use test helper to verify endpoint behavior
        RouteTestHelper.testEndpoint(client, "/base64") { response ->
            response.assertOk()
            response.bodyAsText() shouldContain "Base64 Encoder"
            
            // Verify service interactions
            verify { toolServiceMock.recordToolUsage("base64") }
        }
    }
}
```

## Service Testing

Services are tested using straightforward unit tests with mocks for dependencies:

```kotlin
class Base64ServiceImplTest : StringSpec({
    val service = Base64ServiceImpl()
    
    "encodeString should correctly encode a string" {
        val result = service.encodeString("Hello, World!")
        result shouldBe "SGVsbG8sIFdvcmxkIQ=="
    }
    
    "decodeString should correctly decode a valid Base64 string" {
        val result = service.decodeString("SGVsbG8sIFdvcmxkIQ==")
        result shouldBe "Hello, World!"
    }
})
```

## Template Testing

Templates are tested by rendering them with test data and verifying the output:

```kotlin
class UIComponentsTest : StringSpec({
    "tool-card template should render correctly" {
        val template = FreeMarkerTemplate("components/tool-card.ftl")
        val tool = MockFactory.createSampleTools()[0]
        
        val output = template.render(mapOf("tool" to tool))
        
        output shouldContain tool.name
        output shouldContain tool.description
        output shouldContain "href=\"/${tool.slug}\""
    }
})
```

## Best Practices

### 1. Test Structure Pattern

Follow the Arrange-Act-Assert pattern:

```kotlin
"test name" {
    // Arrange - Set up test data and mocks
    val service = mockk<Base64Service>()
    every { service.encodeString(any(), any()) } returns "encoded-value"
    
    // Act - Perform the action being tested
    val result = service.encodeString("test", false)
    
    // Assert - Verify the expected outcome
    result shouldBe "encoded-value"
}
```

### 2. Naming Conventions

Use descriptive test names that explain the expected behavior:

```kotlin
"GET /base64 should return 200 OK with expected content"
"encodeString should handle empty input gracefully"
"when input is invalid then an exception is thrown"
```

### 3. Test Isolation

Ensure each test is isolated and doesn't depend on the state of other tests:

- Reset mocks between tests
- Don't rely on global state
- Use `beforeTest` and `afterTest` to set up and tear down test environment

### 4. Comprehensive Testing

Test both happy paths and edge cases:

- Valid inputs
- Empty or null inputs
- Maximum size inputs
- Invalid inputs that should trigger errors

## Common Testing Patterns

### Testing Routes

```kotlin
testApplication {
    application {
        configureFreeMarkerForTests()
        routing {
            route("base64") {
                base64Routes()
            }
        }
    }

    client.get("/base64").let { response ->
        // Assertions about response status and content
    }
}
```

### Testing Forms

```kotlin
val formParameters = parametersOf(
    "text" to listOf("Hello, World!"),
    "urlSafe" to listOf("off")
)

client.post("/base64/encode") {
    contentType(ContentType.Application.FormUrlEncoded)
    setBody(FormDataContent(formParameters))
}.let { response ->
    // Assertions about form processing
}
```

### Testing File Uploads

```kotlin
val testFileBytes = "Hello, World!".toByteArray()

client.submitFormWithBinaryData(
    url = "/base64/encode-file",
    formData = formData {
        append("file", testFileBytes, Headers.build {
            append(HttpHeaders.ContentDisposition, "form-data; name=file; filename=test.txt")
            append(HttpHeaders.ContentType, "application/octet-stream")
        })
    }
).let { response ->
    // Assertions about file processing
}
```

### Testing Service Layer

```kotlin
"service should handle business logic correctly" {
    // For pure service tests, you typically don't need mocks
    val service = Base64ServiceImpl()
    
    // Test the service functions directly
    val result = service.encodeString("test", false)
    result shouldBe "dGVzdA=="
}

"service should interact with dependencies correctly" {
    // For services with dependencies, mock the dependencies
    val dependencyMock = mockk<DependencyService>()
    every { dependencyMock.someMethod() } returns "result"
    
    val service = ServiceImpl(dependencyMock)
    
    // Test the service behavior
    service.methodUsingDependency() shouldBe "expected"
    
    // Verify interactions with dependencies
    verify { dependencyMock.someMethod() }
}
```

## Troubleshooting

### Common Issues

1. **Koin context issues**:
   - Symptoms: `No Koin context found` errors
   - Solution: Make sure to properly start/stop Koin in tests with `startKoin` and `stopKoin`

2. **Route testing failures**:
   - Symptoms: Routes not found or 404 errors
   - Solution: Ensure route paths in tests match production configuration

3. **Serialization issues**:
   - Symptoms: Unexpected content in responses
   - Solution: Check content type and serialization configuration

4. **MockK verification failures**:
   - Symptoms: `Verification failed: Expected: XX, actual: YY`
   - Solution: Double-check mock setup and ensure mocked methods are called as expected

### Debugging Tests

For difficult-to-diagnose issues, use these techniques:

1. **Print response content**:
   ```kotlin
   println("Response body: ${response.bodyAsText()}")
   println("Response status: ${response.status}")
   ```

2. **Enable verbose MockK logging**:
   ```kotlin
   // At the beginning of your test
   MockKAnnotations.init(this, relaxUnitFun = true)
   ```

3. **Use relaxed mocks**:
   ```kotlin
   val mock = mockk<Service>(relaxed = true)
   ```

4. **Debug with IDE**:
   - Set breakpoints in test code
   - Inspect variables during test execution
   - Use step-through debugging