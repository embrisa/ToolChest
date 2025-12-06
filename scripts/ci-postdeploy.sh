#!/bin/sh

# CI post-deploy step: run migrations then seed.
# Requires DATABASE_URL to be set in the environment.

set -euo pipefail

echo "🔧 CI post-deploy: running prisma migrate deploy..."
npx prisma migrate deploy

echo "🌱 CI post-deploy: running prisma db seed..."
npx prisma db seed

echo "✅ CI post-deploy complete."

