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

To run with more detailed output:
```bash
./gradlew test --tests "com.toolchest.templates.UIComponentsTest" -i
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

- **JUnit 5**: Main testing framework with annotations and assertions
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


## Template Testing

FreeMarker templates are tested by rendering them with test data and verifying the output. This section has been updated based on recent experiences with the UIComponentsTest class.

### FreeMarker Template Testing Best Practices

1. **Testing Template Files Existence**

```kotlin
@Test
fun `template file should exist in resources`() {
    val classLoader = javaClass.classLoader
    assertTrue(classLoader.getResource("templates/components/tool-card.ftl") != null, 
               "Template file should exist")
}
```

2. **Testing Macro-Based Templates**

When testing FreeMarker templates that define macros, you need special handling:

```kotlin
@Test
fun `should render template macro correctly`() = testApplication {
    application {
        configureFreeMarkerForTests()
        
        routing {
            get("/test-template") {
                // Important: Use a wrapper template that calls the macro
                call.respond(FreeMarkerContent(
                    "components/template-test-wrapper.ftl",
                    mapOf("data" to testData)
                ))
            }
        }
    }
    
    val response = client.get("/test-template")
    assertEquals(HttpStatusCode.OK, response.status)
    
    val content = response.bodyAsText()
    assertContains(content, "Expected Content")
}
```

3. **Creating Wrapper Templates for Macro Testing**

For templates that define macros but don't invoke them, create wrapper templates in your test resources:

```kotlin
// src/test/resources/templates/components/tool-card-test-wrapper.ftl
<#import "/components/tool-card.ftl" as toolCardTemplate>
<@toolCardTemplate.toolCard tool />
```

This ensures the macro is actually called during the test.

### Structuring Template Tests with JUnit

```kotlin
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class UIComponentsTest {
    
    // Sample data for all tests
    private val sampleTags = MockFactory.createSampleTags()
    private val sampleTools = MockFactory.createSampleTools(sampleTags)
    private val toolServiceMock = MockFactory.createToolServiceMock()
    
    @BeforeEach
    fun setup() {
        // Configure mock responses
        every { toolServiceMock.getAllTools() } returns sampleTools
        every { toolServiceMock.getAllTags() } returns sampleTags
    }
    
    @AfterEach
    fun tearDown() {
        // Clean up resources
        stopKoin()
    }
    
    @Nested
    @DisplayName("Template files existence")
    inner class TemplateFilesExistence {
        @Test
        fun `tag navigation should exist in the templates directory`() {
            val classLoader = javaClass.classLoader
            assertTrue(classLoader.getResource("templates/components/tag-navigation.ftl") != null)
        }
        
        // Additional file existence tests
    }
    
    @Nested
    @DisplayName("Template rendering")
    inner class TemplateRendering {
        @Test
        fun `should render tool card component correctly`() = testApplication {
            application {
                configureFreeMarkerForTests()
                
                routing {
                    get("/test-tool-card") {
                        val tool = sampleTools.first()
                        call.respond(FreeMarkerContent(
                            "components/tool-card-test-wrapper.ftl",
                            mapOf("tool" to tool)
                        ))
                    }
                }
                
                attributes.put(ToolServiceKey, toolServiceMock)
            }
            
            val response = client.get("/test-tool-card")
            assertEquals(HttpStatusCode.OK, response.status)
            
            val content = response.bodyAsText()
            assertContains(content, "Base64")
            assertContains(content, "/tag/encoding")
        }
        
        // Additional rendering tests
    }
}
```

### Common FreeMarker Template Testing Issues

1. **Empty Content When Testing Macro Templates**

**Problem**: When rendering a template that only defines a macro without calling it, FreeMarker produces an empty string.

**Solution**: Create test wrapper templates that import the original macro templates and call the macros with test data:

```kotlin
// src/test/resources/templates/components/tool-card-test-wrapper.ftl
<#import "/components/tool-card.ftl" as toolCardTemplate>
<@toolCardTemplate.toolCard tool />
```

2. **Resource Path Issues**

**Problem**: Templates can't be found during tests due to classpath or resource path issues.

**Solution**: Use enhanced debugging to verify resource paths:

```kotlin
// In your configureFreeMarkerForTests() function
println("Template directory access check (via classloader):")
println("- tool-card.ftl exists: ${classLoader.getResource("templates/components/tool-card.ftl") != null}")
```

3. **Inconsistent URL Paths in Templates**

**Problem**: Tests fail because URL paths in templates don't match what the tests expect.

**Solution**: Keep URL formats consistent across templates and tests. For example, use `/tag/{slug}` consistently rather than mixing `/tag/` and `/tags/`.

## Best Practices

### 1. Test Structure Pattern

Follow the Arrange-Act-Assert pattern:

```kotlin
@Test
fun `test description`() {
    // Arrange - Set up test data and mocks
    val service = mockk<Base64Service>()
    every { service.encodeString(any(), any()) } returns "encoded-value"
    
    // Act - Perform the action being tested
    val result = service.encodeString("test", false)
    
    // Assert - Verify the expected outcome
    assertEquals("encoded-value", result)
}
```

### 2. Naming Conventions

Use descriptive test names that explain the expected behavior:

```kotlin
@Test
fun `GET base64 should return 200 OK with expected content`()

@Test
fun `encodeString should handle empty input gracefully`() 

@Test
fun `when input is invalid then an exception is thrown`()
```

### 3. Test Isolation

Ensure each test is isolated and doesn't depend on the state of other tests:

- Reset mocks between tests
- Don't rely on global state
- Use `@BeforeEach` and `@AfterEach` to set up and tear down test environment

### 4. Comprehensive Testing

Test both happy paths and edge cases:

- Valid inputs
- Empty or null inputs
- Maximum size inputs
- Invalid inputs that should trigger errors

### 5. Debugging Techniques

For troubleshooting test failures, add debug output:

```kotlin
// In your test
val content = response.bodyAsText()
println("=== TEMPLATE OUTPUT ===")
println(content)
println("=====================")
```

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

3. **FreeMarker template issues**:
   - Symptoms: Empty template output, missing content
   - Solution: Check if templates define macros that need to be called explicitly in wrapper templates

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

4. **Run tests with increased logging**:
   ```bash
   ./gradlew test --tests "SpecificTest" -i
   ```

5. **Debug test resources**:
   ```kotlin
   val classLoader = javaClass.classLoader
   println("Current working directory: ${File(".").absolutePath}")
   println("Resource exists: ${classLoader.getResource("path/to/resource") != null}")
   ```

6. **Use wrapper templates for macro testing**:
   Create special test templates that import and call macros from the templates you want to test.