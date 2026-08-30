# Email Verification & Approval Flow Guide

## Overview
This document explains the email verification and student approval notification system implemented in Nida Al-Quran backend.

## Email Configuration

### Environment Variables Required
```env
# Email SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM="Nida Al-Quran Support" <nida-support@nidaalquran.com>
```

### For Gmail Users
1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated 16-character password in `EMAIL_PASS`

## Email Flows

### 1. Registration & Email Verification (OTP)
```
Student Registration Form
    ↓
registerUser() Controller
    ├─ Generate 6-digit OTP
    ├─ Save to database (15 min expiry)
    └─ Send OTP Email ✉️
    
Student Receives Email with OTP
    ↓
Student Enters OTP on Frontend
    ↓
verifyOtp() Controller
    ├─ Validate OTP code
    ├─ Mark user as verified (isVerified = true)
    ├─ Send admin notification (async)
    └─ Response: "Pending main admin approval"
```

**Emails Sent:**
- `sendVerificationOtpEmail()` - OTP code to student

### 2. Student Approval Workflow
```
Main Admin Reviews Student
    ↓
updateUserStatus() API Call
    ├─ Set registrationStatus = "approved"
    ├─ previousStatus check (pending → approved)
    └─ Send Approval Email ✉️

Student Receives Approval Email
    ↓
Student Can Now Login
```

**Emails Sent:**
- `sendApprovalNotification()` - Approval confirmation to student

### 3. Teacher Assignment Notification
```
Main Admin Assigns Student to Teacher
    ↓
assignStudentToTeacher() API Call
    ├─ Link student to teacher
    └─ Send Assignment Email ✉️

Teacher Receives Notification Email
```

**Emails Sent:**
- `sendAssignmentNotification()` - Assignment notification to teacher

## Troubleshooting

### Issue 1: OTP Email Not Received
**Check the following:**
1. Server logs for email sending errors
2. Gmail credentials (EMAIL_USER, EMAIL_PASS)
3. App-specific password is being used (not regular Gmail password)
4. EMAIL_HOST and EMAIL_PORT are correct

**Server Logs to Look For:**
```
📤 Attempting to send email to student@example.com with subject: "..."
📧 Using SMTP server: smtp.gmail.com:587
✅ Email sent successfully via SMTP! Message ID: <...>
```

### Issue 2: Approval Email Not Received
**Check the following:**
1. Verify `registrationStatus` changed from `pending` to `approved`
2. Check server logs for email sending errors
3. Look for Ethereal preview URL if using fallback

**Expected Server Logs:**
```
📧 Sending approval email to student@email.com...
✅ Approval email sent successfully to student@email.com
```

### Issue 3: Email Goes to Spam
**Solutions:**
1. Add main email to contacts
2. Check DKIM/SPF settings if using custom domain
3. Verify EMAIL_FROM uses authenticated email address

## Fallback Email System

If primary SMTP fails, the system automatically falls back to Ethereal (test email service):
- Emails are still "sent" but to a test account
- A preview URL is logged to the console
- Open the URL to view the test email content

**Logs for Fallback:**
```
✅ Email sent via Ethereal fallback! Message ID: <...>
📧 Preview URL: https://ethereal.email/message/...
```

## Server Logging Format

All email operations are logged with emojis for easy reading:

| Log Type | Emoji | Meaning |
|----------|-------|---------|
| `📤` | Send Attempt | Email is being prepared and sent |
| `📧` | Email Detail | Information about email server/account |
| `🔐` | OTP Generated | 6-digit code created |
| `✅` | Success | Email sent successfully |
| `❌` | Error | Email failed to send |
| `⚠️` | Warning | Issue detected but handled |
| `🔄` | Re-attempt | Retrying action |
| `🔍` | Verification | Checking/validating data |
| `⏰` | Expiry | Time-based check (OTP expiry) |

## Database Fields

### User Model Email Fields
```javascript
isVerified: Boolean          // Email verified via OTP?
verificationOtp: String      // Current 6-digit code
verificationOtpExpires: Date // OTP expiry time (15 mins)
registrationStatus: String   // "pending", "approved", "rejected"
email: String               // User email address
```

## Manual Testing

### Test Verification Email
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Student",
    "email": "test@example.com",
    "password": "password123",
    "phone": "1234567890",
    "course": "qaidah-tajweed"
  }'
```

Response will contain OTP details.

### Test OTP Verification
```bash
curl -X POST http://localhost:5000/api/users/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### Test Approval Email
```bash
curl -X PUT http://localhost:5000/api/admin/users/[USER_ID]/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "registrationStatus": "approved"
  }'
```

## Email Content Templates

All email templates are located in: `/server/utils/adminNotifications.js`

### Templates Available
1. **Verification OTP Email** - Contains 6-digit code, 15min expiry timer
2. **Approval Notification** - Login confirmation with portal link
3. **Assignment Notification** - Teacher assignment details
4. **Registration Notification** - Admin notification of new registration

## Performance Notes

- Emails are sent **asynchronously** (non-blocking)
- OTP generation is **instant** (~1ms)
- Ethereal fallback setup is **lazy** (only when needed)
- All email logs include timestamps for debugging

## Security Considerations

✅ Passwords NOT logged
✅ OTP codes sent via secure email only
✅ 15-minute expiry on OTP codes
✅ Email validation before sending
✅ Error messages don't expose sensitive info
