# Vercel Backend Email Configuration - Complete Setup Guide

## Problem
Backend API responds with "✅ Resend OTP successful" but emails are NOT reaching student inboxes. This is because:

1. **Local `.env` file is NOT deployed to Vercel** - Vercel doesn't deploy `.env` files
2. **Email credentials must be set in Vercel dashboard** as environment variables
3. **Backend needs to be redeployed** after environment variables are set

## Solution: Set Email Credentials in Vercel Dashboard

### Step 1: Go to Vercel Project Settings
1. Go to **https://vercel.com/dashboard**
2. Click on your **nida-al-quran-api** project
3. Go to **Settings** tab (right sidebar)
4. Click **Environment Variables** (left sidebar under Settings)

### Step 2: Add Email Configuration Variables

Add ALL of these environment variables. Click "Add" for each one:

| Name | Value | Notes |
|------|-------|-------|
| `EMAIL_HOST` | `smtp.gmail.com` | Gmail SMTP server |
| `EMAIL_PORT` | `587` | TLS port |
| `EMAIL_USER` | `teyuteyba@gmail.com` | Your Gmail address |
| `EMAIL_PASS` | `cqbfxbtebipvsrwg` | App password (NOT regular password) |
| `EMAIL_FROM` | `"Nida Al-Quran Support" <teyuteyba@gmail.com>` | Sender name and email |
| `NODE_ENV` | `production` | Ensures production logging |

⚠️ **IMPORTANT**: 
- Do NOT include quotes around the values in Vercel dashboard
- For `EMAIL_FROM`: paste exactly as `"Nida Al-Quran Support" <teyuteyba@gmail.com>`
- Make sure `EMAIL_PASS` is the **app password**, not your regular Gmail password

### Step 3: Redeploy Backend

**Option A: Auto-redeploy (recommended)**
1. Make a dummy commit to your repo:
   ```bash
   git add .
   git commit -m "Trigger redeployment with email config"
   git push
   ```
2. Wait 2-3 minutes for Vercel to auto-deploy

**Option B: Manual redeploy**
1. Go to **Deployments** tab in Vercel
2. Click the three-dot menu (•••) on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes for deployment to complete

### Step 4: Verify Deployment

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Go to **Logs** tab
4. Look for recent activity confirming successful deployment

### Step 5: Test Email System

1. Go to **https://nida-al-quran.vercel.app/register**
2. Register a new student account
3. Check the **Deployments → Logs** in Vercel for email sending confirmation:
   - Should show: `📧 Sending OTP verification email to...`
   - Should show: `✅ Email sent successfully via SMTP!`
4. Check student's email inbox for OTP verification email

## Troubleshooting

### Emails Still Not Arriving After Setup

Check Vercel logs for these error messages:

| Error | Cause | Fix |
|-------|-------|-----|
| `Email credentials not configured` | ENV vars not set in Vercel | Re-check Settings → Environment Variables |
| `Authentication failed` | Wrong app password | [Regenerate Gmail app password](https://myaccount.google.com/apppasswords) |
| `535 5.7.8 Username and Password not accepted` | Invalid credentials | Verify `EMAIL_USER` and `EMAIL_PASS` exactly match Gmail |
| `Could not resolve SMTP host` | Network issue | Check Vercel networking (rare on Vercel) |

### Gmail Blocking Emails

If you see "535" or "535 5.7.8" errors:

1. Go to **https://myaccount.google.com/security**
2. Check "Recent activity" for failed login attempts
3. If Gmail flagged account as suspicious:
   - Click "Review unrecognized activity"
   - Mark as "This was me"
   - Regenerate app password at **https://myaccount.google.com/apppasswords**
4. Update `EMAIL_PASS` in Vercel with new app password
5. Redeploy

### Verify Gmail Configuration Locally First

Before pushing to Vercel, test locally:

```bash
cd server
node test-email-config.js
```

Should show:
```
📧 Using SMTP server: smtp.gmail.com:587
✅ Email sent successfully via SMTP! Message ID: ...
```

## Environment Variables Checklist

Before redeploying, verify:

- [ ] `EMAIL_HOST=smtp.gmail.com` is set in Vercel
- [ ] `EMAIL_PORT=587` is set in Vercel
- [ ] `EMAIL_USER=teyuteyba@gmail.com` is set in Vercel (correct email)
- [ ] `EMAIL_PASS=cqbfxbtebipvsrwg` is set in Vercel (app password, not regular password)
- [ ] `EMAIL_FROM="Nida Al-Quran Support" <teyuteyba@gmail.com>` is set in Vercel
- [ ] All variables are saved (click Save after each addition)
- [ ] Backend has been redeployed after setting variables

## Email Flow After Setup

Once correctly configured:

```
1. Student registers → Form posts to https://nida-al-quran-api.vercel.app/api/users/register
2. Backend receives request
3. Backend checks if EMAIL_USER/EMAIL_PASS are set (they now are in Vercel!)
4. Backend connects to smtp.gmail.com:587
5. Backend authenticates with teyuteyba@gmail.com
6. Backend sends OTP email to student
7. Student receives email ✅
8. Student enters OTP to verify email
9. Backend marks user as verified
10. Admin receives registration notification
11. Admin approves student
12. Student receives approval email ✅
```

## Next Steps

1. ✅ Set environment variables in Vercel dashboard
2. ✅ Redeploy backend
3. ✅ Test email flow end-to-end
4. ✅ Confirm emails reaching students

If issues persist after these steps, check:
- Vercel deployment logs (Deployments → View logs)
- Gmail account security (myaccount.google.com/security)
- Email credentials spelling (case-sensitive!)
