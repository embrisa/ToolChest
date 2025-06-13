#!/bin/sh

# Exit on any failure
set -e

echo "🚀 Starting tool-chest application..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    exit 1
fi

echo "🔄 Resolving database migrations..."
npx prisma migrate resolve --rolled-back 20250606164703_remove_old_text_fields

echo "🗄️ Running database migrations..."
npx prisma migrate deploy

echo "✅ Database migrations completed"

echo "🌱 Seeding database (if needed)..."
npx prisma db seed || echo "ℹ️ Database seed completed or skipped"

echo "🎯 Starting Next.js application..."
exec node server.js 