# Database Issue Debugging Documentation

## Problem Summary

**Error**: `PrismaClientKnownRequestError: Invalid 'prisma.$queryRaw()' invocation: Raw query failed. Code: '42P01'. Message: 'relation "tool" does not exist'`

**Environment**: Production (Railway deployment at https://www.tool-chest.com/)

**Status**: UNRESOLVED - Error persists after multiple fix attempts

**Latest Update**: CRITICAL DISCOVERY - Migration runs but reports "No pending migrations" while tables don't exist

## Error Details

### Stack Trace
```
Error fetching home page data: PrismaClientKnownRequestError: 
Invalid `prisma.$queryRaw()` invocation:
Raw query failed. Code: `42P01`. Message: `relation "tool" does not exist`
    at Zn.handleRequestError (/app/node_modules/@prisma/client/runtime/library.js:121:7459)
    at Zn.handleAndLogRequestError (/app/node_modules/@prisma/client/runtime/library.js:121:6784)
    at Zn.request (/app/node_modules/@prisma/client/runtime/library.js:121:6491)
    at async l (/app/node_modules/@prisma/client/runtime/library.js:130:9778)
    at async ToolServiceImpl.getPopularTools (/app/dist/services/toolService.js:172:38)
    at async HomeController.getHomePage (/app/dist/controllers/homeController.js:23:38)
```

### Query Being Executed
From database logs:
```sql
SELECT t.id
FROM Tool t
INNER JOIN ToolUsageStats tus ON t.id = tus.toolId
WHERE t.isActive = $1
ORDER BY tus.usageCount DESC, t.updatedAt DESC
LIMIT $2
```

### PostgreSQL Error Code
- **42P01**: "relation does not exist" - The table `Tool` is not found in the database

## Environment Analysis

### Local Development Environment ✅
- Database: PostgreSQL `toolchest_dev`
- Tables exist and populated:
  ```
  Tool, Tag, ToolTag, ToolUsageStats, _prisma_migrations
  ```
- Application works correctly
- Migrations status: "Database schema is up to date!"

### Production Environment ❌
- Platform: Railway
- Database: PostgreSQL (auto-provisioned)
- Tables: **MISSING** - causing the error
- Application fails on database queries

## Expected Database Schema

Based on `prisma/schema.prisma` and migration `20250523201833_initial_postgresql/migration.sql`:

### Tables That Should Exist
1. **Tool**
   - Fields: id, name, slug, description, iconClass, displayOrder, isActive, createdAt, updatedAt
   - Unique constraints: name, slug

2. **Tag** 
   - Fields: id, name, slug, description, color, createdAt
   - Unique constraints: name, slug

3. **ToolTag** (junction table)
   - Fields: toolId, tagId, assignedAt
   - Primary key: (toolId, tagId)

4. **ToolUsageStats**
   - Fields: id, toolId, usageCount, lastUsed
   - Unique constraint: toolId

## Root Cause Analysis

The production database is **empty** - no tables have been created. This indicates that database migrations are not running during the deployment process on Railway.

## Attempted Solutions

### Attempt 1: Add Startup Script (Commit: 4370fa1)
**Date**: Initial fix attempt
**Changes**:
- Created `scripts/start.sh` to run migrations before app start
- Updated Dockerfile to use startup script as CMD
- Added production seed script `db:seed:prod`

**Script Contents**:
```bash
#!/bin/sh
set -e
echo "Starting ToolChest application..."
echo "Running database migrations..."
npx prisma migrate deploy
echo "Seeding database with initial data..."
npm run db:seed:prod
echo "Starting the server..."
npm start
```

**Result**: ❌ No improvement - same error persists

### Attempt 2: Fix Prisma CLI Availability (Commit: d8a2316)
**Date**: Second fix attempt
**Problem Identified**: Prisma CLI not available in production container
**Root Cause**: Development dependencies (including Prisma CLI) were being pruned

**Changes**:
- Removed `npm prune --production` from builder stage
- Ensured complete `node_modules` copied to production stage
- Kept all dependencies including Prisma CLI for migrations

**Dockerfile Changes**:
```dockerfile
# Before: Pruned dev dependencies
RUN npm prune --production

# After: Keep all dependencies for migration tools
# Keep all dependencies including Prisma CLI which we need for running migrations in production
# Note: This makes the image larger but ensures we have the tools needed for database setup
```

**Result**: ❌ No improvement - same error persists

## Current State

### What We Know Works
- ✅ Local development setup
- ✅ Database migrations exist and are valid
- ✅ Prisma schema is correct
- ✅ Seed data is properly defined
- ✅ Docker container builds successfully
- ✅ Application starts and passes healthcheck
- ✅ Startup script is present and executable

### What's Not Working
- ❌ Database migrations not executing in production
- ❌ Database table creation in Railway environment  
- ❌ Startup script may not be running (needs runtime log confirmation)

### New Findings (2025-05-23)
From Railway build logs analysis:
- **Container Setup**: ✅ Successful (all files copied, permissions set)
- **Prisma Generate**: ✅ Works during build (with OpenSSL warnings)
- **Application Health**: ✅ Healthcheck passes  
- **Critical Gap**: ❌ No evidence of startup script execution in logs provided

## Deployment Configuration

### Railway Setup
- **File**: `railway.json`
- **Build**: Uses Dockerfile
- **Start Command**: `node dist/server.js` (overridden by our startup script)
- **Health Check**: `/health` endpoint

### Environment Variables (Production)
```
DATABASE_URL=${{ Postgres.DATABASE_URL }}  // Railway auto-generated
PORT=8080
NODE_ENV=production
```

### Package.json Scripts
```json
{
  "start": "node dist/server.js",
  "build": "npx prisma generate && tsc", 
  "migrate": "prisma migrate deploy",
  "db:seed:prod": "node dist/database/seeds/seed.js"
}
```

## Debugging Steps Needed

### 1. ✅ Railway Deployment Logs Analysis (COMPLETED)
**Build Logs Received**: 2025-05-23 20:39
**Runtime Logs Received**: 2025-05-23 20:38

**CRITICAL FINDINGS**:
- ✅ Migration command DOES execute: `prisma migrate deploy`
- ✅ Prisma connects to database successfully
- ✅ Migration file found: "1 migration found in prisma/migrations" 
- ❌ **PARADOX**: Reports "No pending migrations to apply" 
- ❌ **BUT**: Tables still don't exist ("relation tool does not exist")

**Analysis**: This indicates a **database state corruption** - the migration is marked as applied in `_prisma_migrations` table but the actual DDL statements didn't execute or failed silently.

### 2. Verify Database Connection
**Action**: Confirm Railway database is accessible and environment variables are correct
```sql
-- Test basic connectivity
SELECT version();
-- Check if any tables exist
\dt
-- Check if migration table exists
SELECT * FROM _prisma_migrations;
```

### 3. Manual Migration Execution
**Action**: Try running migrations directly in Railway console
```bash
# In Railway console/terminal
npx prisma migrate deploy
npx prisma db seed
```

### 4. Container Inspection
**Action**: Verify container has required tools
```bash
# Check if Prisma CLI is available
which prisma
npx prisma --version

# Check if startup script is executable  
ls -la scripts/start.sh

# Check environment variables
env | grep DATABASE_URL
```

### 5. Alternative Deployment Strategy
**Option A**: Pre-deploy migrations
- Run migrations from local environment against production DB
- Deploy application without migration step

**Option B**: Railway Build Scripts
- Use Railway's build phase hooks instead of startup script
- Configure migrations to run during build rather than runtime

**Option C**: Init Container Pattern
- Separate container/service to handle database setup
- Main application starts only after database is ready

## Research Findings

Based on research into similar Railway + Prisma deployment issues:

### Common Railway + Prisma Issues
1. **Private Network During Build**: Railway's legacy builder doesn't support private network access during build phase
2. **V2 Builder Solution**: Railway's V2 builder should resolve private network issues during build
3. **Runtime vs Build Time**: Many users successfully run migrations at runtime instead of build time
4. **Command Execution Issues**: Some users report Railway not recognizing custom start commands properly

### Similar Cases Resolved
- **Issue**: "Can't reach database server at postgres.railway.internal:5432"
- **Solution**: Using Railway V2 builder or running migrations at runtime
- **Alternative**: Using `${{Postgres.DATABASE_URL}}` (public URL) during build, private URL at runtime

## Next Steps

### Priority 1: Check Railway Deployment Logs 🔥
**ACTION REQUIRED**: Examine Railway deployment console for:
- Container build logs showing startup script execution
- Migration command output (or lack thereof)
- Any errors during container startup
- Network connectivity during migration attempts

### Priority 2: Verify Railway Builder Version
**Check if using Railway V2 builder**:
- V2 builder supports private network during build
- May resolve DATABASE_URL connectivity issues
- Enable via Railway service settings

### Priority 3: Alternative Approaches
1. **Runtime Migration**: Keep current approach but debug startup script execution
2. **Public URL Build**: Use `${{Postgres.DATABASE_URL}}` (public) for build, private for runtime
3. **Manual Migration**: Run migrations manually in Railway console as immediate fix
4. **Pre-deployment**: Run migrations from local environment against production DB

### Priority 4: Environment Verification
- Confirm DATABASE_URL format and accessibility
- Test migration commands in Railway terminal/console
- Verify container has required dependencies

## Important Notes

- Local environment works perfectly - issue is deployment-specific
- Two separate fix attempts have not resolved the issue
- Problem is likely in the deployment/runtime environment, not the code
- Railway-specific configuration may be needed for database setup
- **Critical**: Railway deployment logs are essential for debugging - without them we're debugging blind

## 🚨 CRITICAL: Database State Corruption Detected

**ISSUE IDENTIFIED**: The migration system is in an inconsistent state:

1. ✅ **Migration tracking works**: Prisma finds migration file and connects to DB
2. ✅ **Migration marked as applied**: "No pending migrations to apply"
3. ❌ **Actual tables missing**: Application fails with "relation tool does not exist"

**ROOT CAUSE**: The `_prisma_migrations` table shows the migration as applied, but the actual DDL statements (CREATE TABLE commands) were never executed or failed silently.

**IMMEDIATE ACTIONS NEEDED**:
1. **Check Migration Table**: Verify what's in `_prisma_migrations`
2. **Force Migration Reset**: Clear migration state and re-run
3. **Manual Table Creation**: Bypass Prisma and create tables directly

## SOLUTION STEPS 🔧

### Step 1: Diagnose Migration State (Railway Terminal)
Access Railway service terminal and run:
```sql
-- Check what migrations Prisma thinks are applied
psql $DATABASE_URL -c "SELECT * FROM _prisma_migrations;"

-- Check if any tables exist
psql $DATABASE_URL -c "\dt"

-- Check database schema
psql $DATABASE_URL -c "\d"
```

### Step 2: Reset Migration State (Choose ONE)

**Option A: Force Reset Migration**
```bash
# In Railway terminal
npx prisma migrate reset --force
npx prisma migrate deploy
npm run db:seed:prod
```

**Option B: Manual Migration Reset**
```sql
-- Delete migration record to force re-run
psql $DATABASE_URL -c "DELETE FROM _prisma_migrations WHERE migration_name = '20250523201833_initial_postgresql';"
```
Then run: `npx prisma migrate deploy`

**Option C: Manual Table Creation (Immediate Fix)**
```sql
-- Copy the SQL from your migration file and run directly
psql $DATABASE_URL < prisma/migrations/20250523201833_initial_postgresql/migration.sql
```

### Step 3: Verify Fix
```bash
# Check tables exist
psql $DATABASE_URL -c "\dt"
# Test application
curl https://your-app-url.railway.app/health
```

## Previous Action Items Status

1. ✅ **COMPLETED: Railway Logs Analysis** 
   - Container builds successfully, migrations run
   - **DISCOVERY**: Migration state corruption identified

2. **Verify Railway Builder Version**
   - Check if you're using Railway V2 builder (should resolve network issues)
   - Switch to V2 if using legacy builder

3. **Test Manual Migration** (for immediate fix)
   - Access Railway service terminal/console
   - Run: `npx prisma migrate deploy`
   - This will confirm if the issue is with automatic execution or Prisma itself

## Monitoring Commands

```bash
# Check deployment status
git log --oneline -5

# Check local migrations
npx prisma migrate status

# Test local database
psql -d toolchest_dev -c "\dt"
```

---
*Last Updated: 2025-05-23*
*Status: Under Investigation*
