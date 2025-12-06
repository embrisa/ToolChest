---
type: checklist
topic: Sprint-001 (2025-12-08 → 2025-12-19)
owner: <@agents>
last_updated: 2025-12-06
related: ["../../AGENTS.md", "../decisions/20251206-sprint-001-scope.md"]
---
Summary
- Two-week stabilization sprint to harden privacy-first UX, localization quality, and regression coverage.

Backlog focus (candidates)
- Translation parity: fix missing keys, run `npm run qa:translations`, update allowlist if needed.
- Tool UX polish: ensure `<ErrorBoundary>` + `useId()` adoption, progress states for >5MB operations, enforce 10MB cap messaging.
- A11y/ARIA: add `aria-live` to result updates, validate form control labels.
- Regression coverage: add/refresh Playwright smokes for base64, hash, markdown-to-pdf; keep `npm run validate` green.
- Admin upkeep: tag/tool CRUD smoke tests; verify admin token enforcement on `/api/admin/*`.

Checklist
- [ ] Confirm `.env.local` present and valid (`DATABASE_URL`, `ADMIN_SECRET_TOKEN`, `NEXT_PUBLIC_SITE_URL`).
- [ ] Groom & point backlog items above; mark owners and acceptance.
- [ ] Align design with `DESIGN_PHILOSOPHY.md` (light-only tokens, spacing).
- [ ] Add/refresh tests per story (unit + e2e where applicable); keep `npm run validate` passing.
- [ ] Run `npm run qa:translations` after copy changes; address failures.
- [ ] Update docs/agents outputs if scope or decisions change.

