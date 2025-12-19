# Netlify Environment Variables Setup Guide

## Overview
This guide walks you through setting up environment variables for BZION Shop on Netlify. These variables are critical for the application to function properly in production.

## Step 1: Access Netlify Site Settings

1. Go to [app.netlify.com](https://app.netlify.com)
2. Select your site: **bzionshopfmcg**
3. Navigate to **Site Settings** (top menu)
4. Go to **Build & Deploy** → **Environment** (left sidebar)

## Step 2: Add Production Environment Variables

Click **"Edit variables"** and add the following variables. **DO NOT** commit sensitive values to git.

### Critical Variables (Required)

#### 1. Authentication
```
NEXTAUTH_URL = https://bzionshopfmcg.netlify.app
NEXTAUTH_SECRET = Xhs5QRfukZTPuvRl9YTGqVMdtO2ddO+K9va07qA+JAs=
AUTH_URL = https://bzionshopfmcg.netlify.app
```

#### 2. Database
```
DATABASE_URL = postgres://49354d9198a739633b94f84669bc5d7027d936ac684744f0775909b6dd90afde:sk_hthEDtY-RshT5h7emzNuV@db.prisma.io:5432/postgres?sslmode=require
```

#### 3. Email Service (Resend/SMTP)
```
EMAIL_SERVER_HOST = smtp.resend.com
EMAIL_SERVER_PORT = 587
EMAIL_SERVER_USER = resend
EMAIL_SERVER_PASSWORD = your_resend_api_key_from_dashboard
EMAIL_FROM = BZION <noreply@bzion.shop>
```

#### 4. Caching & Rate Limiting (Upstash Redis)
```
UPSTASH_REDIS_REST_URL = https://your-upstash-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN = your_upstash_token_from_console
```

### Public Variables (Safe to Commit)
```
NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE = +2347010326015
NEXT_PUBLIC_APP_VERSION = 1.0.0
NEXT_WHATSAPP_BUSINESS_URL = https://wa.me/message/TOVLTP6EMAWNI1
WHATSAPP_BUSINESS_NUMBER = +2347010326015
WHATSAPP_BUSINESS_URL = https://wa.me/message/TOVLTP6EMAWNI1
DATA_SOURCE = static
```

## Step 3: Verify Deployment

After adding environment variables:

1. Go to **Deployments** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for build to complete (should take 2-3 minutes)
4. Check the build log for errors
5. Once deployed, visit https://bzionshopfmcg.netlify.app

## Step 4: Test Critical Features

After deployment, verify:

- ✅ Homepage loads
- ✅ `/login` page works
- ✅ Authentication flow works (sign up/login)
- ✅ `/admin` dashboard loads (if authenticated as admin)
- ✅ Email notifications send properly
- ✅ Database queries work (check console for Prisma errors)

## Environment Variable Security Notes

### 🔒 Sensitive Variables (Never commit to git)
- `NEXTAUTH_SECRET` - Keep private, unique per environment
- `DATABASE_URL` - Contains password, keep private
- `EMAIL_SERVER_PASSWORD` - Resend API key
- `UPSTASH_REDIS_REST_TOKEN` - Redis token

### 📝 Public Variables (Safe to commit)
- `NEXT_PUBLIC_*` - These are embedded in client-side code
- `WHATSAPP_BUSINESS_*` - Business phone numbers
- `DATA_SOURCE` - Feature flags
- `NEXT_PUBLIC_APP_VERSION` - Version info

### .env File Management

**Local Development (.env)**
- Contains localhost URLs and development values
- Should NOT be committed to git (add to .gitignore)
- Used by `npm run dev`

**Production (Netlify UI)**
- All variables must be set in Netlify dashboard
- Build-time variables are applied during `npm run build`
- Runtime variables are available to serverless functions

## Troubleshooting

### Build Fails with "NEXTAUTH_URL not set"
**Solution:** Make sure `NEXTAUTH_URL` is set in Netlify UI exactly as shown above

### Database Connection Errors
**Solution:** Verify `DATABASE_URL` is complete and hasn't been modified. Check:
- No extra spaces
- Correct database name: `postgres`
- Correct port: `5432`

### Email Sending Fails
**Solution:** Verify Resend credentials:
- `EMAIL_SERVER_HOST`: `smtp.resend.com`
- `EMAIL_SERVER_PORT`: `587`
- `EMAIL_SERVER_USER`: `resend`
- `EMAIL_SERVER_PASSWORD`: Check if token is still valid

### Login Page Shows "Configuration Error"
**Solution:** This usually means NextAuth isn't properly configured. Check:
- `NEXTAUTH_URL` matches your deployment URL
- `NEXTAUTH_SECRET` is set
- All other variables are present

## Automatic Deployments

Once environment variables are set, Netlify will:
1. Automatically redeploy when you push to `main` branch
2. Apply all environment variables from the UI
3. Run `npm run build` command
4. Deploy the `.next` output directory

## Manual Deployment

To manually trigger a deployment:
1. Go to https://app.netlify.com
2. Select **bzionshopfmcg** site
3. Click **Deployments** tab
4. Click **"Trigger deploy"** → **"Deploy site"**

## Next Steps

1. ✅ Set all variables in Netlify UI
2. ✅ Trigger manual deployment to test
3. ✅ Monitor deployment build logs
4. ✅ Test all features on https://bzionshopfmcg.netlify.app
5. ✅ Set up monitoring and alerts

For support, check:
- Netlify Build Logs: Deployments → [Latest Deploy] → Logs
- Application Logs: Netlify Functions section
- Browser Console: Check for client-side errors
