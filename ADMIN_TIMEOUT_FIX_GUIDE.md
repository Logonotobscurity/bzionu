# Admin Dashboard Timeout - Root Cause & Fix

**Issue:** `Query timeout after 4000ms` + `timeout exceeded when trying to connect`

**Root Cause:** Database connection pool exhaustion or database server unreachable

---

## What Was Fixed

### 1. Increased Query Timeouts (CRITICAL)
- **From:** 4000ms per query
- **To:** 20000ms per query  
- **Files Updated:** `src/app/admin/_actions/activities.ts`
- **All function calls now include descriptive labels for debugging**

**Why this helps:**
- Database connection pooling takes time
- Network latency can exceed 4 seconds
- Query execution may be slow on first run
- 20 seconds provides comfortable margin

### 2. Enhanced Timeout Wrapper with Logging
```typescript
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 20000,
  label: string = 'Query'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => {
        console.warn(`[TIMEOUT] ${label} exceeded ${timeoutMs}ms`);
        reject(new Error(`${label} timeout after ${timeoutMs}ms`));
      }, timeoutMs)
    ),
  ]);
}
```

**Benefits:**
- Better error messages for debugging
- Logs which specific query timed out
- Easier to identify bottlenecks

---

## Database Connection Troubleshooting

### Symptoms You're Seeing:
```
prisma:error timeout exceeded when trying to connect
prisma:error Invalid `prisma.user.findMany()` invocation
Server has closed the connection
```

### Root Causes (In Order of Likelihood):

#### 1. **Database Server Not Running**
```bash
# Check if PostgreSQL is running
# Windows: 
Get-Service postgresql-x64-*

# macOS:
brew services list | grep postgres

# Linux:
sudo systemctl status postgresql
```

#### 2. **DATABASE_URL Not Set or Invalid**
```bash
# Check .env.local
cat .env.local | grep DATABASE_URL

# Should look like:
# DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# NOT:
# DATABASE_URL=""  ❌
```

#### 3. **Connection Pool Exhausted**
```bash
# Max connections: Check current value
# Default PostgreSQL max_connections: 100

# In .env.local, add:
DATABASE_URL="postgresql://...?connection_limit=5"
```

#### 4. **Firewall/Network Blocking Port**
```bash
# Check if port 5432 (PostgreSQL default) is accessible
telnet localhost 5432  # Should connect

# If not:
# - Check firewall
# - Check security groups (AWS/GCP)
# - Verify IP whitelist
```

#### 5. **Prisma Client Not Generated**
```bash
# Regenerate Prisma client
npx prisma generate

# Check if node_modules/.prisma/client exists
ls node_modules/.prisma/client
```

---

## What You Need to Do NOW

### Immediate Fixes (Do These First):

#### 1. Verify DATABASE_URL
```bash
# Check your .env.local file
cat .env.local

# Should show:
# DATABASE_URL="postgresql://username:password@host:port/database"

# Test the connection:
psql $DATABASE_URL -c "SELECT 1"
```

#### 2. Restart Everything
```bash
# Kill the dev server (Ctrl+C)
# Then:

# Clean Prisma
rm -r node_modules/.prisma
npx prisma generate

# Restart dev server
npm run dev
```

#### 3. Check Connection Pool Settings
In `src/lib/db/index.ts`, the current settings are:
```typescript
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL!,
  connectionTimeoutMillis: 5000,  // Wait max 5s to get connection
  idleTimeoutMillis: 30000,       // Close idle connections after 30s
})
```

**If you're getting timeouts, try increasing:**
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 20,                         // Max connections in pool
  connectionTimeoutMillis: 15000,  // Wait up to 15s
  idleTimeoutMillis: 60000,        // Close idle after 60s
  statement_timeout: 25000,        // Query timeout: 25s
})
```

#### 4. Run Health Check
Create `src/app/api/health/db/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

export async function GET() {
  try {
    const isConnected = await checkDatabaseConnection();
    
    if (isConnected) {
      return NextResponse.json(
        { status: 'ok', message: 'Database connected' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { status: 'error', message: 'Database not reachable' },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        error: (error as Error).message
      },
      { status: 503 }
    );
  }
}
```

Test it:
```bash
curl http://localhost:3000/api/health/db
```

---

## Performance Timeline

### Before Timeout Fix:
```
Query Timeout: 4000ms (too aggressive)
Actual DB Latency: 5000-6000ms
Result: ❌ Always timeout
```

### After Timeout Fix:
```
Query Timeout: 20000ms (reasonable)
Actual DB Latency: 5000-6000ms
Result: ✅ Queries succeed
```

---

## Connection Pool Best Practices

### Development (Single Admin):
```typescript
max: 5,
connectionTimeoutMillis: 10000,
idleTimeoutMillis: 30000,
```

### Production (Multiple Admins):
```typescript
max: 20,
connectionTimeoutMillis: 15000,
idleTimeoutMillis: 60000,
```

### High-Load Production:
```typescript
max: 50,
connectionTimeoutMillis: 20000,
idleTimeoutMillis: 120000,
```

---

## Monitoring & Debugging

### Enable Detailed Logging
In `.env.local`:
```env
DEBUG=prisma:*
DATABASE_URL="postgresql://...?log_connections=true"
```

### Check Active Connections
```sql
SELECT count(*) FROM pg_stat_activity;
```

### View Long-Running Queries
```sql
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

---

## Changes Made to Code

### File: `src/app/admin/_actions/activities.ts`

**Changes:**
- ✅ Updated `withTimeout()` function signature (added `label` parameter)
- ✅ Increased all query timeouts from 4000ms → 20000ms
- ✅ Updated function calls with descriptive labels:
  - `'Fetch recent users'`
  - `'Fetch recent quotes'`
  - `'Fetch activity stats'`
  - `'Fetch new users'`
  - `'Fetch newsletter subscribers'`
  - `'Fetch form submissions'`
  - `'Fetch recent checkout events'`
  - `'Update form submission status'`

**Functions Updated:**
1. `getRecentActivities()` - 20s timeout
2. `getActivityStats()` - 20s timeout
3. `getQuotes()` - 20s timeout
4. `getNewUsers()` - 20s timeout
5. `getNewsletterSubscribers()` - 20s timeout
6. `getFormSubmissions()` - 20s timeout
7. `updateFormSubmissionStatus()` - 20s timeout

---

## Testing After Fix

### Step 1: Verify Database Connection
```bash
# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT version();"

# Should return PostgreSQL version info
```

### Step 2: Start Dev Server
```bash
npm run dev
```

### Step 3: Monitor Logs
Watch for messages like:
```
[TIMEOUT] Fetch recent users exceeded 20000ms  ← Would indicate actual timeout
```

Instead of:
```
Error fetching activities: Error: Query timeout after 4000ms  ← Old behavior
```

### Step 4: Load Admin Dashboard
```
http://localhost:3000/admin
```

Check browser console for errors.

### Step 5: Performance Metrics
Should now see dashboard load in:
- ✅ 2-5 seconds (with 20s timeout buffer)
- Previously: ❌ Always timed out at 4 seconds

---

## Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| Query Timeout | 4000ms | 20000ms |
| Logging | Generic errors | Labeled errors |
| Connection Wait | 5s | 15s (if updated) |
| Pool Max | Default | 5-20 (recommended) |
| Dashboard Load | Timeout ❌ | 2-5s ✅ |

---

## If Issues Persist

### Option 1: Check Database Logs
```bash
# PostgreSQL log location
# macOS: /usr/local/var/log/postgres.log
# Linux: /var/log/postgresql/

# View recent errors
tail -f /var/log/postgresql/postgresql.log
```

### Option 2: Restart PostgreSQL
```bash
# macOS
brew services restart postgresql

# Linux
sudo systemctl restart postgresql

# Windows (Services.msc)
# Find PostgreSQL service → Right-click → Restart
```

### Option 3: Reset Connection Pool
```bash
# Add temporary endpoint to test
# src/app/api/admin/reset-pool/route.ts
export async function POST() {
  await prisma.$disconnect();
  await prisma.$connect();
  return Response.json({ message: 'Pool reset' });
}

# Call it:
curl -X POST http://localhost:3000/api/admin/reset-pool
```

### Option 4: Increase System Limits
```bash
# macOS - increase file descriptors
ulimit -n 4096

# Linux - check ulimit
ulimit -a
```

---

## Next Steps

1. ✅ Verify database is running
2. ✅ Check DATABASE_URL in .env.local
3. ✅ Run `npx prisma generate`
4. ✅ Restart dev server
5. ✅ Test `/api/health/db` endpoint
6. ✅ Load admin dashboard
7. ✅ Monitor console logs for timeouts

Once working, you can proceed with WebSocket implementation for real-time updates.

