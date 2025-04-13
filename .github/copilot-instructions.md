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
- **Testing**: Kotest and MockK for unit and integration tests
- **Error Handling**: Global exception handling with custom error pages

## Source Code Structure
```
src//test/kotlin/com/toolchest/config/ErrorHandlingTest.kt
src//test/kotlin/com/toolchest/config/DatabaseConfigTest.kt
src//test/kotlin/com/toolchest/templates
src//test/kotlin/com/toolchest/templates/UIComponentsTest.kt
src//test/kotlin/com/toolchest/TestUtils.kt
src//test/kotlin/com/toolchest/routes
src//test/kotlin/com/toolchest/routes/Base64RoutesTest.kt
src//test/kotlin/com/toolchest/routes/HomeRoutesTest.kt
src//test/kotlin/com/toolchest/routes/TagRoutesTest.kt
src//test/kotlin/com/toolchest/services
src//test/kotlin/com/toolchest/services/ToolServiceImplTest.kt
src//test/kotlin/com/toolchest/services/Base64ServiceImplTest.kt
src//main/resources/logback.xml
src//main/resources/static
src//main/resources/static/css
src//main/resources/static/css/main.css
src//main/resources/static/js
src//main/resources/templates
src//main/resources/templates/macros.ftl
src//main/resources/templates/test
src//main/resources/templates/test/test-tool-card.ftl
src//main/resources/templates/test/test-tag-navigation.ftl
src//main/resources/templates/components
src//main/resources/templates/components/macros.ftl
src//main/resources/templates/components/tag-navigation.ftl
src//main/resources/templates/components/footer.ftl
src//main/resources/templates/components/error-message.ftl
src//main/resources/templates/components/header.ftl
src//main/resources/templates/components/tool-card.ftl
src//main/resources/templates/layouts
src//main/resources/templates/layouts/base.ftl
src//main/resources/templates/pages
src//main/resources/templates/pages/coming-soon.ftl
src//main/resources/templates/pages/base64-result.ftl
src//main/resources/templates/pages/home.ftl
src//main/resources/templates/pages/tag.ftl
src//main/resources/templates/pages/base64.ftl
src//main/resources/templates/pages/about.ftl
src//main/resources/templates/pages/error.ftl
src//main/resources/templates/pages/partials
src//main/resources/templates/pages/partials/tool-grid-items.ftl
src//main/kotlin/com/toolchest/middleware
src//main/kotlin/com/toolchest/Application.kt
src//main/kotlin/com/toolchest/config
src//main/kotlin/com/toolchest/config/DatabaseConfig.kt
src//main/kotlin/com/toolchest/config/PluginsConfig.kt
src//main/kotlin/com/toolchest/config/RoutingConfig.kt
src//main/kotlin/com/toolchest/config/KoinConfig.kt
src//main/kotlin/com/toolchest/config/ErrorPageModel.kt
src//main/kotlin/com/toolchest/data
src//main/kotlin/com/toolchest/data/dto
src//main/kotlin/com/toolchest/data/dto/DTOs.kt
src//main/kotlin/com/toolchest/data/tables
src//main/kotlin/com/toolchest/data/tables/Tables.kt
src//main/kotlin/com/toolchest/data/entities
src//main/kotlin/com/toolchest/data/entities/Entities.kt
src//main/kotlin/com/toolchest/routes
src//main/kotlin/com/toolchest/routes/HomeRoutes.kt
src//main/kotlin/com/toolchest/routes/Base64Routes.kt
src//main/kotlin/com/toolchest/services
src//main/kotlin/com/toolchest/services/Base64Service.kt
src//main/kotlin/com/toolchest/services/ToolServiceImpl.kt
src//main/kotlin/com/toolchest/services/ToolService.kt
src//main/kotlin/com/toolchest/services/Base64ServiceImpl.kt
```

## Rules
- Before introducing a new file make sure something else is not already doing it or the file is located elsewhere.
- DO NOT FORGET TO ADD IMPORT STATEMENTS FOR NEW CLASSES AND FUNCTIONS.

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