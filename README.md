# ToolChest

## Project Overview
ToolChest is a Ktor-based monolithic web application providing free, high-quality utility tools with a focus on privacy, accessibility, and ease of use. The platform uses server-side rendering (SSR) with FreeMarker templates, HTMX for dynamic updates, and Tailwind CSS for modern, responsive design. The first tool implemented is a Base64 Encoder/Decoder for both text and files. More tools are planned and will be added incrementally.

## Features
- **Base64 Encoder/Decoder**: Encode/decode text and files to/from Base64, with URL-safe option and file download support.
- **Tag Filtering & Search**: Filter tools by tag and search for tools (currently only Base64 tool is available).
- **Error Handling**: Custom error pages for 400, 403, 404, and 500 errors, with HTMX-aware fragments for partial updates.
- **Responsive UI**: Mobile-friendly, accessible design using Tailwind CSS and FreeMarker macros/components.
- **SSR & HTMX**: All pages are server-rendered, with HTMX used for dynamic fragments (search, load more, etc.).
- **No Authentication**: All tools are free to use, no registration required.
- **Testing**: Strong test coverage for services, routes, configuration, and templates.

## Directory Structure
```
/ToolChest
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── com/toolchest/
│   │   │       ├── Application.kt           # Main entry point
│   │   │       ├── config/                  # App/config modules (Koin, Routing, Plugins, DB)
│   │   │       ├── routes/                  # Route handlers (Home, Base64)
│   │   │       ├── services/                # Business logic (ToolService, Base64Service)
│   │   │       └── data/                    # Entities, DTOs, Tables
│   │   └── resources/
│   │       ├── application.conf             # Main config
│   │       ├── logback.xml                  # Logging config
│   │       ├── static/
│   │       │   ├── css/
│   │       │   │   └── main.css             # Custom styles
│   │       │   └── js/                      # (Currently empty)
│   │       └── templates/
│   │           ├── components/              # Header, footer, tool-card, tag-navigation, etc.
│   │           ├── layouts/                 # Base layout macro
│   │           └── pages/                   # home.ftl, base64.ftl, error.ftl, about.ftl, etc.
│   └── test/
│       └── kotlin/com/toolchest/
│           ├── services/                    # Service tests
│           ├── routes/                      # Route tests
│           ├── config/                      # Config/error tests
│           ├── templates/                   # UI/component tests
│           └── TestUtils.kt                 # Test helpers
├── build.gradle.kts                         # Gradle build config
├── README.md                                # Project documentation
└── docs/
    └── deployment-readiness.md              # Deployment readiness assessment
```

## Technology Stack
- **Backend**: Ktor (Kotlin), Koin (DI), Exposed (ORM), SQLite (default DB)
- **Frontend**: FreeMarker (SSR), HTMX, Tailwind CSS, Font Awesome
- **Testing**: JUnit5, MockK, H2 (for in-memory DB tests), Jsoup (HTML parsing)
- **Logging**: SLF4J with Logback

## Error Handling
- Custom error pages for 400, 403, 404, and 500 errors
- HTMX-aware error fragments for partial updates
- All error templates are present in `templates/pages` and `templates/components`

## Testing
- Comprehensive test coverage for services, routes, configuration, and UI components
- Tests are located in `src/test/kotlin/com/toolchest/`
- Uses in-memory H2 database for isolated DB tests

## Deployment & Configuration
- **Default DB**: SQLite, configured in `application.conf` (changeable via env vars)
- **Port**: Defaults to 8080, can be overridden with `PORT` env var
- **Production**: Review and set environment variables for DB path, port, and any secrets before deploying
- **Static Assets**: CSS is present; JS directory is currently empty (add JS if needed for new features)
- **Health Check**: `/health` endpoint returns `OK`

## Monetization
- No ad code is present yet. Footer and layout are ready for non-intrusive ad integration as planned.

## UI/UX
- Fully responsive, mobile-friendly design
- Uses FreeMarker macros and components for DRY, maintainable templates
- Navigation and tag filtering are implemented