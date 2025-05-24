# Railway Deployment Guide for ToolChest

This guide covers deploying ToolChest to Railway with the admin dashboard and proper session management.

## 🚀 Quick Deployment Steps

### 1. Prerequisites
- Railway account
- GitHub repository with your ToolChest code

### 2. Railway Project Setup

1. **Create New Project on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your ToolChest repository

2. **Add PostgreSQL Database**
   - In your Railway project dashboard
   - Click "New Service" → "Database" → "PostgreSQL"
   - Railway will automatically create `DATABASE_URL` environment variable

### 3. Environment Variables

Set these in Railway dashboard (Settings → Environment):

```env
# Required for production
NODE_ENV=production
ADMIN_SESSION_SECRET=your-super-secure-random-string-here

# Optional (with defaults)
ADMIN_SESSION_TIMEOUT=3600000
ADMIN_BCRYPT_ROUNDS=12
PORT=8080
```

**⚠️ Important:** Generate a strong `ADMIN_SESSION_SECRET`. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Deploy Configuration

Railway should automatically detect your `package.json` and use:
- **Build Command:** `npm run build`
- **Start Command:** `npm start`

If not, set these manually in Settings → Deploy.

### 5. Database Migration

After deployment, run migrations:

```bash
# In Railway dashboard → Service → Deploy logs
# Or use Railway CLI:
railway run npx prisma migrate deploy
```

### 6. Seed Admin User

Create the default admin user:

```bash
railway run npm run db:seed:admin
```

## 🔧 Session Management Fixes

The key changes made for Railway deployment:

### PostgreSQL Session Store
- Sessions are now stored in PostgreSQL instead of memory
- Survives application restarts and scaling
- Automatic session table creation

### Cookie Configuration
- `secure: false` - Railway handles HTTPS termination
- `sameSite: 'lax'` - Better proxy compatibility
- `trust proxy: 1` - Trust Railway's proxy headers

### Code Changes Made

1. **Updated `src/app.ts`:**
   - Added PostgreSQL session store for production
   - Configured proxy trust for Railway
   - Fixed cookie settings for HTTPS termination

2. **Migration Added:**
   - `20250524004143_add_session_table` - Creates session table

3. **New Dependencies:**
   - `connect-pg-simple` - PostgreSQL session store
   - `@types/connect-pg-simple` - TypeScript definitions

## 🔐 Post-Deployment Security

### 1. Change Default Admin Password
```
Username: admin
Password: admin123  # CHANGE THIS IMMEDIATELY
```

### 2. Access Admin Dashboard
```
https://your-app.railway.app/admin/auth/login
```

### 3. Create Additional Admin Users
- Log in as super admin
- Go to `/admin/users`
- Create new admin accounts
- Disable or delete default admin account

## 🐛 Troubleshooting

### Login Redirects to Login Page
- Check `NODE_ENV=production` is set
- Verify `ADMIN_SESSION_SECRET` is configured
- Check database connection and session table exists

### Session Store Errors
```bash
# Check session table exists
railway run npx prisma db execute --stdin < session_check.sql
```

### Database Connection Issues
- Verify PostgreSQL service is running
- Check `DATABASE_URL` is automatically set
- Run `railway run npx prisma db push` to sync schema

### Build Failures
```bash
# Check build logs
railway logs --service=your-service-name

# Common fixes:
railway run npm install
railway run npx prisma generate
```

## 📊 Monitoring

### Health Check
```
GET https://your-app.railway.app/health
```

### Admin Dashboard Access
```
https://your-app.railway.app/admin/dashboard
```

### Session Cleanup

Sessions automatically expire after 1 hour. For manual cleanup:

```sql
-- Remove expired sessions
DELETE FROM session WHERE expire < NOW();
```

## 🔄 Updates and Maintenance

### Deploy Updates
1. Push changes to GitHub
2. Railway auto-deploys from your main branch
3. Run migrations if schema changed:
   ```bash
   railway run npx prisma migrate deploy
   ```

### Database Backups
Railway automatically backs up PostgreSQL databases. For manual backup:
```bash
railway run pg_dump $DATABASE_URL > backup.sql
```

## ✅ Deployment Checklist

- [ ] Railway project created
- [ ] PostgreSQL service added
- [ ] Environment variables set (`NODE_ENV`, `ADMIN_SESSION_SECRET`)
- [ ] Application deployed successfully
- [ ] Database migrations applied
- [ ] Admin user seeded
- [ ] Admin login tested
- [ ] Default password changed
- [ ] Additional admin users created (if needed)
- [ ] Health check endpoint working

## 🆘 Support

If you encounter issues:

1. Check Railway deploy logs
2. Verify environment variables
3. Test health endpoint
4. Check database connectivity
5. Review session table existence

Common URLs:
- Health: `https://your-app.railway.app/health`
- Admin Login: `https://your-app.railway.app/admin/auth/login`
- Main Site: `https://your-app.railway.app/` 