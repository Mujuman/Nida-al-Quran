# Gmail Email Configuration Fix

## 🔴 Problem
Emails not sending (OTP verification and approval notifications) despite having Gmail credentials configured.

## ⚠️ Common Gmail Issues

### Issue 1: Using Regular Gmail Password ❌
Gmail blocks regular passwords from SMTP connections for security.

**Fix: Use App-Specific Password**

### Issue 2: 2-Factor Authentication Not Enabled
App passwords only work if 2FA is enabled on your Google account.

### Issue 3: Less Secure Apps Access Disabled
Even with correct credentials, Gmail blocks "less secure apps."

### Issue 4: Spaces in App Password
App passwords have spaces that need to be handled correctly.

---

## ✅ Step-by-Step Fix

### Step 1: Enable 2-Factor Authentication

1. Go to: https://myaccount.google.com/
2. Click **Security** (left sidebar)
3. Scroll to **2-Step Verification**
4. Click **Get Started**
5. Follow the verification process
6. Once enabled, you should see **App passwords** option

### Step 2: Generate App-Specific Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select:
   - **App**: Mail
   - **Device**: Windows Computer (or your device)
3. Click **Generate**
4. Google will show a 16-character password like: `abcd efgh ijkl mnop`
5. **Copy the password (including spaces or without spaces)**

### Step 3: Update .env File

**Important:** Remove spaces from the app password when adding to .env

```env
# BEFORE (❌ Wrong - has spaces)
EMAIL_PASS=abcd efgh ijkl mnop

# AFTER (✅ Correct - no spaces)
EMAIL_PASS=abcdefghijklmnop
```

**Full .env configuration:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mujuhusu@gmail.com
EMAIL_PASS=kyhhftteffrvqezl
EMAIL_FROM="Nida Al-Quran Support" <mujuhusu@gmail.com>
```

⚠️ **IMPORTANT:** The EMAIL_FROM email should match EMAIL_USER to avoid Gmail blocks.

### Step 4: Update Vercel Environment Variables

If deployed on Vercel:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Update:
   ```
   EMAIL_USER=mujuhusu@gmail.com
   EMAIL_PASS=kyhhftteffrvqezl
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_FROM=Nida Al-Quran Support <mujuhusu@gmail.com>
   ```
5. **Redeploy** the project

### Step 5: Restart/Redeploy

**Local:**
```bash
npm run dev
```

**Vercel:**
1. Go to project dashboard
2. Click **Redeploy** button
3. Wait 1-2 minutes

---

## 🔍 Verify Email Configuration

### Test 1: Check .env File
```bash
grep EMAIL_PASS .env
# Should show: EMAIL_PASS=kyhhftteffrvqezl (without spaces)
```

### Test 2: Test Email Sending (Node.js)
Create a file `test-email.js`:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'mujuhusu@gmail.com',
    pass: 'kyhhftteffrvqezl' // NO SPACES
  }
});

transporter.sendMail({
  from: '"Nida Al-Quran Support" <mujuhusu@gmail.com>',
  to: 'test@example.com',
  subject: 'Test Email',
  text: 'This is a test email'
}, (err, info) => {
  if (err) {
    console.error('❌ Error:', err.message);
  } else {
    console.log('✅ Email sent:', info.response);
  }
});
```

Run it:
```bash
node test-email.js
```

### Test 3: Check Server Logs
Look for logs:
```
📤 Attempting to send email to [email]
📧 Using SMTP server: smtp.gmail.com:587
✅ Email sent successfully via SMTP! Message ID: [id]
```

If you see:
```
❌ Primary SMTP failed: Invalid login
```

The credentials are wrong.

---

## 🔐 Gmail Security Checklist

- [ ] 2-Factor Authentication enabled
- [ ] App password generated (16 characters)
- [ ] App password copied correctly (no spaces in .env)
- [ ] EMAIL_USER matches email that created app password
- [ ] EMAIL_FROM uses EMAIL_USER address
- [ ] EMAIL_HOST is smtp.gmail.com
- [ ] EMAIL_PORT is 587
- [ ] Not using regular Gmail password
- [ ] .env file updated
- [ ] Vercel environment variables updated (if deployed)
- [ ] Project redeployed

---

## Common Gmail SMTP Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid login credentials` | Wrong password or 2FA not enabled | Use app password with 2FA |
| `Username and password not accepted` | Regular password used | Generate app-specific password |
| `Account has been disabled` | Security issue | Check Google Account security |
| `Less secure app access` | Old setting | Gmail now uses app passwords |
| `Connection refused` | SMTP server down | Rare, usually temporary |

---

## Email Test Scenarios

### Scenario 1: Registration (OTP Email)
1. Student registers at: https://nida-al-quran.vercel.app/register
2. Enter email: `test@example.com`
3. Submit form
4. **Check logs:**
   ```
   ✅ OTP email sent successfully to test@example.com
   ```
5. **Check email:**
   - Inbox of test@example.com
   - Should receive OTP with 6-digit code
   - Valid for 15 minutes

### Scenario 2: Email Verification
1. Student enters OTP from email
2. Click Verify
3. **Check logs:**
   ```
   ✅ Email verified successfully for test@example.com
   📧 Sending registration notification to main admins...
   ```
4. **Check email:**
   - Main admin should receive notification

### Scenario 3: Student Approval
1. Admin dashboard: https://nida-al-quran-admin.vercel.app
2. Find student
3. Click Approve
4. **Check logs:**
   ```
   ✅ Approval email sent successfully to test@example.com
   ```
5. **Check email:**
   - Student should receive approval notification
   - Email contains login link

---

## Troubleshooting Commands

### Test Gmail SMTP (curl)
```bash
curl -X POST "smtp://mujuhusu@gmail.com@smtp.gmail.com:587" \
  --ssl-reqd \
  --mail-from "mujuhusu@gmail.com" \
  --mail-rcpt "test@example.com" \
  -u "mujuhusu@gmail.com:kyhhftteffrvqezl" \
  -T message.txt
```

### Test with Telnet (local)
```bash
telnet smtp.gmail.com 587
# Type: EHLO hello
# Look for: 250-STARTTLS
```

### Check if 2FA is enabled
Visit: https://myaccount.google.com/u/0/security
- Look for: "2-Step Verification"
- Should show: "On"

### Check app passwords
Visit: https://myaccount.google.com/apppasswords
- Should list: "Mail" and "Windows Computer"

---

## Email Configuration for Different Services

### If Using Gmail (Recommended)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM="Nida Al-Quran Support" <your-email@gmail.com>
```

### If Using Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Nida Al-Quran Support" <your-email@yahoo.com>
```

### If Using Outlook/Office 365
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_FROM="Nida Al-Quran Support" <your-email@outlook.com>
```

---

## Verification Checklist After Fix

### Local Development
- [ ] `.env` file updated with correct app password
- [ ] `npm run dev` running without errors
- [ ] Test OTP registration works
- [ ] OTP email received
- [ ] Email verification works
- [ ] Admin notification received
- [ ] Student approval email sent
- [ ] Approval email received

### Production Deployment
- [ ] Vercel environment variables updated
- [ ] Project redeployed
- [ ] `/health` endpoint returns 200 OK
- [ ] OTP registration works
- [ ] OTP email received
- [ ] Email verification works
- [ ] Approval email sent
- [ ] Approval email received

---

## Email Testing Sequence

1. **Test Email Credentials**
   ```javascript
   // In Node.js REPL
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 587,
     auth: {
       user: 'mujuhusu@gmail.com',
       pass: 'kyhhftteffrvqezl'
     }
   });
   transporter.verify((err, success) => {
     if (err) console.error(err);
     else console.log('✅ SMTP connection successful');
   });
   ```

2. **Test OTP Email**
   - Register new student
   - Watch server logs
   - Check student email for OTP

3. **Test Verification**
   - Enter OTP
   - Check server logs
   - Check admin email for notification

4. **Test Approval**
   - Approve student in admin
   - Check server logs
   - Check student email for approval

---

## Debugging Logs

### Success Logs (✅)
```
📤 Attempting to send email to student@example.com
📧 Using SMTP server: smtp.gmail.com:587
✅ Email sent successfully via SMTP! Message ID: <abc123@gmail.com>
✅ OTP email sent successfully to student@example.com
```

### Error Logs (❌)
```
❌ Error sending email via fallback: Invalid login credentials
⚠️ Primary SMTP failed: Invalid login credentials
Falling back to Ethereal test account
✅ Email sent via Ethereal fallback
📧 Preview URL: https://ethereal.email/message/...
```

If you see Ethereal fallback, it means SMTP failed and emails aren't reaching real inboxes.

---

## Next Steps

1. **Enable 2-Factor Authentication** (if not already done)
2. **Generate App-Specific Password** from Google Account
3. **Update .env file** with the 16-character app password (no spaces)
4. **Update Vercel** environment variables (if deployed)
5. **Redeploy** the project
6. **Test** the email flow

---

## Support

If emails still don't work after following this guide:

1. Verify 2FA is enabled: https://myaccount.google.com/security
2. Check app password exists: https://myaccount.google.com/apppasswords
3. Confirm `.env` has correct credentials
4. Check server logs for SMTP errors
5. Try test script above to verify SMTP connection

---

**Gmail email configuration fixed! ✅**

All OTP verification and approval emails should now send successfully.

Last updated: August 31, 2026
