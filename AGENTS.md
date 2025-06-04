# ToolChest Contributor Guide

## Repo orientation
- **Framework**: Next.js 14 with TypeScript
- **Database**: PostgreSQL accessed via Prisma (`prisma/` folder)
- **App code**: `src/app`, components in `src/components`, helpers in `src/{hooks,services,utils,types}`
- **Testing**: Jest/React Testing Library (`tests`), Playwright (`e2e`)

## Quick setup
1. `npm run env:setup` → copies `env.example` to `.env.local`.
2. Edit `.env.local` and provide a PostgreSQL `DATABASE_URL`.
3. `npm run setup` to install packages, generate Prisma client and validate env.
4. Start development with `npm run dev`.

Run `npm run env:validate` whenever you modify `.env.local`.

## Development notes
- Use the `@/` alias for internal imports and keep code in TypeScript.
- Wrap pages with `ErrorBoundary` and keep components accessible.
- Format code with `npm run format`; lint and type-check using `npm run validate`.

## Testing commands
- `npm test` – Jest unit/integration tests.
- `npm run test:e2e` – Playwright end‑to‑end tests.
- `npm run test:a11y` – accessibility checks.
- `npm run test:coverage` – coverage report.

## Database utilities
- `npm run db:migrate` – run migrations in development.
- `npm run db:seed` – seed local data.

## Pull requests
- Use clear commit messages and PR titles.
- Ensure linting, type checks and tests succeed before opening a PR.
- Document new environment variables or scripts in the README.

Refer to `DESIGN_PHILOSOPHY.md`, `DEVELOPER_CHEAT_SHEET.md`, `TESTING_FOR_AGENTS.md` and `TESTING.md` for more guidance.
