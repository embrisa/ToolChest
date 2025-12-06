#!/bin/sh

# Exit on any failure
set -e

echo "🚀 Starting tool-chest application..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    exit 1
fi

echo "🗄️ Running database migrations..."
npx prisma migrate deploy

echo "✅ Database migrations completed"

if [ "${SKIP_SEED}" = "true" ]; then
    echo "⏭️  SKIP_SEED=true, skipping database seed."
else
    echo "🌱 Seeding database..."
    npx prisma db seed
    echo "✅ Database seed completed"
fi

echo "🎯 Starting Next.js application..."
exec node server.js 