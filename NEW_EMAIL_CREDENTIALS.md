# New Email Credentials - Updated ✅

## Changes Made

### Local .env File ✅ UPDATED
**File:** `server/.env`

**Old:**
```
EMAIL_USER=teyuteyba@gmail.com
EMAIL_PASS=cqbfxbtebipvsrwg
EMAIL_FROM="Nida Al-Quran Support" <teyuteyba@gmail.com>
```

**New:**
```
EMAIL_USER=teybteyba99@gmail.com
EMAIL_PASS=kirkmpmrqgrnjfxf
EMAIL_FROM="Nida Al-Quran Support" <teybteyba99@gmail.com>
```

Status: ✅ **DONE**

---

## Vercel Dashboard ⏳ PENDING

You still need to update Vercel with the same credentials:

**Go to:** https://vercel.com/dashboard → **nida-al-quran-api** → **Settings** → **Environment Variables**

**Update these 3 variables:**

| Variable | Old Value | New Value |
|----------|-----------|-----------|
| `EMAIL_USER` | `teyuteyba@gmail.com` | `teybteyba99@gmail.com` |
| `EMAIL_PASS` | `cqbfxbtebipvsrwg` | `kirkmpmrqgrnjfxf` |
| `EMAIL_FROM` | `"Nida Al-Quran Support" <teyuteyba@gmail.com>` | `"Nida Al-Quran Support" <teybteyba99@gmail.com>` |

**Keep these 2 variables the same:**

| Variable | Value |
|----------|-------|
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |

---

## What to Do Now

### Step 1: Update Vercel Variables
1. Go to Vercel dashboard (link above)
2. Update EMAIL_USER, EMAIL_PASS, EMAIL_FROM
3. Make sure EMAIL_HOST and EMAIL_PORT stay the same

### Step 2: Redeploy Backend
```bash
git add server/.env
git commit -m "Update Gmail credentials"
git push
```

Wait 2-3 minutes for deployment.

### Step 3: Test Email
1. Go to https://nida-al-quran.vercel.app/register
2. Register with test email
3. Check inbox for OTP

### Step 4: Report Results
Tell me:
- ✅ Did you receive OTP email?
- If not: What error shows in Vercel logs?

---

## Important

⚠️ **EMAIL_PASS has NO SPACES:** `kirkmpmrqgrnjfxf`

⚠️ **EMAIL_FROM has QUOTES:** `"Nida Al-Quran Support" <teybteyba99@gmail.com>`

⚠️ **Both EMAIL_USER values changed** (not just the password!)

---

## Summary

```
✅ Local .env updated with:
   - EMAIL_USER: teybteyba99@gmail.com
   - EMAIL_PASS: kirkmpmrqgrnjfxf

⏳ NEXT: Update Vercel with same values and redeploy
⏳ THEN: Test email system
```

See **UPDATE_VERCEL_NOW.md** for detailed step-by-step instructions.
