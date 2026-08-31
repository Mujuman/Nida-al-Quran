# Update Vercel with New Email Credentials - DO THIS NOW

## New Credentials
- **EMAIL_USER:** `teybteyba99@gmail.com` (NEW EMAIL)
- **EMAIL_PASS:** `kirkmpmrqgrnjfxf` (NO SPACES)
- **EMAIL_FROM:** `"Nida Al-Quran Support" <teybteyba99@gmail.com>`

## Local .env Updated ✅
Your local `server/.env` has been updated with new credentials.

## Now Update Vercel (This is the critical step!)

### Step 1: Go to Vercel Dashboard
https://vercel.com/dashboard

### Step 2: Click Your Project
Click **nida-al-quran-api** (the backend)

### Step 3: Go to Settings
Click **Settings** tab (right sidebar)

### Step 4: Go to Environment Variables
Click **Environment Variables** in left menu

### Step 5: Update/Replace Variables

You need to update these 3 variables (others stay the same):

**Option A: Edit existing (easier)**
1. Find `EMAIL_USER` → Click edit (pencil icon) → Change to `teybteyba99@gmail.com` → Save
2. Find `EMAIL_PASS` → Click edit → Change to `kirkmpmrqgrnjfxf` → Save
3. Find `EMAIL_FROM` → Click edit → Change to `"Nida Al-Quran Support" <teybteyba99@gmail.com>` → Save

**Option B: Delete and recreate (if edit doesn't work)**
1. Delete `EMAIL_USER` → Add new: `teybteyba99@gmail.com`
2. Delete `EMAIL_PASS` → Add new: `kirkmpmrqgrnjfxf`
3. Delete `EMAIL_FROM` → Add new: `"Nida Al-Quran Support" <teybteyba99@gmail.com>`

### Step 6: Verify All 5 Email Variables

After updating, you should have:

```
✅ EMAIL_HOST = smtp.gmail.com
✅ EMAIL_PORT = 587
✅ EMAIL_USER = teybteyba99@gmail.com (UPDATED)
✅ EMAIL_PASS = kirkmpmrqgrnjfxf (UPDATED)
✅ EMAIL_FROM = "Nida Al-Quran Support" <teybteyba99@gmail.com> (UPDATED)
```

All 5 must be present and correct!

### Step 7: Redeploy Backend

**Option A: Auto-redeploy (recommended)**
```bash
git add server/.env
git commit -m "Update Gmail credentials to new account"
git push
```

Wait 2-3 minutes for Vercel to detect changes and auto-deploy.

**Option B: Manual redeploy**
1. Go to **Deployments** tab in Vercel
2. Click the **•••** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes

### Step 8: Verify Deployment Complete

1. Go to **Deployments** tab
2. Wait for latest deployment to show green checkmark ✅
3. If it shows red ❌ → Check logs for errors

### Step 9: Test Email System

1. Go to https://nida-al-quran.vercel.app/register
2. Register with test email (use your personal email)
3. Check inbox for OTP email
4. Should see subject: `XXXXXX is your Nida Al-Quran Email Verification Code`

✅ **If you receive email → SUCCESS! Email system working!**

❌ **If you don't receive email:**
- Check spam/junk folder
- Go to Vercel Deployments → Logs
- Search for your email
- Look for error messages

## Quick Checklist

- [ ] LOCAL .env updated ✅ (Already done)
- [ ] Vercel EMAIL_USER updated to `teybteyba99@gmail.com`
- [ ] Vercel EMAIL_PASS updated to `kirkmpmrqgrnjfxf`
- [ ] Vercel EMAIL_FROM updated to `"Nida Al-Quran Support" <teybteyba99@gmail.com>`
- [ ] All 5 email variables present in Vercel
- [ ] Backend redeployed
- [ ] Deployment shows green checkmark ✅
- [ ] Test student registered
- [ ] OTP email received in inbox ✅

## Troubleshooting

### Still Getting 535 Error?

Check Vercel logs:
1. Deployments → Latest → Logs
2. Search for email address
3. If still shows `535 5.7.8` error:
   - Verify new credentials are correct (no typos!)
   - Make sure EMAIL_PASS has NO SPACES
   - Check if email/password might have special characters

### Email Goes to Ethereal (Test Account)?

Means Vercel environment variables are not set properly:
1. Go back to Settings → Environment Variables
2. Verify all 5 email variables are there
3. Check for any typos or extra spaces
4. Re-save each one
5. Redeploy

### Deployment Stuck or Failed?

1. Check Deployment logs for errors
2. If it says "Build failed":
   - Go to Deployments → Latest → Logs
   - Read the error message
   - Contact support if persistent

## Success Indicators

You'll know it's working when you see in Vercel logs:
```
✅ Email sent successfully via SMTP! Message ID: <...>
```

NOT:
```
⚠️ Primary SMTP failed
📧 Creating Ethereal test account
```

## Important Notes

⚠️ **EMAIL_PASS must have NO SPACES**
- Correct: `kirkmpmrqgrnjfxf`
- Wrong: `kirk mpmr qgrn jfxf`

⚠️ **EMAIL_FROM must include quotes**
- Correct: `"Nida Al-Quran Support" <teybteyba99@gmail.com>`
- Wrong: `Nida Al-Quran Support <teybteyba99@gmail.com>`

⚠️ **Be careful with typos** - any typo will cause auth failure

## Next

1. Update Vercel environment variables (THIS IS CRITICAL!)
2. Redeploy backend
3. Test email system
4. Report results

**Do this now!** Let me know when Vercel redeployment is complete.
