# Netlify Environment Variables Setup Guide

## Overview
This guide explains how to set up environment variables for the BZION application on Netlify.

## Quick Setup

### Step 1: Access Netlify Site Settings
1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Select your site: **bzionshopfmcg**
3. Navigate to: **Site Settings → Build & Deploy → Environment**
4. Click **"Edit variables"**

### Step 2: Add These Environment Variables

#### Critical Variables (REQUIRED)
```
NEXTAUTH_URL = https://bzionshopfmcg.netlify.app
NEXTAUTH_SECRET = Xhs5QRfukZTPuvRl9YTGqVMdtO2ddO+K9va07qA+JAs=
DATABASE_URL = postgres://49354d9198a739633b94f84669bc5d7027d936ac684744f0775909b6dd90afde:sk_hthEDtY-RshT5h7emzNuV@db.prisma.io:5432/postgres?sslmode=require
```

#### Email Configuration (REQUIRED)
```
EMAIL_SERVER_HOST = smtp.resend.com
EMAIL_SERVER_PORT = 587
EMAIL_SERVER_USER = resend
EMAIL_SERVER_PASSWORD = re_UA3sibbL_9LMFSnTicu8GvxibJjWEwBt2
EMAIL_FROM = BZION <noreply@bzion.shop>
```

#### Caching & Rate Limiting (REQUIRED)
```
UPSTASH_REDIS_REST_URL = https://quality-slug-43912.upstash.io
UPSTASH_REDIS_REST_TOKEN = AauIAAIncDEwMzFiZWMyMWRkNjY0Njg2ODM4NDE1YTU4NTYwMjU5Y3AxNDM5MTI
```

#### WhatsApp Integration (OPTIONAL)
```
NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE = +2347010326015
WHATSAPP_BUSINESS_NUMBER = +2347010326015
WHATSAPP_BUSINESS_URL = https://wa.me/message/TOVLTP6EMAWNI1
```

#### Monitoring & Feature Flags
```
NEXT_PUBLIC_APP_VERSION = 1.0.0
DATA_SOURCE = static
```

### Step 3: Configure Build Environment
In **Site Settings → Build & Deploy → Environment**, set:
```
NODE_VERSION = 20
NODE_ENV = production
NPM_FLAGS = --include=dev
```

### Step 4: Trigger a Rebuild
1. Go to **Deploys** tab
2. Click **"Trigger deploy → Deploy site"**
3. Monitor the build logs

## Deployment Flow

### Local Development
- Uses `.env` file with `NEXTAUTH_URL=http://localhost:3000`
- Runs with `npm run dev`

### Production Build (Netlify)
- Uses `.env.production` as baseline
- Netlify environment variables override `.env.production` values
- `NEXTAUTH_URL` is critical - must be set to: `https://bzionshopfmcg.netlify.app`

## Key Configuration Points

### netlify.toml
- **Build Command**: `npm run build` (runs Prisma generation + Next.js build)
- **Publish Directory**: `.next` (static and server files)
- **Functions**: `netlify/functions` (for edge functions if needed)

### .env vs .env.production vs Netlify UI
```
Priority (Highest to Lowest):
1. Netlify UI Environment Variables
2. .env.production file
3. .env file
4. Default values in code
```

### Critical: NEXTAUTH_URL
This must match your deployed domain:
```
Production: https://bzionshopfmcg.netlify.app
Preview: https://{preview-id}--bzionshopfmcg.netlify.app
Branch Deploy: https://{branch-name}--bzionshopfmcg.netlify.app
```

## Troubleshooting

### "Configuration Error" on /auth/error
- **Cause**: NEXTAUTH_URL is not set or incorrect
- **Fix**: Set `NEXTAUTH_URL=https://bzionshopfmcg.netlify.app` in Netlify UI

### Database Connection Timeout
- **Cause**: DATABASE_URL not set or network issue
- **Fix**: Verify DATABASE_URL in Netlify UI and check Prisma timeout is set to 60+ seconds

### Login Page Not Loading
- **Cause**: useSearchParams needs dynamic rendering
- **Fix**: Already implemented - page uses Suspense boundary

### TTFB Over 1200ms
- **Cause**: Database queries timing out on first request
- **Fix**: Implemented timeout protection in server actions (5s timeout with graceful fallback)

## File Structure

```
.env                          # Local development (localhost:3000)
.env.production              # Production baseline (overridden by Netlify UI)
.env.example                 # Template for new environments
netlify.toml                 # Build configuration
NETLIFY_ENVIRONMENT_SETUP.md # This file
```

## Secret Management Best Practices

### Sensitive Credentials (Keep in Netlify UI Only)
- `NEXTAUTH_SECRET` - Never commit
- `EMAIL_SERVER_PASSWORD` - Never commit
- `UPSTASH_REDIS_REST_TOKEN` - Never commit
- `DATABASE_URL` - Never commit

### Public Configuration (OK to Commit)
- `EMAIL_FROM`
- `NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE`
- `NEXT_PUBLIC_APP_VERSION`
- `DATA_SOURCE`

## Netlify UI vs File Configuration

**Use Netlify UI for:**
- Sensitive credentials (passwords, tokens, secrets)
- Environment-specific URLs
- Build environment variables
- Feature toggles per environment

**Use Files (.env/.env.production) for:**
- Default/fallback values
- Public configuration
- Development-only settings

## Next Steps

1. ✅ Set all variables in Netlify UI
2. ✅ Trigger a rebuild
3. ✅ Test login page: https://bzionshopfmcg.netlify.app/login
4. ✅ Monitor logs in Netlify dashboard
5. ✅ Verify admin dashboard: https://bzionshopfmcg.netlify.app/admin

## Support

For issues, check:
- Netlify Deploy Logs: **Deploys → Select Deploy → View Log**
- Function Logs: **Functions → Select Function → Logs**
- Build Logs for TypeScript/Next.js errors
