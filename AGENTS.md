# AGENTS Guide (tool-chest)

Purpose: fast, consistent onboarding and execution for coding agents working in this repo.

## Documentation system for agents
- Canonical set
  - `AGENTS.md` (this file): start here.
  - Core references: `DESIGN_PHILOSOPHY.md`, `DEVELOPER_CHEAT_SHEET.md`, `TESTING.md`, `docs/*.md`, `README.md`.
  - Source-of-truth configs: `next.config.ts`, `tailwind.config.js`, `prisma/schema.prisma`, `src/app/layout.tsx`.
- Doc types (create under `docs/agents/` when needed)
  - Playbooks: `docs/agents/playbooks/<topic>.md` (task how-tos).
  - Decisions: `docs/agents/decisions/YYYYMMDD-<topic>.md` (why we chose X).
  - Checklists: `docs/agents/checklists/<area>.md` (release, migration, translation).
  - Runbooks: `docs/agents/runbooks/<service>.md` (repeatable ops).
- Minimal template
  ```
  ---
  type: playbook
  topic: <topic>
  owner: <@handle>
  last_updated: YYYY-MM-DD
  related: [links]
  ---
  Summary
  Steps:
  1) ...
  2) ...
  Pitfalls:
  - ...
  ```
- Maintenance rules: keep ≤1 screen per doc, link to sources instead of duplicating, update `last_updated` when touched, prefer adding a playbook over inlining long sections here.

## First 30 minutes checklist
- Skim this file, `DEVELOPER_CHEAT_SHEET.md`, and `DESIGN_PHILOSOPHY.md`.
- Confirm `.env.local` (copy from `env.example` if missing): `DATABASE_URL`, `ADMIN_SECRET_TOKEN`, optional `NEXT_PUBLIC_SITE_URL`.
- Run `npm run setup` (installs, generates, validates) if the workspace is fresh.
- Open `src/app/page.tsx` and one tool page under `src/app/[locale]/tools/` to see patterns.

## Project essentials
- Stack: Next.js 15 App Router, React 19, TypeScript strict, Tailwind CSS, Prisma + PostgreSQL (SQLite for tests).
- Structure: `src/app` (routes/api), `src/components` (UI/layout/tools/admin), `src/{hooks,services,utils,types}` for logic, `messages/` for i18n JSON.
- Commands: `npm run dev`, `npm run format`, `npm run lint:fix`, `npm run validate`, `npm run type-check`, `npm run qa:translations`, `npm test`, `npm run test:e2e`, `npm run db:generate`, `npm run db:migrate`, `npm run db:deploy`.

## Non-negotiables
- Privacy: client-side processing by default; respect 10MB max file size and show progress for 5MB+.
- Accessibility: WCAG 2.1 AA+, use `useId()` for generated IDs, ensure ARIA labels/roles, and keep contrast high (light-only design).
- Error handling: wrap tools in `<ErrorBoundary>`; prefer client-safe wrappers for hydration (`<ClientOnlyTool>` when applicable).
- Imports: always use `@/` aliases; no relative traversals across domains.
- API: admin routes under `/api/admin/*` require token; validate with Zod; keep tool routes under `/api/tools/*`.
- Do not add server-dependent features that break offline/client-side guarantees.

## Working workflow (agents)
- Intake: restate the task, identify impacted areas, check existing playbooks/decisions.
- Plan: list tasks, create/update TODOs, decide what to read, and gather files before editing.
- Build: small, typed components; reuse `@/components/ui` patterns; keep changes privacy- and a11y-safe.
- Validate: at minimum run `npm run validate` before commit; for UI-heavy work run `npm run test:e2e` or focused tests; run `npm run qa:translations` if touching `messages/`.
- Deliver: summarize changes, note tests run, call out risks/todos; never revert user changes you didn’t make.

## Code & UI patterns to reuse
- Tool pages: use `ToolPageTemplate` + `ToolHeader` + `ImportPanel` + `ResultsPanel` + `CopyExportBar`; wrap with `<ErrorBoundary>`.
- IDs: `useId()` for any generated `id/aria` attributes to avoid hydration mismatches.
- Forms/files: enforce 10MB limit, show progress after 5MB, prefer client parsing; add validation + ARIA states.
- Styling: follow light-mode tokens in `DESIGN_PHILOSOPHY.md`; spacing on 8px grid; keep contrast as documented.
- Components live in `@/components/{ui,layout,tools,admin}`; share logic in hooks/services rather than duplicating.

## i18n & content
- Uses next-intl with 16 locales; translation files in `messages/`.
- Add new keys to `messages/...` for every locale; keep key casing consistent.
- Run `npm run qa:translations` after touching copy; avoid hard-coded strings in components.

## Data, services, and API
- Prisma schema: `prisma/schema.prisma`; SQLite schemas for tests in `prisma/schema.test.prisma`.
- Seeds: `prisma/seed.ts`; test DBs in `prisma/test*.db`.
- Admin token: `ADMIN_SECRET_TOKEN` (keep out of logs); no user accounts currently.
- Service pattern: extend `BaseService`/`ToolService` in `src/services`; keep operations client-first with server fallback only when necessary.

## Testing & QA quick refs
- Unit/integration: `npm test` or `npm run test:quick` (SQLite).
- Coverage: `npm run test:coverage`.
- E2E: `npm run test:e2e` (Playwright; see `e2e/` POMs).
- Accessibility: `npm run test:a11y` plus jest-axe in component tests.
- Validation gate: `npm run validate` before commit; formatting via `npm run format`.

## Design & accessibility anchors
- Light-mode only; follow tokens in `DESIGN_PHILOSOPHY.md`.
- Use `@/components/ui/Alert`, `Toast`, `Loading`, `ProgressIndicator`, `AriaLiveRegion` for state/feedback.
- Keep focus states obvious; ensure keyboard-only paths; add `aria-live` where results update.

## Updating this system
- Add playbooks/decisions/checklists under `docs/agents/` as described.
- Keep this file short and evergreen; link to specialized docs instead of expanding it.
- When adding new patterns or rules, update both the relevant playbook and this file’s pointers.
