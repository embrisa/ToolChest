# 🚧 Plan: Removing `ToolUsage` Model & Raw-Event Logging

> **Status:** Approved – will be executed automatically by an AI coding agent (no manual intervention expected)

---

## 1. Overview

We no longer need per-event logging of tool executions. All business metrics can be served from the aggregated `ToolUsageStats` table. To reduce database size, simplify the codebase, and avoid unnecessary write-amplification we will **completely remove** the `ToolUsage` model (and its underlying Postgres table) from the project.

This document tracks every change required across schema, application code, tests, and deployment pipelines.

---

## 2. Rationale & Goals

| Goal | Why it matters |
|------|----------------|
| 🚀  Smaller DB & faster writes | The raw-event table grows unbounded; writes are heavy (triggering WAL, indexes). Dropping it reduces storage & I/O. |
| 🛠️  Simpler codebase | >25 files reference `ToolUsage`. Removing them reduces complexity and future maintenance work. |
| 🔒  Privacy | No per-request timestamps/metadata stored ⟶ less sensitive data retained. |
| 📊  Keep high-level stats | We still keep counters in `ToolUsageStats`, so leaderboards & featured-tool logic remain intact. |

Non-Goals:
• Keep detailed historic charts (day-by-day usage, recent activity feed).
• Migrate existing raw data elsewhere.

---

## 3. High-Level Impact Analysis

| Area | Impact | Action |
|------|--------|--------|
| Prisma schema | `ToolUsage` model & relation field on `Tool` must be removed | New migration `drop_tool_usage` |
| Backend services | ~25 references (`prisma.toolUsage.*`) across analytics & tool services | Replace / delete code |
| Admin analytics API | Some charts rely on raw events | Re-implement using stats-only data **or** delete the feature entirely |
| Tests & e2e helpers | Factory helpers & assertions create/use `ToolUsage` | Update or delete |
| Seed & DB cleaning scripts | Remove `toolUsage.deleteMany()` & seed inserts | Update scripts |
| CI pipeline | Fails until TypeScript errors fixed | Update code then green-run tests |
| Production DB | Table dropped – irreversible | Ensure backup; add rollback plan |

---

## 4. Detailed Step-by-Step Checklist

### 4.1 Prisma Schema & Migration

1. Delete the entire `model ToolUsage { … }` block.  
2. Remove the `usages ToolUsage[]` field from `model Tool`.  
3. Run `npx prisma migrate dev --name drop_tool_usage` locally → review generated SQL (`DROP TABLE "ToolUsage"`).  
4. Commit migration & regenerate client (`prisma generate`).

### 4.2 Application Code Changes

Below is an atomic, checkbox-style checklist for the AI agent.  
Mark each item ☑️ when complete (for human readers in PRs – the agent will just execute sequentially).

#### 4.2.1  Update `ToolService`

☐  Open `src/services/tools/toolService.ts`.  
☐  Locate `recordToolUsage()` (≈ line containing `prisma.toolUsageStats.upsert`).  
☐  Delete the entire `prisma.toolUsage.create({ … })` block.  
☐  Ensure the surrounding code (cache invalidation etc.) still compiles.  

#### 4.2.2  Purge `ToolUsage` from `AnalyticsService`

File: `src/services/admin/analyticsService.ts`

☐  Remove private helpers that query `prisma.toolUsage` (`getTotalUsageCount`, `getActiveUsersCount`, `getUsageTrend`, etc.).  
☐  Delete methods that are now meaningless (`generateUsageChart`, recent-activity logic, etc.).  
☐  Strip `prisma.toolUsage.findMany/count` calls in any remaining methods.  
☐  Re-compute high-level numbers (total usage, top tools) from `ToolUsageStats` instead: e.g. `usageCount: tool.toolUsageStats?.usageCount`.  
☐  Delete chart generation if it cannot be expressed via `ToolUsageStats`.

#### 4.2.3  Remove API routes that expose raw events

☐  Delete entire directories:
  * `src/app/api/admin/analytics/usage`  
  * `src/app/api/tools/[slug]/usage` (per-tool raw log feed)  
☐  Adjust any `index.ts` barrel files so imports don't break.

#### 4.2.4  Adjust admin dashboard front-end (if present)

☐  Search UI code for fetches to removed endpoints (`/api/admin/analytics/usage`, `/api/tools/*/usage`).  
☐  Remove components or replace with stats-based alternatives.  (If no such UI exists, skip.)

#### 4.2.5  Tests & E2E helpers

☐  Delete factories/helpers that create `ToolUsage` records (`tests/factories/toolUsageFactory.ts`, if present).  
☐  Search test files for `toolUsage` – replace with `toolUsageStats` where applicable.  
☐  Update `e2e/global-setup.ts` – remove `prisma.toolUsage.deleteMany()` calls.  
☐  Run `pnpm test` until TypeScript & Jest/ Vitest pass.

#### 4.2.6  Seed & Utility scripts

☐  In `prisma/seed.cjs` and `prisma/seed.ts` remove any `toolUsage` inserts or deletes.  
☐  Ensure seeding still completes without touching the dropped table.

#### 4.2.7  Remove GraphQL / Type definitions

☐  Delete `ToolUsage` interfaces from `src/types/**`.  
☐  Update any union / DTO types that referenced it.

#### 4.2.8  Grep clean-up

☐  Run `rg "toolUsage"` (case-insensitive) across the repo.  
☐  No matches outside migration history & this doc should remain.

> **Tip:** CI must compile without any implicit `any` or unused imports.

### 4.3 Deployment Steps

1. Merge to `main`.  
2. Railway / Fly deploy runs `prisma migrate deploy` which drops the table.  
3. No code paths reference it anymore ⟶ application starts cleanly.

### 4.4 Testing Strategy

1. **Unit tests** – run `pnpm test` locally; ensure 100 % pass rate.  
2. **E2E** – `pnpm e2e` after seeding; all public & admin flows must work.  
3. **Load test** – basic `k6` smoke script to hit record-usage endpoint; verify only `ToolUsageStats` updates.

### 5. Timeline & Responsibility

| Date | Owner | Task |
|------|-------|------|
| T0 (Day 0) | @dev-lead | Approve plan & create branch `feat/drop-tool-usage` |
| T0 + 1 d | @backend-dev | Complete schema migration & code refactor |
| T0 + 2 d | @qa | Run full regression tests |
| T0 + 3 d | @dev-lead | Merge & deploy |

## 6. Decisions (all confirmed)

* We will **not** maintain a recent-activity feed.
* Only lightweight historical analytics – daily aggregate counts – will be retained in `ToolUsageStats` (optional future cron job can snapshot counts if needed).
* Any admin analytics feature that can't work without raw events will be **removed** entirely rather than deprecated.

_This document reflects the final immutable plan for the AI agent to execute._ 