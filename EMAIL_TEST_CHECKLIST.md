# Email System Test Checklist

## Step 1: Register a Test Student

1. Go to **https://nida-al-quran.vercel.app/register**
2. Fill out registration form with:
   - **Full Name:** Test Student
   - **Email:** Use YOUR PERSONAL EMAIL (e.g., mujahidhussenm2@gmail.com)
   - **Password:** teyu123456
   - **Phone:** +251974155756
   - **Age:** 25
   - **Gender:** Male
   - **Course:** Quran Studies
   - **Level:** Beginner
   - **Schedule:** Flexible
   - **Guardian Name:** Test Guardian
   - **Guardian Phone:** +251974155756
   - **Learning Media:** Google Meet

3. Click **Register**

## Step 2: Check for OTP Email

✅ **Expected:** You should receive an email with subject line like:
```
123456 is your Nida Al-Quran Email Verification Code
```

⏱️ **Timing:** Should arrive within 1-2 minutes

❌ **If no email after 2 minutes:**
- Check spam/junk folder
- Go to next section "Troubleshooting"

## Step 3: Verify OTP

1. Copy the 6-digit OTP code from email
2. Go back to registration page
3. Enter OTP and click **Verify**

Expected response:
```
✅ Your email address has been verified successfully!
Your application has now been submitted to the main administration for approval.
```

## Step 4: Check Admin Notification Email

✅ **Expected:** Main admin (teyuteyba@gmail.com) should receive notification email with:
- Student name
- Email address
- Course selected
- Registration status

⏱️ **Timing:** Should arrive immediately after OTP verification

## Step 5: Admin Approves Student

1. Go to **https://nida-al-quran-admin.vercel.app/admin/login**
2. Login with:
   - Email: `teyuteyba@gmail.com`
   - Password: `teyu123@`
3. Go to **Pending Students** or **All Users**
4. Find the test student you just registered
5. Change status from **Pending** to **Approved**
6. Click **Save**

## Step 6: Check Approval Email

✅ **Expected:** Test student email should receive:
```
Subject: Your Nida Al-Quran Account has been Approved! 🎉

Message includes:
- Your account has been approved
- Link to login portal
- Congratulations message
```

⏱️ **Timing:** Should arrive immediately after admin approval

## Troubleshooting

### No OTP Email Received (Step 2)

**Check Vercel Logs:**
1. Go to https://vercel.com/dashboard
2. Click **nida-al-quran-api** project
3. Click **Deployments** tab
4. Click the latest deployment
5. Click **Logs** or **View logs**
6. Look for messages from when you registered

**Expected to see:**
```
📧 Sending OTP verification email to mujahidhussenm2@gmail.com...
✅ Email sent successfully via SMTP! Message ID: ...
```

**If you see "Ethereal" instead:**
```
❌ Primary SMTP failed: Email credentials not configured
📧 Creating Ethereal test account...
✅ Email sent via Ethereal fallback! Message ID: ...
```
This means environment variables are still not set correctly in Vercel.

**If you see Gmail error (535):**
```
❌ Primary SMTP failed: 535 5.7.8 Username and Password not accepted
```
This means:
- Email credentials are wrong
- OR app password was changed
- OR Gmail blocked the app
- Solution: Regenerate app password at https://myaccount.google.com/apppasswords

### Email Looks Like Spam

Gmail might filter automated emails. Check:
1. Spam/Junk folder
2. Promotions tab
3. Social tab

### Multiple Registrations

Don't register twice with same email. If you need to re-test:
- Use different email address
- OR ask admin to delete the student first

## What Should Work After This

Once emails are confirmed working:

✅ **Student Registration Email:** 
- OTP sent to student email

✅ **Admin Notification Email:**
- Main admin notified of new student

✅ **Approval Email:**
- Student receives approval notification

✅ **Teacher Assignment Email:**
- If admin assigns teacher to student

## Success Criteria

All of the following must be true:

- [ ] OTP email received in student inbox (Step 2)
- [ ] Admin received registration notification (Step 4)
- [ ] Approval email received in student inbox (Step 6)
- [ ] Vercel logs show "✅ Email sent successfully via SMTP!"
- [ ] No "Ethereal" or fallback messages in logs

## Documentation Reference

For more details:
- **EMAIL_SYSTEM_ROOT_CAUSE.md** - Why this was broken
- **VERCEL_EMAIL_SETUP.md** - Detailed setup guide
- **QUICK_EMAIL_FIX.md** - Quick reference
