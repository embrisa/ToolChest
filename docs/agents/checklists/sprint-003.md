---
type: checklist
topic: Sprint-003 (proposed 2026-01-20 → 2026-01-31)
owner: <@agents>
last_updated: 2025-12-06
related: ["../../AGENTS.md", "../decisions/20251206-sprint-003-scope.md"]
---
Summary
- Two-week resilience and performance sprint to harden existing tools (base64, hash, favicon, markdown-to-pdf, format-converter, jwt-decoder) with budgets, observability, and offline-friendly UX.

Backlog focus (candidates)
- Performance budgets: set render/interaction budgets for tool pages; offload heavy transforms (PDF/gen/conversions) to web workers where needed.
- Resilience: graceful degradation when `DATABASE_URL` missing; clearer fallbacks for static data; explicit 10MB enforcement copy.
- Observability: add lightweight client metrics (latency, errors) and aria-live for progress; improve admin analytics surfacing.
- Offline/latency UX: cache translation bundles; prefetch icons/assets; tighten loading and error states.
- Test hardening: add Playwright smokes for new tools; tighten unit coverage around parsing/decoding edge cases.

Checklist
- [ ] Confirm `.env.local` values (`DATABASE_URL`, `ADMIN_SECRET_TOKEN`, `NEXT_PUBLIC_SITE_URL`) for perf/analytics paths.
- [ ] Finalize Sprint-003 scope, owners, and acceptance in `decisions/20251206-sprint-003-scope.md`.
- [ ] Define performance/error budgets per tool (render <1.5s on cold load, action <800ms where feasible) and instrument to track.
- [ ] Add/verify 10MB cap and >5MB progress messaging across tools; ensure `<ErrorBoundary>` coverage.
- [ ] Add or update tests (unit + Playwright smokes) for workerized flows and error cases; keep `npm run validate` passing.
- [ ] Run `npm run qa:translations` after copy changes; resolve failures or update allowlist.
- [ ] Update docs/agents outputs and close sign-off checklist at sprint end.

