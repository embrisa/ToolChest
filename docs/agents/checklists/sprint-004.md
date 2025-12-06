---
type: checklist
topic: Sprint-004 (proposed 2026-02-03 → 2026-02-14)
owner: <@agents>
last_updated: 2025-12-06
related: ["../../AGENTS.md", "../decisions/20251206-sprint-004-scope.md"]
---
Summary
- Two-week production-readiness sprint to finish metrics/performance budgets, workerize heavy flows, and close release/docs/test gates for existing tools without breaking privacy or accessibility.

Backlog focus (candidates)
- Metrics + budgets: ship `/api/tools/metrics` pipeline, sampling, and dashboards-ready payloads; finalize per-tool targets and alert thresholds.
- Workerization/resilience: workerize markdown-to-pdf and large format-converter paths with fallbacks; keep aria-live progress and 10MB cap enforcement consistent.
- UI kit and docs: finish `@/components/ui` audit (FileUpload, ToolPageTemplate, ImportPanel), document patterns in `DEVELOPER_CHEAT_SHEET.md`, and add missing tests.
- Offline/latency UX: cache safe assets/translations, improve loading/error states, and confirm graceful degradation without `DATABASE_URL`.
- Release gates: expand Playwright smokes + unit coverage for worker flows, keep `npm run validate` and `npm run qa:translations` green.

Checklist
- [ ] Confirm `.env.local` keys present and validated (`DATABASE_URL`, `ADMIN_SECRET_TOKEN`, `ADMIN_SESSION_SECRET`, `MAX_FILE_SIZE`=10MB, `LARGE_FILE_THRESHOLD`=5MB, optional `NEXT_PUBLIC_SITE_URL`); document sampling toggles for metrics if added.
- [ ] Finalize Sprint-004 scope, owners, and acceptance in `decisions/20251206-sprint-004-scope.md`.
- [ ] Implement `/api/tools/metrics` endpoint + Zod schema; wire client sampling (dev 100%, prod 10%) and dashboards-ready logs; avoid payload data.
- [ ] Set and publish per-tool performance/error budgets; add alerts/console warnings when budgets are exceeded; hook `useToolMetrics` to remaining tools.
- [ ] Workerize heavy paths (markdown-to-pdf, large format conversions) with fallbacks and progress aria-live; keep 10MB cap and >5MB progress UI consistent.
- [ ] Complete UI kit audit (FileUpload, ToolPageTemplate, ImportPanel, MultiSelect) for exports, aria/useId coverage, and docs; refresh `DEVELOPER_CHEAT_SHEET.md`.
- [ ] Add/refresh tests for workerized flows and metrics plumbing (unit + Playwright smokes); keep `npm run validate` passing.
- [ ] Run `npm run qa:translations` after copy changes; resolve failures or update allowlist.
- [ ] Update docs/agents outputs and close sign-off checklist at sprint end.

Next steps
- Finish metrics endpoint + sampling; define budgets per tool and bake them into docs.
- Workerize markdown-to-pdf/format-converter heavy paths with fallbacks; add tests and progress UX.
- Complete UI kit + docs refresh and run validation + translation QA before sign-off.

