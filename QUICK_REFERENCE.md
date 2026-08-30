# Quick Reference: Email System

## Email Configuration (.env)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mujuhusu@gmail.com
EMAIL_PASS=kyhhftteffrvqezl
EMAIL_FROM="Nida Al-Quran Support" <nida-support@nidaalquran.com>
```

## Email Types

| Event | Email Sent | Recipient | Function |
|-------|-----------|-----------|----------|
| Student Registers | OTP Code | Student | `sendVerificationOtpEmail()` |
| Email Verified | Admin Notification | Main Admins | `sendRegistrationNotification()` |
| Student Approved | Approval Email | Student | `sendApprovalNotification()` |
| Teacher Assigned | Assignment Email | Teacher | `sendAssignmentNotification()` |

## Status Codes & Logs

### 🟢 Success Indicators
```
✅ Email sent successfully via SMTP!
✅ OTP email sent successfully to [email]
✅ Approval email sent successfully to [email]
✅ User created in database
✅ Email verified successfully
```

### 🔴 Error Indicators
```
❌ Error sending email via fallback
❌ Invalid OTP for [email]
❌ Primary SMTP failed
```

### 🟡 Info Indicators
```
📤 Attempting to send email
📧 Sending [type] email
🔐 Generated OTP: [code]
🔄 Re-registering user
⏰ OTP has expired
📧 Using SMTP server
```

## API Endpoints for Testing

### 1. Register Student
```bash
POST /api/users/register
Content-Type: application/json

{
  "fullName": "Student Name",
  "email": "student@email.com",
  "password": "Pass@123",
  "phone": "1234567890",
  "course": "qaidah-tajweed"
}
```

### 2. Verify OTP
```bash
POST /api/users/verify-otp
Content-Type: application/json

{
  "email": "student@email.com",
  "otp": "123456"
}
```

### 3. Resend OTP
```bash
POST /api/users/resend-otp
Content-Type: application/json

{
  "email": "student@email.com"
}
```

### 4. Approve Student
```bash
PUT /api/admin/users/[STUDENT_ID]/status
Authorization: Bearer [ADMIN_TOKEN]
Content-Type: application/json

{
  "registrationStatus": "approved"
}
```

## Debugging Steps

### If OTP Email Not Received:
1. ✅ Check server logs for `✅ OTP email sent`
2. ✅ Verify EMAIL_USER and EMAIL_PASS in .env
3. ✅ Check Gmail app passwords (not regular password)
4. ✅ Look for Ethereal preview URL in logs
5. ✅ Check spam/junk folder

### If Approval Email Not Received:
1. ✅ Confirm registrationStatus changed to "approved"
2. ✅ Check server logs for approval email logs
3. ✅ Verify student email in database is correct
4. ✅ Look for Ethereal preview URL if SMTP fails

### Reading Ethereal Preview URLs:
If you see: `📧 Preview URL: https://ethereal.email/message/...`
- Open that URL in browser to view test email
- This means SMTP failed and fallback was used

## Files to Check

| File | Purpose |
|------|---------|
| `/server/utils/sendEmail.js` | Core email sending logic |
| `/server/utils/adminNotifications.js` | Email templates |
| `/server/controllers/userController.js` | Registration & verification |
| `/server/controllers/adminController.js` | Student approval |
| `/server/.env` | Email configuration |

## Email Templates Located In
`/server/utils/adminNotifications.js`

### Functions:
- `sendVerificationOtpEmail()` - 6-digit OTP with 15min timer
- `sendApprovalNotification()` - Login confirmation
- `sendRegistrationNotification()` - Admin notification
- `sendAssignmentNotification()` - Teacher assignment

## Logs Location
- Console output (development)
- Server terminal (production)
- Check for emoji indicators (✅ ❌ ⚠️ 📧 🔐)

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Email already exists" | Student already registered (check DB) |
| "Invalid OTP" | Wrong code entered or expired (resend) |
| "OTP expired" | 15 min window passed (use resend button) |
| Email not received | Check .env config, Gmail app password |
| Email in spam | Add sender to contacts, check SPF/DKIM |
| Ethereal emails only | SMTP credentials not configured in .env |

## Testing in Development

### Using Ethereal (Free, No Config Needed)
- Emails go to test account
- Preview URL logged to console
- Open URL to see email content
- Good for testing template design

### Using Gmail (Real Emails)
- Configure EMAIL_USER & EMAIL_PASS in .env
- Use 16-character app password
- Emails go to real inboxes
- Better for production testing

## Response Examples

### ✅ Successful Registration
```json
{
  "success": true,
  "requiresOtp": true,
  "msg": "Registration submitted! OTP sent.",
  "email": "student@example.com"
}
```

### ✅ Successful OTP Verification
```json
{
  "success": true,
  "msg": "Email verified! Pending admin approval.",
  "email": "student@example.com"
}
```

### ✅ Successful Approval
```json
{
  "success": true,
  "msg": "Student approved successfully.",
  "email": "student@example.com",
  "registrationStatus": "approved"
}
```

## Performance Notes
- OTP generation: ~1ms
- Email sending: 1-3 seconds (async, non-blocking)
- Ethereal setup: Lazy loading on first fallback
- Database save: ~50ms per transaction
