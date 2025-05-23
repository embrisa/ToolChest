# ToolChest: SQLite to PostgreSQL Migration Plan (Simplified)

## 📋 Executive Summary

This document outlines a simplified plan to migrate the ToolChest project from SQLite to PostgreSQL. Since you're early in development with no production data or users, we'll focus on a straightforward migration approach.

## 🎯 Migration Goals

- **Simple setup**: Get PostgreSQL running quickly on Railway
- **Clean migration**: Start fresh with PostgreSQL as the primary database
- **Learning-focused**: Understand the process for future reference
- **Development-ready**: Establish PostgreSQL for continued development

## 🔍 Current State Analysis

### Database Schema Overview
- **SQLite Database**: Single file-based database (`toolchest.db`)
- **Tables**: Tool, Tag, ToolTag (junction), ToolUsageStats
- **Data Types**: Uses SQLite-specific types (TEXT, INTEGER, BOOLEAN, DATETIME)
- **Relationships**: Many-to-many between Tools and Tags, one-to-one for usage stats
- **Primary Keys**: CUID strings for all entities
- **Constraints**: Unique constraints on names and slugs

### Current Migration System
- **Migration Framework**: Prisma Migrate
- **Migration History**: Single initial migration (`20250510123258_initial_schema`)
- **Schema Management**: Prisma schema defines the database structure
- **Environment**: Development uses SQLite, production deployment ready for Railway

## 🏗️ Technical Migration Strategy

### Phase 1: Database Type Compatibility Analysis

#### SQLite to PostgreSQL Data Type Mapping
| SQLite Type | PostgreSQL Type | Migration Notes |
|-------------|----------------|-----------------|
| TEXT | VARCHAR/TEXT | Direct mapping |
| INTEGER | INTEGER | Direct mapping |
| BOOLEAN | BOOLEAN | Direct mapping |
| DATETIME | TIMESTAMP | Requires format conversion |
| BLOB | BYTEA | Not used in current schema |

#### Prisma Schema Changes Required
1. **Provider Change**: `sqlite` → `postgresql`
2. **Connection URL**: File-based → TCP connection string
3. **Binary Targets**: Update for PostgreSQL compatibility
4. **Data Type Adjustments**: Minimal (Prisma handles most conversions)

### Phase 2: Environment Setup and Testing

#### Development Environment Setup
1. **PostgreSQL Installation**
   - Local PostgreSQL instance for development
   - Docker container for consistent environments
   - Connection pooling configuration

2. **Database Configuration**
   - Database creation and user setup
   - Connection string configuration
   - Performance tuning for development

#### Testing Infrastructure
1. **Data Migration Testing**
   - Export SQLite data to CSV/JSON
   - Import scripts for PostgreSQL
   - Data integrity verification scripts

2. **Application Testing**
   - Full test suite execution against PostgreSQL
   - Performance benchmarking
   - CRUD operation validation

### Phase 3: Migration Execution Strategy

#### Blue-Green Deployment Approach
1. **Blue Environment** (Current): SQLite-based production
2. **Green Environment** (New): PostgreSQL-based staging
3. **Traffic Switch**: DNS/load balancer redirect
4. **Rollback Plan**: Quick switch back to blue if needed

#### Data Migration Process
1. **Schema Migration**
   - Create new PostgreSQL migration
   - Apply schema to PostgreSQL database
   - Validate schema integrity

2. **Data Transfer**
   - Export SQLite data using Prisma
   - Transform data format if needed
   - Import data to PostgreSQL
   - Verify data integrity and relationships

3. **Application Configuration**
   - Update DATABASE_URL environment variable
   - Deploy new application version
   - Verify all functionality

## 🚀 Step-by-Step Railway PostgreSQL Setup

### Step 1: Create PostgreSQL Database on Railway

1. **Log into Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with your GitHub account (if not already logged in)

2. **Access Your Project**
   - Go to your ToolChest project dashboard
   - If you don't have the project on Railway yet, click "New Project" → "Deploy from GitHub repo" → Select your ToolChest repository

3. **Add PostgreSQL Database**
   - In your project dashboard, click the **"+ New"** button
   - Select **"Database"**
   - Choose **"PostgreSQL"**
   - Railway will automatically provision a PostgreSQL database

4. **Get Database Connection Details**
   - Click on your newly created PostgreSQL service
   - Go to the **"Connect"** tab
   - Copy the **"Postgres Connection URL"** (it will look like: `postgresql://postgres:password@host:port/database`)

### Step 2: Update Local Development Environment

1. **Install PostgreSQL locally** (for development):
   ```bash
   # On macOS with Homebrew
   brew install postgresql
   brew services start postgresql
   
   # Create a local database
   createdb toolchest_dev
   ```

2. **Update your `.env` file**:
   ```bash
   # Replace your current DATABASE_URL with:
   # For local development
   DATABASE_URL="postgresql://your-username@localhost:5432/toolchest_dev"
   
   # For production (use the Railway connection string)
   # DATABASE_URL="postgresql://postgres:password@host:port/database"
   ```

### Step 3: Simple Migration Process

#### Part A: Update Prisma Schema
1. **Update `prisma/schema.prisma`**:
   ```prisma
   // Change this line:
   provider = "sqlite"
   // To this:
   provider = "postgresql"
   ```

2. **Update your Railway environment variables**:
   - In Railway, go to your main application service
   - Click on **"Variables"** tab
   - Add/update: `DATABASE_URL` with the PostgreSQL connection string from Step 1

#### Part B: Create New Migration
1. **Reset migration history** (since you have no production data):
   ```bash
   # Remove existing migrations
   rm -rf prisma/migrations
   
   # Create fresh PostgreSQL migration
   npx prisma migrate dev --name initial_postgresql
   ```

2. **Deploy to Railway**:
   ```bash
   # Commit your changes
   git add .
   git commit -m "Migrate from SQLite to PostgreSQL"
   git push
   
   # Railway will automatically deploy
   ```

#### Part C: Verify Everything Works
1. **Test locally**:
   ```bash
   npm run dev
   # Visit http://localhost:8080 and test your Base64 tool
   ```

2. **Test on Railway**:
   - Wait for deployment to complete
   - Visit your Railway app URL
   - Test the Base64 encoder/decoder functionality

## 📋 Complete Checklist (Simplified)

### Local Development Setup
- [ ] Install PostgreSQL locally
- [ ] Create local development database
- [ ] Update `.env` file with local PostgreSQL URL

### Railway Setup
- [ ] Add PostgreSQL database to Railway project
- [ ] Copy PostgreSQL connection URL
- [ ] Add DATABASE_URL environment variable to Railway app

### Code Changes
- [ ] Update `prisma/schema.prisma` provider to "postgresql"
- [ ] Remove old SQLite migrations: `rm -rf prisma/migrations`
- [ ] Create new PostgreSQL migration: `npx prisma migrate dev --name initial_postgresql`
- [ ] Test locally to ensure everything works

### Deployment
- [ ] Commit and push changes to GitHub
- [ ] Verify Railway deployment completes successfully
- [ ] Test live application functionality
- [ ] Run database seeding if needed: Configure Railway to run `npm run db:seed`

## 🔧 Technical Implementation Details

### Prisma Schema Updates

```prisma
// Before (SQLite)
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL") // e.g., file:./prisma/toolchest.db
}

// After (PostgreSQL)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // e.g., postgresql://user:pass@host:5432/db
}

generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

### Simple Migration Commands

```bash
# 1. Remove old SQLite migrations (since no production data to preserve)
rm -rf prisma/migrations

# 2. Create fresh PostgreSQL migration
npx prisma migrate dev --name initial_postgresql

# 3. If you need to reset and start over:
npx prisma migrate reset
```

### Useful Railway Commands

```bash
# Install Railway CLI (optional, for easier management)
npm install -g @railway/cli

# Login to Railway
railway login

# Link your project
railway link

# View logs
railway logs

# Run commands in Railway environment
railway run npm run db:seed
```

### Environment Variables Update

```bash
# Development
DATABASE_URL="postgresql://username:password@localhost:5432/toolchest_dev"

# Production (Railway example)
DATABASE_URL="postgresql://username:password@production-host:5432/toolchest_prod"
```

## 🎯 Troubleshooting Common Issues

### If Migration Fails
```bash
# Reset everything and start over
npx prisma migrate reset
npx prisma migrate dev --name initial_postgresql
```

### If Railway Deployment Fails
1. Check Railway logs: Go to your app → "Deployments" → Click on failed deployment → View logs
2. Common issues:
   - Missing `DATABASE_URL` environment variable
   - Prisma client not regenerated after schema change
   - Build failure due to TypeScript errors

### If Database Connection Fails
1. Verify `DATABASE_URL` in Railway environment variables
2. Ensure PostgreSQL service is running on Railway
3. Check if connection URL is properly formatted

### Quick Fixes
```bash
# Regenerate Prisma client
npx prisma generate

# Apply pending migrations on Railway
railway run npx prisma migrate deploy

# Seed the database on Railway
railway run npm run db:seed
```

## 📋 What You'll Learn

This simplified migration will teach you:
- How to set up PostgreSQL on Railway
- How Prisma migrations work
- Basic database management
- Railway deployment process
- Environment variable configuration

## 🎯 Next Steps After Migration

Once you've successfully migrated to PostgreSQL:

1. **Test Everything**: Make sure all your tools work correctly
2. **Add Sample Data**: Run your seed script to populate the database
3. **Monitor Performance**: PostgreSQL should perform similarly or better than SQLite
4. **Learn PostgreSQL**: Start learning PostgreSQL-specific features for future development

## 🤝 Getting Help

If you run into issues:
1. Check Railway documentation: [docs.railway.app](https://docs.railway.app)
2. Check Prisma documentation: [prisma.io/docs](https://prisma.io/docs)
3. Railway Discord: [railway.app/discord](https://railway.app/discord)
4. The error messages are usually quite helpful - read them carefully!

---

**Ready to Start?** Follow the step-by-step guide above, and you'll have PostgreSQL running in about 30 minutes!
