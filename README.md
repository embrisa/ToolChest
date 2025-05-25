### 1. Project Overview and Goals

  * **Project Name:** ToolChest
  * **Core Goal:** To provide a web application offering free, high-quality utility tools with a strong emphasis on privacy, accessibility, and ease of use.
  * **Current State:** The project is built on a TypeScript/Node.js stack using the Express.js framework.
  * **Key Characteristics:**
      * Server-Side Rendering (SSR) using Nunjucks templates.
      * Dynamic UI updates leveraging HTMX.
      * Modern and responsive design via Tailwind CSS.
      * No user authentication required; all tools are free to use.
      * Incremental addition of new utility tools. The first implemented tool is a Base64 Encoder/Decoder.

### 2. Core Requirements & Features

  * **Functionality:**
      * **Base64 Encoder/Decoder:** Must support encoding/decoding of both text and files, include a URL-safe option, and provide file download capabilities for results.
      * **Tool Discovery:** Users should be able to filter tools by tags and search for tools.
  * **User Experience:**
      * **Privacy-focused:** No user registration.
      * **Accessibility:** Design should be accessible.
      * **Ease of Use:** Tools should be intuitive.
      * **Responsive UI:** Mobile-friendly interface.
  * **Technical:**
      * **Error Handling:** Implement custom error pages for 400, 403, 404, and 500 errors. Error responses should be HTMX-aware, providing fragments for partial updates where appropriate.
      * **Testing:** Comprehensive test coverage for services, routes, and middleware.

### 3. Technology Stack

  * **Backend:**
      * **Language:** TypeScript
      * **Runtime:** Node.js (v18, v20 or later recommended)
      * **Framework:** Express.js
  * **Database:**
      * **ORM:** Prisma
      * **Database:** PostgreSQL (both development and production)
      * **Schema Definition:** `prisma/schema.prisma` (see `prisma/migrations/20250523201833_initial_postgresql/migration.sql` for table structure)
  * **Frontend & Templating:**
      * **Templating Engine:** Nunjucks (for SSR)
      * **Dynamic Interactions:** HTMX
      * **Styling:**
          * Tailwind CSS (via CDN)
          * Custom CSS in `src/public/css/main.css`
          * Font Awesome (via CDN) for icons.
  * **Testing:**
      * **Framework:** Jest
      * **HTTP Testing:** Supertest
      * **Configuration:** `jest.config.js`, `jest.setup.js`
  * **Dependency Injection (DI):** InversifyJS
      * Configuration: `src/config/inversify.config.ts`
      * Type Definitions: `src/config/types.ts`
  * **Logging:** Morgan (HTTP request logger), Custom logger (`src/utils/logger.ts`)
  * **Development Tools:**
      * **Build Tool:** `tsc` (TypeScript Compiler)
      * **Hot Reloading:** `nodemon`
      * **Linting:** ESLint (`.eslintrc.js`, `.eslintignore`)
      * **Formatting:** Prettier (`.prettierrc.js`)
      * **Package Manager:** npm (see `package.json` and `package-lock.json`)
  * **Deployment:**
      * **Containerization:** Docker (`Dockerfile`)
      * **Platform:** Railway (`railway.json`)

### 4. Architecture

  * **Monolithic Web Application:** All functionality is contained within a single application.
  * **Server-Side Rendering (SSR):** Nunjucks is used to render HTML on the server.
  * **Progressive Enhancement:** HTMX is used for dynamic partial page updates, enhancing the SSR foundation.
  * **Service-Oriented (Internal):** Business logic is encapsulated in services (e.g., `ToolService`, `Base64Service`).
  * **Controller Layer:** Express controllers handle HTTP requests, delegate to services, and manage responses (e.g., `HomeController`, `Base64Controller`).
  * **Middleware:** Custom and third-party middleware for logging, compression, cache control, and error handling.
  * **Dependency Injection:** InversifyJS is used to manage dependencies between components, particularly services and controllers.
  * **Configuration-Driven:** Utilizes `.env` for environment variables and `tsconfig.json` for TypeScript compilation.
  * **Data Transfer Objects (DTOs):** Used for structuring data between layers (e.g., `ToolDTO`, `TagDTO`).

### 5. Project Structure

The project follows a standard Node.js/TypeScript application structure:

```
/project-root
├── /dist           # Compiled JavaScript (output of TSC)
├── /prisma         # Prisma schema and migration files
│   └── schema.prisma
│   └── migrations/
├── /src            # TypeScript source files
│   ├── /config     # Configuration files (db, server, DI, etc.)
│   ├── /controllers # Request handlers
│   ├── /database   # Database related files (seeds, etc.)
│   │   └── /seeds
│   ├── /dto        # Data Transfer Objects (interfaces/classes)
│   ├── /middleware # Custom Express middleware
│   ├── /public     # Static assets (CSS, JS, images)
│   │   └── /css
│   │   └── /js
│   ├── /routes     # Express route definitions
│   ├── /services   # Business logic
│   ├── /templates  # View templates (Nunjucks)
│   │   ├── /components
│   │   ├── /layouts
│   │   └── /pages
│   ├── app.ts      # Express application setup
│   └── server.ts   # Server entry point
├── /tests          # Test files (Jest)
│   ├── /database
│   ├── /middleware
│   ├── /routes
│   └── /services
├── .env            # Environment variables (not committed)
├── .eslintignore
├── .eslintrc.js
├── .gitignore
├── .prettierrc.js
├── Dockerfile      # For building containerized application
├── package.json    # Project dependencies and scripts
├── railway.json    # Configuration for Railway deployment
├── README.md
└── tsconfig.json
```

### 6. Coding Conventions & Quality

  * **Language:** TypeScript. Adhere to strong typing and modern TypeScript features.
  * **Linting:** ESLint is configured. Run `npm run lint` to check for issues. Configuration is in `.eslintrc.js`.
  * **Formatting:** Prettier is used for code formatting. Run `npm run format` to format code. Configuration is in `.prettierrc.js`.
  * **File Naming:** Generally camelCase for `.ts` files (e.g., `toolService.ts`, `homeController.ts`).
  * **DI:** Use InversifyJS for managing dependencies. Define service and controller interfaces/types in `src/config/types.ts` and configure bindings in `src/config/inversify.config.ts`.
  * **Asynchronous Operations:** Use `async/await` for promises.
  * **Error Handling:** Utilize the centralized error handling middleware. Service methods should throw errors, and controllers should catch them and pass to `next(error)`.

### 7. Key Libraries, Frameworks, and Their Usage

  * **Express.js:** Web application framework.
      * Application setup in `src/app.ts`.
      * Routing is defined in `src/routes/` (e.g., `homeRoutes.ts`, `base64Routes.ts`).
  * **Nunjucks:** Templating engine for SSR.
      * Templates are located in `src/templates/`.
      * Configured in `src/app.ts`.
      * Includes global functions (e.g., `now`) and filters (e.g., `date`).
  * **HTMX:** For enhancing HTML with AJAX capabilities and partial updates.
      * Controllers should set `HX-Retarget` and `HX-Reswap` headers for HTMX responses where appropriate (see `base64Controller.ts`).
      * Error handling middleware is HTMX-aware.
  * **Prisma:** ORM for database interaction.
      * Schema defined in `prisma/schema.prisma`.
      * Migrations in `prisma/migrations/`. The current schema can be seen in `prisma/migrations/20250523201833_initial_postgresql/migration.sql`.
      * Prisma client is initialized in `src/config/database.ts` and injected via InversifyJS.
      * Database seeding script: `src/database/seeds/seed.ts`.
      * **Important:** When using `$queryRaw` with PostgreSQL, always quote table/column names (e.g., `"Tool"`, `"isActive"`) to match the exact case created by migrations. Unquoted identifiers are converted to lowercase by PostgreSQL.
  * **InversifyJS:** Dependency injection container.
      * Configuration: `src/config/inversify.config.ts`.
      * Service and controller symbols: `src/config/types.ts`.
  * **Jest:** Testing framework.
      * Tests are located in the `/tests` directory, mirroring the `src` structure.
      * Configuration: `jest.config.js`, setup: `jest.setup.js` (requires `reflect-metadata`).
  * **TypeScript:** Static typing for JavaScript.
      * Configuration: `tsconfig.json`. Key settings include `target: "es2020"`, `module: "commonjs"`, `experimentalDecorators: true`, `emitDecoratorMetadata: true`, `strict: true`, `esModuleInterop: true`.
  * **Multer:** Middleware for handling `multipart/form-data`, primarily used for file uploads.
      * Used in `base64Controller.ts` for file uploads.
  * **NodeCache:** In-memory caching for services to reduce database load.
      * Used in `ToolServiceImpl` for caching database query results.
  * **Morgan:** HTTP request logger middleware.
  * **Compression:** Middleware for gzipping responses.
  * **Dotenv:** Loads environment variables from a `.env` file.

### 8. Database Schema

The database schema is managed by Prisma. The PostgreSQL schema includes the following tables (refer to `prisma/migrations/20250523201833_initial_postgresql/migration.sql` for details):

  * **`Tool`**: Stores information about each utility tool.
      * Fields: `id`, `name`, `slug`, `description`, `iconClass`, `displayOrder`, `isActive`, `createdAt`, `updatedAt`.
      * Unique constraints on `name` and `slug`.
  * **`Tag`**: Stores tags that can be applied to tools.
      * Fields: `id`, `name`, `slug`, `description`, `color`, `createdAt`.
      * Unique constraints on `name` and `slug`.
  * **`ToolTag`**: A join table for the many-to-many relationship between `Tool` and `Tag`.
      * Fields: `toolId`, `tagId`, `assignedAt`.
      * Primary Key: (`toolId`, `tagId`).
  * **`ToolUsageStats`**: Tracks usage statistics for tools.
      * Fields: `id`, `toolId`, `usageCount`, `lastUsed`.
      * Unique constraint on `toolId`.

### 9. Testing Strategy

  * **Unit Tests & Integration Tests:** The project uses Jest for testing.
  * **Services:** Business logic in services is unit tested (e.g., `tests/services/toolService.test.ts`, `tests/services/base64Service.test.ts`). Mocking dependencies like PrismaClient and NodeCache is common.
  * **Routes/Controllers:** Endpoint behavior is tested using Supertest (e.g., `tests/routes/homeRoutes.test.ts`, `tests/routes/base64Routes.test.ts`). Services are typically mocked to isolate controller logic.
  * **Middleware:** Custom middleware like error handlers are tested (e.g., `tests/middleware/errorHandler.test.ts`).
  * **Database:** Tests for database connectivity and schema integrity (see `tests/database/database.test.ts`). Seeding logic can also be tested.
  * **Running Tests:**
      * `npm test`: Run all tests.
      * `npm run test:watch`: Run tests in watch mode.
      * `npm run test:coverage`: Generate a test coverage report.

### 10. Deployment

  * **Containerization:** A `Dockerfile` is provided for building a Docker image.
  * **Target Platform:** Configured for deployment on Railway (see `railway.json`).
  * **Database:** PostgreSQL database automatically provisioned on Railway.
  * **Build Command:** `npm run build` (compiles TypeScript to `dist/`).
  * **Start Command:** `node dist/server.js`.
  * **Health Check:** An endpoint at `/health` is available, responding with HTTP 200 "OK".
  * **Railway Setup:**
      * Add PostgreSQL database service to your Railway project
      * Set `DATABASE_URL` environment variable to `${{ Postgres.DATABASE_URL }}`
      * Migrations run automatically on deployment via `npx prisma migrate deploy`

### 11. Environment Variables

  * `PORT`: The port the server will listen on (default: 8080).
  * `DATABASE_URL`: The connection string for the database (e.g., `postgresql://user:password@localhost:5432/toolchest_dev` for local development, or Railway's PostgreSQL connection string for production).
  * `NODE_ENV`: Set to `production` for production builds/deployments, `development` otherwise. Influences logging, caching, and error detail visibility.
  * `ADMIN_SESSION_SECRET`: A secure random string used to sign session cookies. Generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.
  * `ADMIN_SESSION_TIMEOUT`: Default session timeout in milliseconds (default: 3600000 = 1 hour).
  * `ADMIN_REMEMBER_ME_TIMEOUT`: Session timeout when "Remember Me" is checked in milliseconds (default: 2592000000 = 30 days).
  * `ADMIN_BCRYPT_ROUNDS`: Number of bcrypt salt rounds for password hashing (default: 12).

### 12. Admin Authentication & Remember Me

  * **Session-Based Authentication:** Admin users authenticate using PostgreSQL-backed sessions via `express-session` and `connect-pg-simple`.
  * **Remember Me Functionality:** 
      * When the "Remember Me" checkbox is checked during login, the session duration is extended from 1 hour to 30 days.
      * Session timeout is configurable via environment variables (`ADMIN_SESSION_TIMEOUT` and `ADMIN_REMEMBER_ME_TIMEOUT`).
      * Sessions are stored in the PostgreSQL database and persist across application restarts.
  * **Password Security:** Passwords are hashed using bcrypt with configurable salt rounds (`ADMIN_BCRYPT_ROUNDS`).
  * **Rate Limiting:** Login attempts are rate-limited to prevent brute force attacks (5 attempts per 15 minutes per IP).
  * **Audit Logging:** All admin actions are logged to the `AdminAuditLog` table for security and compliance.
  * **Role-Based Access:** Three admin roles supported: `SUPER_ADMIN`, `ADMIN`, and `READ_ONLY`.

### 13. Error Handling Approach

  * **Centralized Middleware:** `src/middleware/errorHandlerMiddleware.ts` defines `notFoundHandler` and `mainErrorHandler`.
  * **404 Not Found:** Handled by `notFoundHandler` after all other routes.
  * **General Errors:** `mainErrorHandler` catches errors passed via `next(error)`.
  * **Status Codes:** Errors are expected to have a `statusCode` or `status` property. If not, 500 is assumed.
  * **Error Exposure:** The `err.expose` property can be used to determine if an error message is safe to display to the client.
  * **HTMX Awareness:** The `mainErrorHandler` checks for the `HX-Request` header to return either a full error page (`pages/error`) or an error message component (`components/error-message`) suitable for HTMX partial updates.
  * **Logging:** Errors are logged using the custom logger (`src/utils/logger.ts`). Stack traces are logged in non-production environments.

### 14. API Style (Internal)

While primarily an SSR application, the use of HTMX implies internal "API-like" interactions where controllers handle POST requests (e.g., for Base64 encoding/decoding) and return HTML fragments.

  * **Input:** Typically `application/x-www-form-urlencoded` or `multipart/form-data` (for file uploads).
  * **Output:** HTML fragments, with HTMX-specific headers (`HX-Retarget`, `HX-Reswap`).
  * **Error Responses (HTMX):** HTML fragments rendered from `components/error-message`.

### 15. Development Workflow

1.  **Prerequisites:** Node.js (v18, v20+), npm, PostgreSQL.
2.  **Installation:**
      * Clone repository.
      * `npm install` to install dependencies.
3.  **PostgreSQL Setup:**
      * **macOS:** `brew install postgresql@15 && brew services start postgresql@15`
      * **Other platforms:** Install PostgreSQL 15+ from [postgresql.org](https://www.postgresql.org/download/)
      * Create development database: `createdb toolchest_dev`
4.  **Environment Setup:**
      * Create a `.env` file with:
        ```
        DATABASE_URL="postgresql://yourusername@localhost:5432/toolchest_dev"
        PORT=8080
        NODE_ENV=development
        ```
5.  **Database Setup:**
      * `npx prisma migrate dev` to apply migrations.
      * `npm run db:seed` to seed initial data.
6.  **Running in Development:**
      * `npm run dev` starts the server with `nodemon` for automatic restarts on file changes.
7.  **Building for Production:**
      * `npm run build` compiles TypeScript to `dist/`.
8.  **Running in Production (Locally):**
      * `npm start` runs the compiled app from `dist/`.
9.  **Testing:**
      * `npm test`
      * `npm run test:watch`
      * `npm run test:coverage`
10.  **Code Quality:**
      * `npm run lint`
      * `npm run format`

### 16. Guidance for the LLM Coding Agent (Rules, Warnings, etc.)

  * **Understand the Core Stack:** Familiarize yourself deeply with Node.js, TypeScript, Express.js, Prisma, Nunjucks, and HTMX, as these are central to the project.
  * **Follow Existing Patterns:** When adding new features or modifying existing ones, observe and replicate the patterns used in controllers, services, DTOs, routes, and templates.
  * **Dependency Injection:** Leverage InversifyJS for managing dependencies. New services or controllers should be injectable and their types/bindings added to the respective configuration files.
  * **DTOs:** Use DTOs for transferring data between services and controllers/templates to maintain clear data contracts.
  * **Prisma Usage:** Utilize Prisma Client for all database interactions. Adhere to the schema and use Prisma's migration tools for any schema changes (`npx prisma migrate dev`).
  * **HTMX Interactions:** When creating new dynamic features, ensure controllers are set up to return appropriate HTML fragments and HTMX response headers.
  * **Templating:** Use Nunjucks for rendering. Create reusable components/macros in `src/templates/components/` where appropriate.
  * **Error Handling:** Ensure all controller actions properly catch errors from services and pass them to `next(error)` for the centralized error handler.
  * **Testing is Key:** Write tests (unit for services, integration for routes/controllers) for any new code. Refer to existing tests in the `/tests` directory for structure and mocking strategies.
  * **Caching:** Be mindful of the caching layer in `ToolServiceImpl`. When adding or modifying data that affects cached entities (like Tools or Tags), ensure the cache is appropriately invalidated (e.g., `this.cache.flushAll()` is called in `recordToolUsage`). Consider if new service methods require their own caching logic.
  * **Static Assets & CSS:** Static files are in `src/public/`. Custom CSS beyond Tailwind CSS should go into `src/public/css/main.css`.
  * **Linting and Formatting:** Always run `npm run lint` and `npm run format` before committing code to maintain consistency.
  * **Warnings:**
      * Do not reinvent existing components or utility functions without strong justification. Check `src/utils`, service layers, and Nunjucks `components/macros` first.
      * Ensure any new routes are added to the appropriate route setup file (e.g., `src/routes/toolNameRoutes.ts`) and registered in `src/app.ts`.
      * Be cautious when modifying Prisma schema (`prisma/schema.prisma`); always generate and apply migrations (`npx prisma migrate dev`).
      * **PostgreSQL Case Sensitivity:** When using `prisma.$queryRaw`, always quote identifiers (e.g., `FROM "Tool"` not `FROM Tool`) to match migration-created table names. Unquoted identifiers become lowercase and will cause "relation does not exist" errors.
      * When adding new dependencies, update `package.json` and run `npm install`. Ensure the `package-lock.json` is also updated and committed.
      * Avoid introducing libraries that significantly deviate from the existing technology stack unless discussed and approved.
  * **Database Migration Note:** The project was migrated from SQLite to PostgreSQL (see `migrate_to_postgresql.md` for details). All development and production environments now use PostgreSQL for better scalability and production readiness.