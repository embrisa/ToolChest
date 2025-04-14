# ToolChest Testing Guide

This guide explains how to write tests for the ToolChest application, using the testing utilities and patterns established in the codebase.

## Table of Contents

- [Testing Utilities](#testing-utilities)
- [Setting Up Tests](#setting-up-tests)
- [Testing Routes](#testing-routes)
- [Testing Services](#testing-services)
- [Testing Templates and UI Components](#testing-templates-and-ui-components)
- [Testing Database Operations](#testing-database-operations)
- [Mocking](#mocking)

## Testing Utilities

ToolChest provides several utilities to simplify test setup:

### TestUtils.kt

`TestUtils.kt` contains helper functions and classes for setting up a consistent test environment:

- `runTestWithSetup()`: Main test environment setup function that configures a Ktor test application
- `KoinTestModule`: Creates test Koin modules with mock dependencies
- `MockFactory`: Creates pre-configured mocks for common services

```kotlin
// Example usage
runTestWithSetup(
    enableDb = false,
    useTestDatabase = true,
    tables = arrayOf(Tools, Tags, ToolTags),
    koinModules = listOf(KoinTestModule.createTestModule())
) {
    // Test code goes here
}
```

### DatabaseTestUtils.kt

`DatabaseTestUtils.kt` provides database-specific test utilities:

- `initH2Database()`: Creates an in-memory H2 database for testing
- `createSchema()`: Creates database tables in a transaction
- `dropSchema()`: Drops database tables in a transaction
- `withTransaction()`: Executes code within a database transaction
- `withTestDatabase()`: Sets up and tears down a test database for the test duration

```kotlin
// Example usage
DatabaseTestUtils.withTestDatabase(Tools, Tags, ToolTags) {
    // Test database is set up here
    val service = ToolServiceImpl()
    val tools = service.getAllTools()
    // Test database is automatically cleaned up after
}
```

## Setting Up Tests

### Basic Test Structure

Tests should follow this pattern:

1. Organize related tests into nested classes using `@Nested` and `@DisplayName`
2. Use `runTestWithSetup()` to create a consistent test environment
3. Configure necessary mocks via `MockFactory` or directly
4. Run tests and verify results

```kotlin
@Nested
@DisplayName("Home Page Routes")
inner class HomePageRoutes {
    @Test
    fun `GET home route should return OK status with correct content`() {
        // 1. Create specific mock needed
        val toolServiceMock = MockFactory.createToolServiceMock()
        
        // 2. Configure mock responses for this test
        every { toolServiceMock.getAllTools() } returns listOf(tool)
        
        // 3. Run test with setup
        runTestWithSetup(
            koinModules = listOf(KoinTestModule.createTestModule(toolService = toolServiceMock))
        ) {
            // 4. Make the client request
            val response = client.get("/")
            
            // 5. Assertions
            assertEquals(HttpStatusCode.OK, response.status)
            
            // 6. Verify mocks were called
            verify { toolServiceMock.getAllTools() }
        }
    }
}
```

### When to Use Database Tests

- Use `useTestDatabase = true` when you want to test real database interactions
- Use `DatabaseTestUtils.withTestDatabase()` as an alternative for focused database tests
- Always specify the tables that need to be created

```kotlin
@Test
fun `getAllTools should return only active tools in correct order`() {
    runTestWithSetup(
        useTestDatabase = true,
        tables = arrayOf(Tools, Tags, ToolTags, ToolUsageStats)
    ) {
        // Setup test data
        seedTestData()
        
        // Create service instance
        val service = ToolServiceImpl()
        
        // Execute test
        val tools = service.getAllTools()
        
        // Assertions
        assertEquals(3, tools.size)
    }
}
```

## Testing Routes

Route tests should verify:

1. HTTP status codes
2. Response content
3. Service method calls
4. Headers (when relevant)
5. Error handling

The `Base64RoutesTest.kt` and `HomeRoutesTest.kt` provide good examples:

```kotlin
@Test
fun `POST base64 encode should encode text and record usage`() {
    // 1. Prepare mocks
    val base64ServiceMock = mockk<Base64Service>()
    val toolServiceMock = MockFactory.createToolServiceMock()

    // 2. Run Test with Setup
    runTestWithSetup(
        koinModules = listOf(
            KoinTestModule.createTestModule(
                base64Service = base64ServiceMock,
                toolService = toolServiceMock
            )
        )
    ) {
        // 3. Setup mock behavior
        every { base64ServiceMock.encodeString("Hello", false) } returns "SGVsbG8="

        // 4. Perform request
        val response = client.post("/base64/encode") {
            contentType(ContentType.Application.FormUrlEncoded)
            setBody(FormDataContent(parametersOf("text" to listOf("Hello"))))
        }

        // 5. Assertions
        assertEquals(HttpStatusCode.OK, response.status)
        assertContains(response.bodyAsText(), "SGVsbG8=")

        // 6. Verifications
        verify(exactly = 1) { toolServiceMock.recordToolUsage("base64") }
        verify(exactly = 1) { base64ServiceMock.encodeString("Hello", false) }
    }
}
```

## Testing Services

Service tests typically verify:

1. Business logic
2. Data transformations
3. Database interactions
4. Error handling

`ToolServiceImplTest.kt` provides comprehensive examples:

```kotlin
@Test
fun `getToolBySlug should return the correct tool`() {
    runTestWithSetup(
        useTestDatabase = true,
        tables = arrayOf(Tools, Tags, ToolTags, ToolUsageStats)
    ) {
        // Setup test data
        seedTestData()
        
        // Create service instance
        val service = ToolServiceImpl()
        
        // Execute test
        val tool = service.getToolBySlug("base64")
        
        // Assertions
        assertNotNull(tool)
        assertEquals("Base64 Encoder/Decoder", tool.name)
        assertEquals("fas fa-exchange-alt", tool.iconClass)
        
        // Test getting an inactive tool (should return null)
        val inactiveTool = service.getToolBySlug("inactive-tool")
        assertNull(inactiveTool)
    }
}
```

## Testing Templates and UI Components

`UIComponentsTest.kt` shows how to test FreeMarker templates:

1. Verify template files exist
2. Test rendering with sample data
3. Check for specific elements in rendered content

```kotlin
@Test
fun `should render tool card component correctly`() = runTestWithSetup(
    koinModules = listOf(KoinTestModule.createTestModule(toolService = toolServiceMock))
) {
    // Setup routes for this specific test
    routing {
        get("/test-tool-card") {
            val tool = sampleTools.first()

            // Render the template with our test data
            call.respond(
                FreeMarkerContent(
                    "components/tool-card-test-wrapper.ftl",
                    mapOf("tool" to tool)
                )
            )
        }
    }

    // Execute the test
    val response = client.get("/test-tool-card")
    assertEquals(HttpStatusCode.OK, response.status)

    val content = response.bodyAsText()

    // Basic content checks
    assertContains(content, "Base64")
    assertContains(content, "/tag/encoding")
    assertContains(content, sampleTools.first().description)
}
```

### Template Test Structure

The templates directory structure follows this pattern:

```
src/test/resources/templates/
├── components/
│   ├── tag-navigation.ftl
│   └── tool-card.ftl
└── pages/
    └── partials/
        └── tool-grid-items.ftl
```

Make sure to add test wrappers for components, such as `tag-navigation-test-wrapper.ftl` or `tool-card-test-wrapper.ftl`, to isolate components for testing.

## Testing Database Operations

The `DatabaseConfigTest.kt` shows how to test database configurations:

```kotlin
@Test
fun `database should be seeded with initial data`() {
    // Use withTestDatabase helper
    DatabaseTestUtils.withTestDatabase(Tags, Tools) {
        // Use the H2 database that was created by withTestDatabase
        val db = DatabaseTestUtils.initH2Database()
        
        val dbConfig = MockDatabaseConfig()
        dbConfig.initDatabase(db)

        // Verify tables are created and seeded
        transaction {
            assertEquals(1, Tags.selectAll().count())
            assertEquals(1, Tools.selectAll().count())
        }
    }
}
```

## Mocking

The `MockFactory` class in `TestUtils.kt` provides standardized mocks:

```kotlin
// Creating a mock ToolService
val toolServiceMock = MockFactory.createToolServiceMock()

// Creating sample data
val sampleTags = MockFactory.createSampleTags()
val sampleTools = MockFactory.createSampleTools(sampleTags)

// Creating a custom Koin module with mocks
val testModule = KoinTestModule.createTestModule(
    base64Service = mockBase64Service,
    toolService = mockToolService
)
```

### Error Handling Tests

`ErrorHandlingTest.kt` shows how to test application error handling:

```kotlin
@Test
fun `should show 404 not found error page`() {
    runTestWithSetup(
        koinModules = listOf(KoinTestModule.createTestModule())
    ) {
        // Setup route for testing
        application {
            routing {
                get("/test-route") {
                    call.respondText("Test route")
                }
            }
        }

        // Make request to non-existent page
        val response = client.get("/non-existent-page")
        
        // Assertions
        assertEquals(HttpStatusCode.NotFound, response.status)
        val body = response.bodyAsText()
        assertContains(body, "404")
        assertContains(body, "Page Not Found", ignoreCase = true)
    }
}
```

## Common Testing Patterns

- Use descriptive test names in backtick format: `` `should do something specific` ``
- Group related tests using `@Nested` classes
- Organize tests by feature or component
- Use `MockFactory` for consistent mock creation
- Follow the pattern: setup → execute → assert → verify
- Always clean up resources in database tests 