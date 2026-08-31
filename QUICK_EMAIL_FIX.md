# Quick Email Fix - 5 Minutes

## The Problem
Emails not reaching students even though API says "✅ Resend OTP successful"

## The Cause
Vercel backend doesn't have email credentials set (`.env` not deployed to Vercel)

## The Fix (5 steps)

### 1. Go to Vercel Dashboard
https://vercel.com/dashboard → Click **nida-al-quran-api** project

### 2. Go to Settings → Environment Variables
Click **Settings** (right sidebar) → **Environment Variables** (left sidebar)

### 3. Add These 5 Variables

Click "Add" for each:

**Variable 1:**
- Name: `EMAIL_HOST`
- Value: `smtp.gmail.com`

**Variable 2:**
- Name: `EMAIL_PORT`  
- Value: `587`

**Variable 3:**
- Name: `EMAIL_USER`
- Value: `teyuteyba@gmail.com`

**Variable 4:**
- Name: `EMAIL_PASS`
- Value: `cqbfxbtebipvsrwg`

**Variable 5:**
- Name: `EMAIL_FROM`
- Value: `"Nida Al-Quran Support" <teyuteyba@gmail.com>`

After each one, click the **Save** button.

### 4. Redeploy Backend

Option A (Auto):
```bash
git add .
git commit -m "Trigger redeploy"
git push
```

Option B (Manual):
- Click **Deployments** tab
- Click **•••** on latest deployment
- Click **Redeploy**

Wait 2-3 minutes...

### 5. Test

Go to https://nida-al-quran.vercel.app/register
- Register with any email
- Check inbox for OTP code
- ✅ If you get email → DONE!
- ❌ If you don't → Check "Troubleshooting" below

## Troubleshooting

### Emails Still Not Arriving?

**Check Vercel Logs:**
1. Go to Vercel Deployments
2. Click latest deployment
3. Click "Logs"
4. Register a student
5. Look for these messages:

- See `✅ Email sent successfully via SMTP!` → ✅ Working!
- See `Ethereal` or `Preview URL` → ❌ Not configured
- See `Email credentials not configured` → ❌ Variables not saved
- See `535 5.7.8` or auth error → ❌ Wrong email/password

### Common Issues

| Issue | Fix |
|-------|-----|
| Variables show as "blank" in Vercel | Click "Save" button after typing |
| Emails to Ethereal (test) account | Variables not properly saved - retry steps 2-3 |
| Gmail authentication error (535) | Check if `EMAIL_PASS` is app password, not regular password |
| Deployment still running | Wait 3 minutes for Vercel to finish redeployment |

### Gmail App Password Issue

If getting "535 5.7.8 Username and Password not accepted":

1. Go to https://myaccount.google.com/security
2. Scroll to **App passwords**
3. Generate new password for "Mail"
4. Copy it (remove spaces)
5. Update `EMAIL_PASS` in Vercel with new value
6. Redeploy

## Done!

Once emails arrive in inbox:
- ✅ Students get OTP emails
- ✅ Students get approval emails  
- ✅ Admins get notifications
- ✅ Teachers get assignments

If you need more details, see:
- **EMAIL_SYSTEM_ROOT_CAUSE.md** - Full explanation
- **VERCEL_EMAIL_SETUP.md** - Detailed instructions
