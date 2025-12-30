# Vercel Deployment Guide - SignalCore CRM

## Step 1: Create a Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Choose **Continue with GitHub** (recommended) or **Continue with Email**
4. Complete the signup process

---

## Step 2: Push CRM to GitHub

### Option A: Create New Repo via GitHub Website

1. Go to [github.com/new](https://github.com/new)
2. Name it: `signalcore-crm`
3. Set to **Private**
4. Click **Create repository**
5. Follow the instructions to push existing code:

```bash
cd C:\Users\Dimitri\Desktop\Inland_Intercept_2026\crm-web
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/signalcore-crm.git
git push -u origin main
```

### Option B: Use GitHub Desktop (Easier)

1. Download [GitHub Desktop](https://desktop.github.com/)
2. File → Add Local Repository → Select `crm-web` folder
3. Publish to GitHub

---

## Step 3: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your GitHub account
4. Find and select `signalcore-crm`
5. Click **Import**

---

## Step 4: Configure Project Settings

On the configuration screen:

| Setting          | Value                     |
| ---------------- | ------------------------- |
| Framework Preset | Next.js                   |
| Root Directory   | `./` (leave as is)        |
| Build Command    | `npm run build` (default) |
| Output Directory | `.next` (default)         |
| Install Command  | `npm install` (default)   |

---

## Step 5: Add Environment Variables

**IMPORTANT**: Before clicking Deploy, expand **Environment Variables** and add:

| Variable Name                   | Value                                            |
| ------------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://kflwwblkuaeskwjxyucr.supabase.co`       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_XbXJxhT4LKAkbSaipZfzvw__CAACeZk` |
| `SUPABASE_SERVICE_ROLE_KEY`     | `sb_secret_DbktFr5-2cRviVOsZt4cmA_1IVGwt3c`      |
| `STRIPE_SECRET_KEY`             | Your Stripe secret key                           |
| `STRIPE_WEBHOOK_SECRET`         | Your webhook signing secret                      |

For each variable:

1. Enter the **Name** (exactly as shown)
2. Enter the **Value**
3. Check all environments: **Production**, **Preview**, **Development**
4. Click **Add**

---

## Step 6: Deploy

1. Click **Deploy**
2. Wait 1-3 minutes for the build to complete
3. You'll get a URL like: `https://signalcore-crm-abc123.vercel.app`

---

## Step 7: Update Stripe Webhook URL

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your webhook endpoint
3. Click **Update endpoint**
4. Change the URL to: `https://YOUR-VERCEL-URL.vercel.app/api/stripe-webhook`
5. Save

---

## Step 8: Test Everything

1. Visit your Vercel URL - you should see the CRM dashboard
2. Create a test payment in Stripe (use test mode)
3. Check if a new contractor appears in your CRM!

---

## Troubleshooting

### "Build Failed"

- Check the build logs in Vercel dashboard
- Most common: Missing environment variables

### "500 Server Error"

- Go to Vercel dashboard → Deployments → Click on deployment → Logs
- Look for the specific error

### "Webhook not working"

- Verify the webhook URL is correct
- Check Stripe dashboard → Webhooks → click your webhook → see recent attempts
- Make sure `STRIPE_WEBHOOK_SECRET` is correct

---

## Your Final URLs

After deployment, you'll have:

| App            | URL                                                    |
| -------------- | ------------------------------------------------------ |
| Admin CRM      | `https://signalcore-crm.vercel.app`                    |
| Stripe Webhook | `https://signalcore-crm.vercel.app/api/stripe-webhook` |

Later, you can add a custom domain like `crm.signalcoredata.com` in Vercel settings.
