# ToolChest

## Project Overview
ToolChest is a web application providing free, high-quality utility tools with a focus on privacy, accessibility, and ease of use. This version is a migration from Kotlin/Ktor to TypeScript/Node.js with Express.js. The platform uses server-side rendering (SSR) with Nunjucks templates, HTMX for dynamic updates, and Tailwind CSS for modern, responsive design. The first tool implemented is a Base64 Encoder/Decoder for both text and files. More tools are planned and will be added incrementally.

## Features
- **Base64 Encoder/Decoder**: Encode/decode text and files to/from Base64, with URL-safe option and file download support.
- **Tag Filtering & Search**: Filter tools by tag and search for tools.
- **Error Handling**: Custom error pages for 400, 403, 404, and 500 errors, with HTMX-aware fragments for partial updates.
- **Responsive UI**: Mobile-friendly, accessible design using Tailwind CSS and Nunjucks macros/components.
- **SSR & HTMX**: All pages are server-rendered, with HTMX used for dynamic fragments.
- **No Authentication**: All tools are free to use, no registration required.
- **Testing**: Comprehensive test coverage for services, routes, and middleware.

## Project Structure
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
├── .env            # Environment variables (create this from .env.example if provided)
├── .eslintignore
├── .eslintrc.js
├── .gitignore
├── .prettierrc.js
├── Dockerfile      # For building containerized application
├── package.json    # Project dependencies and scripts
├── railway.json    # Configuration for Railway deployment
├── README.md       # This file
└── tsconfig.json   # TypeScript compiler options
```

## Technology Stack
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: Prisma (ORM), SQLite (default development DB)
- **Templating**: Nunjucks (SSR)
- **Frontend Interaction**: HTMX
- **Styling**: Tailwind CSS (via CDN), Font Awesome (via CDN)
- **Testing**: Jest, Supertest
- **DI**: InversifyJS
- **Logging**: Morgan

## Setup and Running Locally

### Prerequisites
- Node.js (e.g., v18, v20 or later)
- npm (comes with Node.js)

### Installation
1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd project-root
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    *   Create a `.env` file in the project root.
    *   A common variable is `DATABASE_URL`. For the default SQLite setup:
        ```
        DATABASE_URL="file:./prisma/toolchest.db"
        ```
    *   You might also need `PORT` (e.g., `PORT=8080`).

4.  Initialize and seed the database:
    *   Apply migrations:
        ```bash
        npx prisma migrate dev
        ```
    *   Seed initial data:
        ```bash
        npm run db:seed
        ```

### Running in Development Mode
```bash
npm run dev
```
This will start the server using `nodemon`, which automatically restarts on file changes. The application will typically be available at `http://localhost:8080` (or the port specified in your `.env` file).

### Building for Production
```bash
npm run build
```
This compiles TypeScript to JavaScript and outputs it to the `/dist` directory.

### Running in Production Mode (Locally)
After building the project:
```bash
npm start
```
This runs the compiled application from the `/dist` directory.

## Running Tests
- Run all tests:
  ```bash
  npm test
  ```
- Run tests in watch mode:
  ```bash
  npm run test:watch
  ```
- Generate test coverage report:
  ```bash
  npm run test:coverage
  ```

## Environment Variables
The application uses environment variables for configuration. Key variables include:
- `PORT`: The port the server will listen on (default: 8080).
- `DATABASE_URL`: The connection string for the database (e.g., `file:./prisma/toolchest.db` for SQLite).
- `NODE_ENV`: Set to `production` for production builds/deployments, `development` otherwise.

## Deployment
The project is configured for deployment using Docker and can be deployed to platforms like Railway.
- A `Dockerfile` is provided for building a container image.
- `railway.json` provides configuration for Railway deployment.
- The health check endpoint is `/health`.

## Code Quality
- **Linting**: ESLint is used for code linting. Run `npm run lint`.
- **Formatting**: Prettier is used for code formatting. Run `npm run format`.

## Error Handling
- Custom error pages are rendered for HTTP errors (400, 403, 404, 500).
- Error handling middleware distinguishes between regular requests and HTMX requests to provide appropriate responses.

## Contributing
(Placeholder for contribution guidelines)

## License
ISC (or specify your project's license)