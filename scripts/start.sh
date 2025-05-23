#!/bin/sh

# Exit on any error
set -e

echo "Starting ToolChest application..."

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Check if migrations were successful
if [ $? -eq 0 ]; then
    echo "Migrations completed successfully"
else
    echo "Migration failed"
    exit 1
fi

# Seed the database with initial data
echo "Seeding database with initial data..."
npm run db:seed:prod

# Check if seeding was successful  
if [ $? -eq 0 ]; then
    echo "Database seeding completed successfully"
else
    echo "Database seeding failed, but continuing..."
fi

# Start the application
echo "Starting the server..."
npm start 