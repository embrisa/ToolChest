#!/usr/bin/env node

/**
 * Test Database Setup Script
 * Sets up SQLite database for testing in cloud environments
 * Can be run by coding agents without manual intervention
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🧪 Setting up test database for coding agents...");

// Set environment variables for SQLite
process.env.DATABASE_PROVIDER = "sqlite";
process.env.DATABASE_URL = "file:./test.db";
process.env.NODE_ENV = "test";

try {
    // Clean up existing database
    const testDbPath = path.join(__dirname, "../test.db");
    if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
        console.log("✅ Cleaned up existing test database");
    }

    // Generate Prisma client for SQLite using test schema
    console.log("🔧 Generating Prisma client...");
    execSync("npx prisma generate --schema=prisma/schema.test.prisma", {
        stdio: "inherit",
        env: {
            ...process.env,
            DATABASE_URL: "file:./test.db",
        },
    });

    // Create database schema using test schema
    console.log("🗄️  Creating database schema...");
    execSync("npx prisma db push --force-reset --schema=prisma/schema.test.prisma", {
        stdio: "inherit",
        env: {
            ...process.env,
            DATABASE_URL: "file:./test.db",
        },
    });

    console.log("✅ Test database setup completed successfully!");
    console.log("🚀 Ready for testing with SQLite database");

} catch (error) {
    console.error("❌ Test database setup failed:", error.message);
    process.exit(1);
} 