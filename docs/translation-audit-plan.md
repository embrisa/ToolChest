# Translation Audit & Remediation Plan

This document proposes a **multi-phase strategy** for systematically detecting, validating and fixing translation issues in the _tool-chest_ code-base. The goal is to guarantee **100 % translation coverage** for every string rendered in the application and to prevent regressions over time.

---

## Phase 0 – Baseline & Tooling

1. **Confirm translation status**  
   • Run `npm run qa:translations` and record current metrics (missing keys, unused keys, per-locale coverage).  
   • Generate a _baseline report_ that will act as the "zero" reference for future comparisons.
2. **Upgrade/Install helper packages**  
   • `@formatjs/cli` – extraction utilities.  
   • `eslint-plugin-formatjs` – lints hard-coded strings.  
   • `next-intl` ≥ 3.4 – latest missing-key handling callbacks.
3. **Script boilerplate**  
   • Add `scripts/i18n` directory with Node scripts for extraction, diffing, and report generation.

---

## Phase 1 – Static Code Sweep

Goal: find **compile-time** issues before the code even runs.

| Check | Description | Suggested Implementation |
|-------|-------------|---------------------------|
| **Missing `t()` calls** | Components containing plain text instead of `useTranslations()` keys | AST based scan using `ts-morph` or ESLint rule |
| **Dynamic keys** | `t(dynamicVar)` hides missing keys from static analysis | ESLint rule to ban non-literal keys, or require explicit whitelist |
| **Unused messages** | Keys that exist in locale files but are never imported | Diff extraction list ↔ messages directory |
| **Pluralisation gaps** | ICU plural/ordinal patterns missing variants | `@formatjs/cli verify` |

Deliverable: `reports/static-analysis-YYYY-MM-DD.json` with counts & offending file locations.

---

## Phase 2 – Runtime Instrumentation

1. **Custom `onError` hook** in `NextIntlClientProvider` to capture events when a key is not found.  
   – Log to `console.error` locally.  
   – In production, send to Sentry → `i18n.missing-key` issue.
2. **Visual fallback marker** (e.g. wrap missing string in `⧗` … `⧗`) to make gaps obvious during QA.
3. **Integration test spies**: Jest spy on the provider's `onError` to fail tests if any missing keys slip through component tests.

---

## Phase 3 – Automated UI Crawling (E2E)

1. **Playwright crawler**
   • Start the dev server.  
   • Iterate over the page map derived from `src/app/[locale]/**/*` routes.  
   • For each locale, navigate and capture console errors → flag missing keys.
2. **Screenshot diffing (optional)**
   • Highlight fallback markers visually.  
   • Fail CI if marker count > 0.

Deliverable: `reports/e2e-missing-keys-<commit>.html` dashboard with page/locale matrix.

---

## Phase 4 – CI Quality Gates

Add to `npm run validate` and the GitHub workflow:

- `i18n:static` – runs Phase 1 checks; threshold **0 missing, 0 dynamic**.  
- `i18n:e2e` – runs crawler on PR head SHA; must report **0 missing**.  
- Pull-request bot posts a summarised comment (✅ pass / ❌ fail with diff).

Merges are blocked until both gates are green.

---

## Phase 5 – Continuous Monitoring

1. **Sentry alert** if production missing-key events >  5 per hour.  
2. **Grafana dashboard** (or Vercel analytics) tracking per-locale coverage over time.  
3. Quarterly audit task in the engineering Jira board.

---

## Phase 6 – Manual UI Review (Spot-checks)

While automation catches 95 %, human review ensures contextual accuracy:

- **Accessibility review**: screen-reader output for translated ARIA labels.  
- **RTL locales** (ar, he, fa) layout sanity.  
- **Copy-writing review** by native speakers.

---

## Milestones & Timeline

| Week | Milestone |
|------|-----------|
| 1 | Complete Phase 0 & Phase 1 tooling; commit baseline report |
| 2 | Integrate runtime instrumentation (Phase 2) |
| 3 | Implement Playwright crawler; run on staging (Phase 3) |
| 4 | Enforce CI gates (Phase 4); fix all blocking issues |
| 5 | Activate Sentry alerts & dashboards (Phase 5) |
| 6 | First manual review round (Phase 6) |

---

## Success Criteria

✅ **Zero missing translation keys** across all 16 locales (CI enforced).  
✅ **No hard-coded strings** in React components (ESLint enforced).  
✅ **Runtime alerts** for any future regressions with <10 min detection time.  
✅ **Documentation** updated with contributor guidelines for adding translations.

---

_End of plan_ 