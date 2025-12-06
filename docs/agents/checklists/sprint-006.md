---
type: checklist
topic: Sprint-006 (proposed 2026-03-03 → 2026-03-14)
owner: <@agents>
last_updated: 2025-12-06
related: ["../../AGENTS.md", "../decisions/20251206-sprint-006-scope.md", "../decisions/20251206-sprint-005-scope.md"]
---
Summary
- Release-hardening sprint to graduate offline caching, finalize worker fallbacks/timeouts, refine metrics digest/budgets, and lock QA/a11y gates without expanding scope.

Backlog focus (candidates)
- Offline/caching GA: safe assets/locales cache, cancel/progress UX for >5MB, graceful degradation without `DATABASE_URL`.
- Metrics & budgets: digest error buckets + sampling info; budget warnings (dev console/toast flag); keep schema payload-free.
- Worker/perf: markdown-to-pdf + format-converter fallbacks/timeouts; bundle/render/action budget checks for top tools.
- QA/a11y: Playwright smokes for worker/offline/digest; a11y sweep on affected pages; translation QA for new copy.

Checklist
- [ ] Confirm `.env.local` keys present (`DATABASE_URL`, `ADMIN_SECRET_TOKEN`, `ADMIN_SESSION_SECRET`, `MAX_FILE_SIZE`=10MB, `LARGE_FILE_THRESHOLD`=5MB, `TOOL_METRICS_SAMPLE_RATE`, optional `NEXT_PUBLIC_SITE_URL`; offline/metrics flags if added).
- [ ] Finalize Sprint-006 scope, owners, and acceptance in `decisions/20251206-sprint-006-scope.md`.
- [ ] Offline/caching GA: safe cache list + TTLs; cancel/progress UX for >5MB; degrade gracefully without DB.
- [ ] Metrics: digest shows counts/error buckets/sampling; enforce server sampling; add budget breach warnings (dev) with optional toast flag.
- [ ] Worker/perf: ensure worker fallbacks + 15s timeout; keep 10MB cap; add bundle/render/action budget checks for top tools.
- [ ] Translation QA: run `npm run qa:translations`; backfill keys for digest/offline UX; remove new hard-coded strings.
- [ ] Tests/validation: Playwright smokes for worker/offline/digest; a11y sweep on touched pages; keep `npm run validate` green.
- [ ] Update docs/agents outputs and close sign-off checklist at sprint end.

Next steps
- Lock scope/owners, then implement offline GA + budgeted worker/perf fixes.
- Wire digest + budget warnings and land QA/a11y coverage.
- Run validation + translation QA before sign-off.

