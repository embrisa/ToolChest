# ToolChest AI Agent Guide

## Project Summary

**tool-chest** is a privacy-focused web application providing essential computer tools (Base64 encoding, hash generation, favicon creation, Markdown to PDF conversion, etc.). All tool processing happens client-side in the browser to ensure user data privacy. The app features a modern light-mode design, supports 16 languages, and includes an admin system for managing tools and tags. Built for accessibility (WCAG 2.1 AA) and performance optimization.

## Architecture

- **Framework**: Next.js 15 + TypeScript + App Router
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS + Custom Design System
- **Testing**: Jest + React Testing Library + Playwright
- **Structure**: `src/app/` (routes), `src/components/` (UI), `src/{hooks,services,utils,types}/` (logic)

## Essential Commands

### Setup

```bash
npm run env:setup     # Copy env.example → .env.local
npm run setup         # Install + generate + validate
npm run dev           # Development server
```

### Development

```bash
npm run format        # Format with Prettier
npm run lint:fix      # Auto-fix linting issues
npm run qa:translations # Check translation file consistency and validity
npm run validate      # Lint + type-check + format-check
npm run type-check    # TypeScript validation only
```

### Testing

```bash
npm test              # Unit tests
npm run test:coverage # Coverage report
npm run test:e2e      # Playwright E2E
npm run test:a11y     # Accessibility tests
npm run test:quick    # Fast SQLite tests
```

### Database

```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run migrations (dev)
npm run db:deploy     # Deploy migrations (prod)
npm run db:seed       # Seed database
```

### Validation & CI

```bash
npm run test:all      # Full validation suite
npm run validate:build # Build validation
npm run validate:types # TypeScript errors
npm run validate:lint # Lint with JSON output
npm run validate:tests # Test coverage validation
```

## Key Patterns

### Imports

- Use `@/` prefix: `@/components/ui`, `@/services/tools`
- TypeScript strict mode enabled

### Components

- Wrap tools in `<ErrorBoundary>`
- Use `useId()` for generated IDs (prevents hydration issues)
- All components must be accessible (WCAG 2.1 AA)

### API Routes

- Admin routes: `/api/admin/*` (protected)
- Public routes: `/api/tools/*`, `/api/health`
- Use Zod for validation

### File Processing

- Client-side first (privacy)
- 5MB+ files show progress
- 10MB max file size

## Environment

Required in `.env.local`:

```
DATABASE_URL="postgresql://..."
ADMIN_SECRET_TOKEN="secure-token"
```

## Quality Gates

Before commits: `npm run validate` must pass

- Linting + TypeScript + formatting
- Please run `npm run format` to auto format all code in the project, very encouraged to use!
- Use `npm run env:validate` after env changes

## Reference Docs

- `DESIGN_PHILOSOPHY.md` - Design system & patterns
- `DEVELOPER_CHEAT_SHEET.md` - Detailed technical reference
- `TESTING.md` - Testing guidelines
