# Verification Checklist - Email & Teacher Management System

## ✅ Email System Verification

### Registration & OTP
- [ ] Student registers with email
- [ ] Check server logs: `✅ OTP email sent successfully`
- [ ] Student receives OTP email (or check Ethereal preview URL)
- [ ] OTP is 6 digits
- [ ] OTP email contains 15-minute timer
- [ ] Resend OTP button works
- [ ] New OTP generated on resend

### Email Verification
- [ ] Student enters correct OTP
- [ ] Verification succeeds with message: "Email verified! Pending admin approval"
- [ ] Check server logs: `✅ Email verified successfully`
- [ ] Check server logs: `📧 Sending registration notification to main admins...`
- [ ] Admin receives notification email
- [ ] Student cannot login before approval

### Student Approval
- [ ] Main admin opens admin dashboard
- [ ] Main admin finds student in list
- [ ] Main admin clicks Approve
- [ ] Student registration status changes to "approved"
- [ ] Check server logs: `✅ Approval email sent successfully`
- [ ] Student receives approval email
- [ ] Student can now login to portal
- [ ] Approval email contains login link
- [ ] Approval email contains course information

### Error Handling
- [ ] Resend OTP when expired (over 15 mins)
- [ ] Invalid OTP rejected with error message
- [ ] Cannot verify same email twice
- [ ] Cannot approve non-existent student
- [ ] Graceful fallback if SMTP fails

---

## ✅ Teacher Management (Main Admin Only)

### Teacher Creation
- [ ] Main admin can create new teacher (sub-admin)
- [ ] Teacher assigned courses during creation
- [ ] Teacher receives welcome notification email
- [ ] Cannot create teacher without courses
- [ ] Email must be unique

### Teacher Listing
- [ ] Main admin can view all teachers
- [ ] Teacher list shows: name, email, status, assigned students
- [ ] Can search/filter teachers
- [ ] Sub-admins cannot access this page

### Teacher Details
- [ ] Main admin can view individual teacher profile
- [ ] Shows: name, email, phone, courses, assigned students
- [ ] Shows active/inactive status
- [ ] Shows creation date
- [ ] Sub-admins cannot view other teachers

### Teacher Update
- [ ] Can update teacher name
- [ ] Can update teacher phone
- [ ] Can update assigned courses
- [ ] Can change teacher password
- [ ] Can update teacher email
- [ ] Email uniqueness validated
- [ ] Changes saved to database
- [ ] Sub-admins cannot update teachers

### Teacher Activation/Deactivation
- [ ] Main admin can activate inactive teacher
- [ ] Main admin can deactivate active teacher
- [ ] Check status in teacher list updates
- [ ] Inactive teachers cannot login
- [ ] Deactivation doesn't delete assigned students
- [ ] Reactivation restores login access

### Teacher Deletion
- [ ] Main admin can delete teacher account
- [ ] Confirmation dialog appears before delete
- [ ] All students unassigned automatically
- [ ] Students not deleted, only unassigned
- [ ] Attendance records not deleted
- [ ] Teacher removed from system

### Access Control
- [ ] Sub-admins cannot create teachers
- [ ] Sub-admins cannot view teacher list
- [ ] Sub-admins cannot modify teacher accounts
- [ ] Sub-admins cannot activate/deactivate teachers
- [ ] Sub-admins cannot delete teachers
- [ ] Only main admin can access teacher endpoints

---

## ✅ Database Verification

### User Collection
- [ ] `isVerified` field updated when OTP verified
- [ ] `verificationOtp` field stores 6-digit code
- [ ] `verificationOtpExpires` is 15 minutes from creation
- [ ] `registrationStatus` changes: pending → approved
- [ ] `registrationStatus` can also be: rejected
- [ ] OTP fields cleared after verification

### Admin Collection (Teachers)
- [ ] `role` is "sub_admin" for teachers
- [ ] `isActive` controls login access
- [ ] `assignedStudents` array for student IDs
- [ ] `assignedCourses` array for course slugs
- [ ] `createdBy` links to main admin who created

### Audit Fields
- [ ] `createdAt` timestamp set on creation
- [ ] `updatedAt` timestamp updated on changes
- [ ] `lastLogin` tracks last login time

---

## ✅ Email Configuration Verification

### Environment Variables
- [ ] `EMAIL_HOST` is set to `smtp.gmail.com`
- [ ] `EMAIL_PORT` is set to `587`
- [ ] `EMAIL_USER` is valid Gmail address
- [ ] `EMAIL_PASS` is 16-character app password (not regular password)
- [ ] `EMAIL_FROM` contains valid sender info

### Gmail App Password Setup
- [ ] Gmail 2-Factor Authentication enabled
- [ ] App password generated at myaccount.google.com/apppasswords
- [ ] App password is 16 characters (with spaces)
- [ ] Spaces removed before using in .env

### Email Service Status
- [ ] SMTP connection successful (check logs)
- [ ] If SMTP fails, fallback to Ethereal works
- [ ] Ethereal preview URLs appear in logs when fallback used
- [ ] Email templates render correctly

---

## ✅ API Endpoint Verification

### User Registration
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@test.com","password":"Pass@123"}'
```
- [ ] Returns 200 OK
- [ ] Response has `success: true`
- [ ] Response has `requiresOtp: true`
- [ ] Email address in response

### Verify OTP
```bash
curl -X POST http://localhost:5000/api/users/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","otp":"123456"}'
```
- [ ] Returns 200 OK with correct OTP
- [ ] Returns 400 with incorrect OTP
- [ ] Returns 400 with expired OTP

### Resend OTP
```bash
curl -X POST http://localhost:5000/api/users/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'
```
- [ ] Returns 200 OK
- [ ] New OTP generated
- [ ] Email sent again

### Approve Student
```bash
curl -X PUT http://localhost:5000/api/admin/users/[ID]/status \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"registrationStatus":"approved"}'
```
- [ ] Returns 200 OK
- [ ] Status updated in response
- [ ] Email sent to student

### Teacher Management
- [ ] GET /api/admin/teachers - Lists all teachers
- [ ] GET /api/admin/teachers/[ID] - Gets teacher details
- [ ] PUT /api/admin/teachers/[ID] - Updates teacher
- [ ] PATCH /api/admin/teachers/[ID]/activate - Activates teacher
- [ ] PATCH /api/admin/teachers/[ID]/deactivate - Deactivates teacher
- [ ] DELETE /api/admin/teachers/[ID] - Deletes teacher

---

## ✅ Logging Verification

### Registration Logs
```
📝 New registration attempt for email: [email]
🔐 Generated OTP: [code] (expires in 15 mins)
✅ User created in database: [email]
📧 Sending OTP verification email to [email]...
✅ OTP email sent successfully to [email]
```

### Verification Logs
```
🔍 Verifying OTP for email: [email]
✅ Email verified successfully for [email]
📧 Sending registration notification to main admins...
```

### Approval Logs
```
📧 Sending approval email to [email]...
📤 Attempting to send email to [email]...
✅ Email sent successfully via SMTP!
✅ Approval email sent successfully to [email]
```

### Error Logs
```
❌ Error sending approval email: [error]
⚠️ Primary SMTP failed: [error]
✅ Email sent via Ethereal fallback
📧 Preview URL: https://ethereal.email/message/...
```

---

## ✅ Frontend Integration Verification

### Registration Form
- [ ] Shows email input field
- [ ] Shows password input field
- [ ] Submit button sends to correct endpoint
- [ ] Shows success message after registration
- [ ] Directs to OTP verification step

### OTP Verification Form
- [ ] Shows OTP input field (6 digits)
- [ ] Shows resend button
- [ ] Resend button disabled initially (or after sending)
- [ ] Submit button verifies OTP
- [ ] Shows error for wrong OTP
- [ ] Shows error for expired OTP

### Admin Dashboard
- [ ] Main admin sees teacher management menu
- [ ] Sub-admin does NOT see teacher management menu
- [ ] Teacher list displays all teachers
- [ ] Can click to view teacher details
- [ ] Can edit teacher information
- [ ] Can activate/deactivate teachers
- [ ] Can delete teachers
- [ ] Confirmation dialogs appear before destructive actions

---

## ✅ Security Verification

### Password Security
- [ ] Passwords never logged
- [ ] Passwords hashed with bcrypt
- [ ] Minimum 6 characters enforced
- [ ] Password changed requires current password verification

### OTP Security
- [ ] OTP never logged in plaintext
- [ ] OTP expires in exactly 15 minutes
- [ ] OTP is 6 digits (numeric only)
- [ ] Cannot reuse same OTP after verification
- [ ] OTP cleared from database after use

### Access Control
- [ ] Token required for admin endpoints
- [ ] Main admin role checked for teacher endpoints
- [ ] Sub-admins cannot access teacher management
- [ ] Students cannot access admin endpoints
- [ ] Teachers cannot access main admin features

### Email Security
- [ ] Email addresses validated
- [ ] Duplicate emails prevented
- [ ] Email case-insensitive matching
- [ ] Sensitive data not in error messages

---

## ✅ Performance Verification

### Speed Tests
- [ ] Registration completes within 2 seconds
- [ ] OTP verification completes within 1 second
- [ ] Approval completes within 1 second
- [ ] Email send doesn't block response (async)
- [ ] Multiple simultaneous registrations work

### Database Tests
- [ ] Queries optimized (use indexes)
- [ ] No N+1 queries in loops
- [ ] Connections properly closed
- [ ] Memory usage stable

### Email Throughput
- [ ] Can send multiple emails simultaneously
- [ ] No SMTP connection pool exhaustion
- [ ] Fallback to Ethereal doesn't crash system

---

## ✅ Error Handling Verification

### Validation Errors
- [ ] Missing email field: clear error message
- [ ] Missing password field: clear error message
- [ ] Invalid email format: clear error message
- [ ] Short password (< 6 chars): clear error message
- [ ] Missing OTP: clear error message

### Business Logic Errors
- [ ] Duplicate email registration: specific error
- [ ] Already verified email: handled gracefully
- [ ] Invalid OTP: specific error
- [ ] Expired OTP: specific error with resend option
- [ ] Already approved: appropriate message

### Server Errors
- [ ] 500 errors include helpful context
- [ ] Database connection errors handled
- [ ] Email sending errors don't crash app
- [ ] Graceful degradation on SMTP failure

---

## ✅ Documentation Verification

- [ ] EMAIL_VERIFICATION_GUIDE.md exists and is complete
- [ ] EMAIL_FIXES_SUMMARY.md exists and is detailed
- [ ] QUICK_REFERENCE.md exists and is easy to use
- [ ] IMPLEMENTATION_SUMMARY.md exists and is comprehensive
- [ ] All files include examples and troubleshooting

---

## 🎯 Final Sign-Off

### Development Environment
- [ ] All tests passed locally
- [ ] No console errors
- [ ] No console warnings
- [ ] All emails sent/received

### Code Review
- [ ] No hardcoded credentials
- [ ] No sensitive data logged
- [ ] Error handling comprehensive
- [ ] Code follows project style
- [ ] Comments where needed
- [ ] No dead code

### Ready for Production
- [ ] All checklist items completed
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation complete
- [ ] Error handling robust

---

**Date Verified**: _______________
**Verified By**: _______________
**Environment**: [ ] Development [ ] Staging [ ] Production

---

## Notes
_Add any additional notes or findings here:_

_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________

---

✅ **SYSTEM READY FOR DEPLOYMENT**
