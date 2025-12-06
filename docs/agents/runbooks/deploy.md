---
type: runbook
topic: deploy
owner: <@agents>
last_updated: 2025-12-06
related: ["../../AGENTS.md"]
---
Summary
- Use the Docker image entrypoint to run migrations + seed automatically on start. A pipeline hook can call `npm run deploy:prod` for non-Docker deployments.

Steps
1) Ensure env set: `DATABASE_URL`, `ADMIN_SECRET_TOKEN`; optional `SKIP_SEED=true` to skip seeding.
2) Build/publish image (Railway uses `Dockerfile`).
3) Startup runs `prisma migrate deploy` then `prisma db seed` via `scripts/docker-entrypoint.sh` (fails fast on errors).
4) For non-Docker pipelines, run `npm run deploy:prod` after build to apply migrations + seed.
5) Verify health at `/api/health`; rollback if migrations/seeds fail.

Pitfalls
- Missing `DATABASE_URL` or Prisma permissions will fail startup.
- Seed is idempotent but still requires connectivity; set `SKIP_SEED=true` if you must bring app up without seeding.
- Keep `prisma/seed.ts` in sync with new tools/tags before deploy.

