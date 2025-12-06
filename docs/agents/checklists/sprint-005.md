---
type: checklist
topic: Sprint-005 (proposed 2026-02-17 → 2026-02-28)
owner: <@agents>
last_updated: 2025-12-06
related: ["../../AGENTS.md", "../decisions/20251206-sprint-005-scope.md", "../decisions/20251206-sprint-004-scope.md"]
---
Summary
- Two-week stability sprint to harden workerized flows, offline/caching, metrics sampling, and translation quality without expanding scope or breaking privacy/a11y.

Backlog focus (candidates)
- Metrics & visibility: enforce server-side sampling and schema (require `sampleId`); add admin-only metrics digest (counts + error buckets, no payloads).
- Workerization resilience: finalize markdown-to-pdf/format-converter fallbacks, timeouts, and user recovery prompts; keep aria-live and 10MB cap consistent.
- Offline & caching: cache safe assets/locales for offline; add cancellation/progress for >5MB reads via shared UI components.
- i18n/content: complete translation QA; backfill keys for metrics/offline/worker UX; remove hard-coded strings where touched.
- QA gates: Playwright smokes for worker + offline cache paths; keep `npm run validate` and `npm run qa:translations` green.

Checklist
- [ ] Confirm `.env.local` keys present and validated (`DATABASE_URL`, `ADMIN_SECRET_TOKEN`, `ADMIN_SESSION_SECRET`, `MAX_FILE_SIZE`=10MB, `LARGE_FILE_THRESHOLD`=5MB, optional `NEXT_PUBLIC_SITE_URL`; metrics sampling flags if added).
- [ ] Finalize Sprint-005 scope, owners, and acceptance in `decisions/20251206-sprint-005-scope.md`.
- [ ] Enforce metrics schema + sampling server-side; reject missing/invalid `sampleId`; add dev budget warnings and optional debug toast flag.
- [ ] Add admin-only metrics digest (counts/error buckets only, no payloads) behind token; document env flags.
- [ ] Harden workerized flows: markdown-to-pdf and format-converter fallbacks, timeouts, aria-live progress, and 10MB cap; add user-facing recovery prompts.
- [ ] Offline/caching: cache safe assets/locales; ensure graceful degradation without `DATABASE_URL`; add cancel/progress UX for >5MB reads via shared UI kit.
- [ ] Translation QA: run `npm run qa:translations`, fill missing keys for metrics/offline/worker UX; eliminate new hard-coded strings.
- [ ] Tests/validation: add unit + Playwright smoke coverage for worker + offline paths; keep `npm run validate` passing.
- [ ] Update docs/agents outputs and close sign-off checklist at sprint end.

Next steps
- Enforce metrics sampling/schema and wire admin digest.
- Ship worker/offline hardening with shared progress/cancel UX.
- Complete translation QA and validation gates before sign-off.

