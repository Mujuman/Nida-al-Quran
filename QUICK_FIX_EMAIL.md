# Quick Fix: Gmail Email Not Working

## ⚡ 3-Minute Fix

### Problem
- OTP verification emails not being sent
- Student approval emails not being sent
- Error: "Invalid login credentials" or "Username and password not accepted"

### Root Cause
Gmail blocks regular passwords from SMTP. You need an **App-Specific Password** with **2-Factor Authentication enabled**.

### Solution (Do This Now)

#### Step 1: Enable 2-Factor Authentication (2 minutes)
1. Go to: https://myaccount.google.com/
2. Click **Security** (left side)
3. Find **2-Step Verification**
4. Click **Get Started** and follow instructions
5. Verify your phone number

#### Step 2: Generate App Password (1 minute)
1. Go to: https://myaccount.google.com/apppasswords
2. Select:
   - **App**: Mail
   - **Device**: Windows Computer
3. Click **Generate**
4. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
5. **Remove spaces**: `abcdefghijklmnop`

#### Step 3: Update .env File (instantly)
Edit `server/.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mujuhusu@gmail.com
EMAIL_PASS=kyhhftteffrvqezl
EMAIL_FROM="Nida Al-Quran Support" <mujuhusu@gmail.com>
```

**⚠️ Important:**
- Remove spaces from app password
- EMAIL_FROM must use same email as EMAIL_USER
- Don't use your regular Gmail password

#### Step 4: Restart & Deploy
**Local:**
```bash
npm run dev
```

**Vercel:**
1. Go to https://vercel.com/dashboard
2. Project → Settings → Environment Variables
3. Update EMAIL_USER and EMAIL_PASS
4. Click **Redeploy**

---

## ✅ Verify It Works

### Test 1: Run Email Test Script
```bash
node server/test-email-config.js
```

Should show:
```
✅ SMTP Connection Successful!
✅ Test Email Sent Successfully!
🎉 Email Configuration is Working Correctly!
```

### Test 2: Test Email Flow
1. Register student at https://nida-al-quran.vercel.app/register
2. Check logs: `✅ OTP email sent successfully to [email]`
3. Check inbox for OTP email
4. Enter OTP and verify
5. Admin should receive notification
6. In admin, approve student
7. Student should receive approval email

---

## 🔧 Common Issues

| Issue | Fix |
|-------|-----|
| "Invalid login credentials" | Use app password, not regular password |
| "Username and password not accepted" | Enable 2-Factor Authentication first |
| "Less secure app access" | Gmail no longer allows this; use app password |
| App password has spaces | Remove spaces in .env file |
| EMAIL_FROM doesn't match EMAIL_USER | Gmail may block it; use same email |

---

## 📋 Checklist

Before testing, verify:

- [ ] 2-Factor Authentication enabled on Google Account
- [ ] App password generated (16 characters)
- [ ] Spaces removed from app password in .env
- [ ] EMAIL_USER and EMAIL_FROM use same email
- [ ] Server restarted (local) or redeployed (Vercel)
- [ ] Environment variables updated in Vercel

---

## 🧪 Detailed Testing

### Run Email Test Script
```bash
cd server
node test-email-config.js
```

**Output will show:**
```
📋 Step 1: Checking Environment Variables
✅ SMTP Connection Successful!

📋 Step 2: Testing SMTP Connection
✅ SMTP Connection Successful!

📋 Step 3: Sending Test Email
✅ Test Email Sent Successfully!

🎉 Email Configuration is Working Correctly!
```

### Manual Test in Node.js
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'mujuhusu@gmail.com',
    pass: 'kyhhftteffrvqezl' // NO SPACES
  }
});

transporter.verify((err, success) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
  } else {
    console.log('✅ Connection successful');
  }
});
```

---

## 📞 If Still Not Working

1. **Check Google Account:**
   - Visit: https://myaccount.google.com/security
   - Confirm 2-Factor Authentication is ON
   - Confirm app password is listed

2. **Check .env file:**
   ```bash
   cat server/.env | grep EMAIL_
   ```
   Should show all EMAIL_* variables without spaces

3. **Check server logs:**
   ```
   ✅ Email sent successfully via SMTP!
   ```
   If you see Ethereal fallback, SMTP failed.

4. **Test SMTP directly:**
   ```bash
   node server/test-email-config.js
   ```

---

## 📚 Full Documentation

For detailed information, see: **GMAIL_EMAIL_FIX.md**

---

## Summary

✅ Enable 2-Factor Authentication
✅ Generate App-Specific Password  
✅ Remove spaces from password
✅ Update .env file
✅ Restart/Redeploy
✅ Test with test-email-config.js

**That's it! Emails should now work. 🎉**
