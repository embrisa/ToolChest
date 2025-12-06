---
type: checklist
topic: Sprint-002 (proposed 2026-01-06 → 2026-01-17)
owner: <@agents>
last_updated: 2025-12-06
related: ["../../AGENTS.md", "../decisions/20251206-sprint-002-scope.md"]
---
Summary
- Two-week feature sprint to ship the next set of privacy-first tools while keeping localization, accessibility, and regression gates green.

Backlog focus (candidates)
- New tool delivery: pick 1-2 tools from backlog with client-side defaults, 10MB cap, progress UI for >5MB inputs, and `<ErrorBoundary>`/`useId()` coverage.
- UX/A11y polish: add `aria-live` to dynamic results, keep keyboard-only flows intact, and apply loading/error affordances per `DESIGN_PHILOSOPHY.md`.
- Localization parity: add keys for new surfaces; run `npm run qa:translations`, adjust allowlist only if needed.
- Regression coverage: expand unit + Playwright smokes for new tools and admin CRUD; keep `npm run validate` green.
- Observability/performance: instrument slow steps and prefer cache-safe helpers without breaking privacy or offline usage.

Checklist
- [ ] Confirm `.env.local` values (`DATABASE_URL`, `ADMIN_SECRET_TOKEN`, `NEXT_PUBLIC_SITE_URL`) valid for sprint.
- [ ] Finalize Sprint-002 scope, owners, and acceptance in `decisions/20251206-sprint-002-scope.md`.
- [ ] Groom and point prioritized backlog items; link design references and copy sources.
- [ ] Apply design tokens per `DESIGN_PHILOSOPHY.md`; ensure light-mode contrast and spacing.
- [ ] Enforce client-side processing defaults, 10MB cap, and progress feedback for >5MB payloads; guard with `<ErrorBoundary>`.
- [ ] Add/refresh tests per story (unit + Playwright smokes); keep `npm run validate` passing.
- [ ] Run `npm run qa:translations` after copy changes; resolve failures or update allowlist.
- [ ] Update docs/agents outputs and close sign-off checklist at sprint end.

