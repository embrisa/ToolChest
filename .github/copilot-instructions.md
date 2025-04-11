# GitHub Copilot Instructions for ToolChest Project

## Project Overview

ToolChest is a Kotlin-based monolith application using Ktor and HTMX to deliver free utility tools with server-side rendering. The platform aims to be cost-effective, SEO-friendly, and monetized through strategic ad placement.

## Key Technology Decisions

- **Backend Framework**: Ktor with FreeMarker for server-side rendering
- **Frontend Enhancement**: HTMX for dynamic interactions without heavy JavaScript
- **CSS Framework**: Tailwind CSS via CDN for utility-first styling with minimal footprint
- **Database**: SQLite initially (migration path to PostgreSQL when traffic justifies)
- **Dependency Injection**: Koin
- **Caching**: Local Caffeine Cache + browser caching with proper HTTP headers
- **Deployment**: Direct PaaS deployment (no Docker) on platforms with generous free tiers
- **Compression**: Gzip for all text-based responses
- **CDN**: Cloudflare free tier for edge caching
- **Monitoring**: Simple health check endpoints + UptimeRobot

## Development Guidelines

### Architecture Principles

1. **Monolithic Design**: All routes, services, and rendering in a single Ktor application
2. **Low Operational Costs**: Prefer solutions with minimal infrastructure requirements
3. **Progressive Enhancement**: Server-side rendering first, HTMX for enhancement
4. **Single Instance**: Design for single-instance deployment initially
5. **Static Generation**: Pre-generate static content where possible

### Code Structure

Follow this structure for organizing code:

```
/ToolChest
├── .github/
│   └── copilot-instructions.md     # GitHub Copilot instructions for the project
├── .gradle/                        # Gradle build system cache
├── .idea/                          # IntelliJ IDEA configuration files
├── bin/                            # Compiled binaries
├── build/                          # Build output directory
├── gradle/                         # Gradle wrapper files
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── com/
│   │   │       └── toolchest/
│   │   │           ├── Application.kt           # Main application entry point
│   │   │           ├── config/                  # Application configuration
│   │   │           │   ├── KoinConfig.kt        # Application configuration
│   │   │           │   ├── RoutingConfig.kt     # Routing configuration
│   │   │           │   └── PluginsConfig.kt     # Plugins configuration
│   │   │           ├── middleware/              # Global middleware
│   │   │           ├── routes/                  # Route handlers
│   │   │           └── services/                # Business logic
│   │   └── resources/
│   │       ├── logback.xml                      # Logging configuration
│   │       ├── static/
│   │       │   ├── css/
│   │       │   │   └── main.css                 # Custom CSS styles
│   │       │   └── js/                          # JavaScript files
│   │       └── templates/                       # FreeMarker templates
│   │           ├── components/                  # Reusable template components
│   │           │   ├── footer.ftl               # Footer component
│   │           │   ├── header.ftl               # Header component
│   │           │   └── tool-card.ftl            # Tool card component
│   │           ├── layouts/
│   │           │   └── base.ftl                 # Base layout template
│   │           └── pages/
│   │               └── home.ftl                 # Home page template
│   └── test/                                    # Test code
├── build.gradle.kts                             # Gradle build configuration
├── gradlew                                      # Gradle wrapper script (Unix)
├── gradlew.bat                                  # Gradle wrapper script (Windows)
├── local.properties                             # Local configuration
└── README.md                                    # Project documentation
```

## Rules
- Before introducing a new file make sure something else is not already doing it or the file is located elsewhere.

## Project Commands
- `./gradlew build` - Build the project
- `./dev-run.sh`    - Run the project in development mode
- `./gradlew test`  - Run tests
- `./gradlew clean` - Clean the project

### Coding Conventions

1. **Tools as Services**: Implement each tool functionality as a service class
2. **Route Grouping**: Group routes by tool functionality
3. **Template Components**: Create reusable FreeMarker templates/macros for common elements
4. **Exception Handling**: Implement global exception handling middleware
5. **Caching Decorators**: Use service decorators for caching where appropriate
6. **Tailwind Classes**: Use Tailwind utility classes directly in FreeMarker templates for styling

### Implementation Priorities

1. Focus on server-side rendering with proper semantic HTML
2. Ensure responsive design for all device sizes using Tailwind's responsive utilities
3. Optimize for SEO with proper meta tags and structured data
4. Implement effective caching strategies to minimize resource usage
5. Keep ad implementation minimal and non-intrusive

## Styling Guidelines

1. **Utility-First Approach**: Use Tailwind's utility classes directly in FreeMarker templates
2. **Component Extraction**: Create reusable FreeMarker macros for common UI patterns
3. **Responsive Design**: Use Tailwind's responsive prefixes (sm:, md:, lg:, xl:) consistently
4. **Custom Components**: Define custom components with @apply when needed in a minimal stylesheet
5. **Dark Mode**: Consider optional dark mode support with Tailwind's dark: variant

## Tool Implementation Guidelines

When implementing tools:

1. **Service Layer**: Encapsulate core tool functionality in service classes
2. **HTMX Integration**: Use HTMX attributes for partial updates and form submissions
3. **Error Handling**: Implement client and server-side validation
4. **Caching**: Cache deterministic operations with appropriate TTL
5. **Styling**: Use Tailwind utility classes for consistent UI across all tools

## SEO Requirements

1. Generate proper semantic HTML with correct heading hierarchy
2. Implement meta tags, titles and descriptions dynamically based on tool
3. Create schema.org structured data for each tool
4. Ensure responsive design for mobile-friendly ranking
5. Focus on page speed through proper caching and minimal resource usage

## Monetization Implementation

1. Start with a single ad unit in a non-intrusive position
2. Load ads only after core content has been rendered
3. Monitor and ensure ads don't impact core user experience
4. Limit initial implementation to 2-3 ad units maximum

## Cost Optimization Focus

1. Prefer solutions with minimal infrastructure requirements
2. Avoid suggesting managed services when built-in or free alternatives exist
3. Focus on single-instance deployment patterns
4. Consider serverless functions for computationally simple tools
5. Utilize browser caching and local caching to reduce backend load

## Testing Guidelines

1. **HTML Response Testing**: When testing routes that return HTML/HTMX responses, verify content presence rather than exact structure. Use `assertTrue(body.contains("expected content"))` instead of expecting specific HTML patterns.

2. **Content Extraction**: Use regex patterns to extract and validate specific values from HTML responses:
   ```kotlin
   val textareaPattern = "<textarea[^>]*id=\"result-text\"[^>]*>(.*?)</textarea>".toRegex(RegexOption.DOT_MATCHES_ALL)
   val match = textareaPattern.find(responseText)
   val content = match?.groupValues?.get(1)?.trim() ?: ""
   ```

3. **Response Validation**: Test for the presence of expected content elements rather than exact string matches, as HTML formatting may change.

4. **Template Integration Tests**: Include tests that verify templates render correctly with the provided models.

5. **Edge Case Coverage**: Test multiple edge cases for each feature:
   - Empty inputs/files
   - Maximum size inputs (performance testing)
   - Invalid/malformed inputs
   - Special characters and Unicode handling
   - Toggle options (e.g., URL-safe vs. standard encoding)

6. **HTTP Header Validation**: For file downloads or specialized responses, verify HTTP headers:
   ```kotlin
   val contentDisposition = response.headers[HttpHeaders.ContentDisposition]
   assertNotNull(contentDisposition)
   assertTrue(contentDisposition.contains("attachment"))
   assertTrue(contentDisposition.contains("filename"))
   ```

7. **Error Handling**: Verify appropriate error responses and error message content:
   ```kotlin
   assertTrue(body.contains("Error:"), "Response should show error message")
   assertEquals(HttpStatusCode.BadRequest, response.status)
   ```

8. **Numeric Output Validation**: When testing outputs with variable formatting:
   ```kotlin
   // Handle numbers displayed with or without formatting (e.g., "136,536" or "136536")
   val outputLengthPattern = "Output length: ([\\d,]+)".toRegex()
   val outputLengthStr = outputLengthMatch.groupValues[1].replace(",", "")
   val outputLength = outputLengthStr.toIntOrNull()
   ```

### Common Testing Pitfalls

- **JSON vs HTML Expectations**: Avoid writing tests that expect JSON responses when endpoints return HTML. Check for content within HTML structure instead.
- **Missing HTML Element IDs**: Ensure HTML elements in templates have proper IDs to facilitate testing.
- **HTMX Response Format**: Remember that HTMX responses are HTML fragments, not full pages or JSON structures.
- **Brittle Assertions**: Avoid assertions tied to exact HTML structure; prefer content-based assertions.
- **Ignored Edge Cases**: Always test empty inputs, maximum size inputs, and invalid inputs.
- **Binary Data Testing**: When testing binary conversions, use `assertContentEquals` for byte array comparisons.