# How to Check Vercel Logs for Email Debugging

## Why Check Logs?

Vercel logs show exactly what your backend is doing:
- Whether email credentials were found
- Whether Gmail SMTP connection succeeded
- Whether email was actually sent
- Any error messages

## Quick Steps to View Logs

### 1. Go to Vercel Dashboard
https://vercel.com/dashboard

### 2. Click Your Project
Click on **nida-al-quran-api** (the backend project)

### 3. Go to Deployments
Click **Deployments** tab at the top

### 4. Click Latest Deployment
Find the deployment you just did (should be at the top with green checkmark ✅)

Click on it.

### 5. Click "View Logs" or "Logs"
You should see a **Logs** section or **View logs** button

### 6. Search for Your Test Activity
Look for messages like:
- `registering`
- `📧` (email emoji)
- Your test student's email address

## What to Look For

### ✅ SUCCESS - Emails Working

You should see these messages:
```
🔍 Verifying OTP for email: mujahidhussenm2@gmail.com
✅ Email verified successfully
📧 Sending registration notification to main admins...
✅ Admin notification sent successfully
```

And for each email:
```
📧 Sending OTP verification email to mujahidhussenm2@gmail.com...
📧 Using SMTP server: smtp.gmail.com:587
✅ Email sent successfully via SMTP! Message ID: <...>
```

### ❌ FAILURE - Emails Not Working

#### Problem 1: Environment Variables Not Set
```
⚠️ Email credentials not configured (EMAIL_USER/EMAIL_PASS missing). Using Ethereal fallback.
📧 Creating Ethereal test account for email delivery...
✅ Email sent via Ethereal fallback! Message ID: <...>
📧 Preview URL: https://ethereal.email/message/...
```

**Fix:** Go back to Vercel Settings → Environment Variables and verify all 5 variables are saved.

#### Problem 2: Gmail Authentication Failed
```
⚠️ Primary SMTP failed: 535 5.7.8 Username and Password not accepted
```

**Fix:** 
1. Go to https://myaccount.google.com/apppasswords
2. Generate new app password
3. Update `EMAIL_PASS` in Vercel
4. Redeploy

#### Problem 3: Network Error
```
⚠️ Primary SMTP failed: getaddrinfo ENOTFOUND smtp.gmail.com
```

**Fix:** This is rare on Vercel. Check:
1. Is `EMAIL_HOST` set to `smtp.gmail.com`?
2. Redeploy and try again

#### Problem 4: TLS/Connection Error
```
⚠️ Primary SMTP failed: ETIMEDOUT or ECONNREFUSED
```

**Fix:** Rare on Vercel. Try:
1. Wait a few minutes and test again
2. Check Vercel status page for outages

## Real Example Log Output

### Scenario: Student Registration → OTP Sent Successfully

```
12:34:56.123 │ 🌐 New registration attempt for email: teststu@example.com
12:34:57.456 │ 🔐 Generated OTP: 456789 (expires in 15 mins)
12:34:58.789 │ ✅ User created in database: teststu@example.com
12:34:59.012 │ 📧 Sending OTP verification email to teststu@example.com...
12:35:00.345 │ 📤 Attempting to send email to teststu@example.com with subject: "456789 is your Nida Al-Quran Email Verification Code"
12:35:01.678 │ 📧 Using SMTP server: smtp.gmail.com:587
12:35:02.912 │ ✅ Email sent successfully via SMTP! Message ID: <CAG2F+7fN==@mail.gmail.com>
12:35:03.245 │ ✅ OTP email sent successfully to teststu@example.com
12:35:04.578 │ Response sent: { success: true, requiresOtp: true, msg: '...', email: 'teststu@example.com' }
```

**This is GOOD** ✅ - Email was sent to real Gmail SMTP

### Scenario: Student Registration → OTP Sent to Ethereal (Test Account)

```
12:34:56.123 │ 🌐 New registration attempt for email: teststu@example.com
12:34:57.456 │ 🔐 Generated OTP: 456789 (expires in 15 mins)
12:34:58.789 │ ✅ User created in database: teststu@example.com
12:34:59.012 │ 📧 Sending OTP verification email to teststu@example.com...
12:35:00.345 │ 📤 Attempting to send email to teststu@example.com with subject: "456789 is your Nida Al-Quran Email Verification Code"
12:35:01.678 │ 📧 Using SMTP server: smtp.gmail.com:587
12:35:02.912 │ ⚠️ Primary SMTP failed: Email credentials not configured (EMAIL_USER/EMAIL_PASS missing)
12:35:03.245 │ 📧 Creating Ethereal test account for email delivery...
12:35:04.578 │ ✅ Email sent via Ethereal fallback! Message ID: <ASD2F+7fN==@ethereal.email>
12:35:05.912 │ 📧 Preview URL: https://ethereal.email/message/YXEx...
12:35:06.345 │ Response sent: { success: true, requiresOtp: true, msg: '...', email: 'teststu@example.com' }
```

**This is BAD** ❌ - Email went to test account, not real inbox

---

**Look for:** If you see "Ethereal" or "Preview URL" = environment variables not set in Vercel

---

## Step-by-Step Log Checking

### Step 1: Register Student
1. Go to https://nida-al-quran.vercel.app/register
2. Fill form
3. Click Register
4. **Note the exact time** (e.g., 12:34 PM)

### Step 2: Open Vercel Logs
1. Go to Vercel dashboard
2. Click project
3. Deployments → Latest → Logs
4. **Look for logs near the time you registered**

### Step 3: Search for Your Email
Use browser Ctrl+F (Cmd+F on Mac) to search for:
- Your test email address
- `📧` symbol
- `SMTP`

### Step 4: Read the Messages
Look at the sequence to understand what happened:
1. "Sending OTP verification email to..."
2. Either: "✅ Email sent successfully via SMTP!" OR "⚠️ Primary SMTP failed"
3. If failed: What was the error?

### Step 5: Troubleshoot Based on Logs

| Log Message | Meaning | Action |
|------------|---------|--------|
| `✅ Email sent successfully via SMTP!` | Email sent to real inbox ✅ | Emails working! |
| `Ethereal test account` | Email sent to test account ❌ | Re-check Vercel env vars |
| `535 5.7.8 Username and Password` | Gmail auth failed ❌ | Regenerate app password |
| `ENOTFOUND smtp.gmail.com` | Network issue ❌ | Rare - wait & retry |

## Vercel Log Navigation Tips

### Filter Logs
Some Vercel interfaces let you filter by:
- Time range
- Deployment stage
- Error level

### Search in Logs
Use Ctrl+F (Cmd+F) to search for:
- Email address
- `SMTP`
- `Error`
- `Email`

### Export Logs
If needed, you can often export logs as text file for analysis.

### Recent Activity
Logs are usually 2-3 lines per action. For a registration, expect 10-20 lines total.

## Email Sending Timeline in Logs

```
Registration endpoint called (1 line)
├── Check if email exists (1 line)
├── Hash password (1 line)
├── Generate OTP (1 line)
├── Save user to DB (1 line)
├── Send OTP email (10+ lines)
│   ├── Check EMAIL_USER/EMAIL_PASS
│   ├── Create transporter
│   ├── Attempt SMTP connection
│   ├── Send via Gmail OR fallback to Ethereal
│   └── Log result (success or error)
└── Send response to client (1 line)
```

## Pro Tips

1. **Refresh Logs:** If you don't see your action, wait 10 seconds and refresh the page
2. **Real-time:** Vercel logs update in real-time as requests happen
3. **Multiple Requests:** If testing multiple times, look for the LATEST entries (scroll to bottom)
4. **Timestamps:** Logs are usually in UTC. Adjust to your timezone mentally.
5. **Search for Errors:** Ctrl+F for "❌" or "Error" to find problems quickly

## If All Else Fails

1. Take a screenshot of the Vercel logs
2. Share in the documentation: `VERCEL_LOGS_SCREENSHOT.txt`
3. Include:
   - Exact error messages
   - Time of the error
   - Email address tested
   - Expected vs actual result
