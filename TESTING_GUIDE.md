# Admin Panel Testing Guide

## 🧪 Complete Testing Checklist

### Prerequisites
1. MongoDB is running
2. Backend server is running on port 5000
3. Frontend is running on port 5173
4. Admin account exists in database

## 📋 Test Scenarios

### 1. Authentication Tests

#### Test 1.1: Admin Login
- [ ] Navigate to `http://localhost:5173/admin/login`
- [ ] Enter email: `admin@nida.com`
- [ ] Enter password: `admin123`
- [ ] Click "Login"
- **Expected**: Redirect to `/admin/dashboard`
- **Expected**: See dashboard with stats

#### Test 1.2: Invalid Login
- [ ] Try with wrong credentials
- **Expected**: Error message "Invalid admin credentials"

#### Test 1.3: Logout
- [ ] Click "Logout" button in header
- **Expected**: Redirect to `/admin/login`
- **Expected**: Token removed from localStorage

---

### 2. Dashboard Tests

#### Test 2.1: Statistics Display
- [ ] View dashboard page
- **Expected**: See 6 stat cards with numbers:
  - Total Users
  - Pending Registrations
  - Approved Registrations
  - Total Messages
  - New Messages
  - Monthly Attendance

#### Test 2.2: Interactive Stats Cards
- [ ] Click on "Pending" stat card
- **Expected**: Navigate to Users tab with "pending" filter applied

- [ ] Click on "New Messages" stat card
- **Expected**: Navigate to Contacts tab with "new" filter applied

#### Test 2.3: Recent Activity
- [ ] Scroll to "Recent Activity" section
- **Expected**: See activity feed with pending items

---

### 3. User Management Tests

#### Test 3.1: View All Users
- [ ] Click "Manage Users" in sidebar
- **Expected**: See table with all registered users
- **Expected**: Table shows: name, email, phone, course, level, status

#### Test 3.2: Search Users
- [ ] Type a name in search box
- **Expected**: Table filters to matching users in real-time

#### Test 3.3: Filter by Status
- [ ] Select "Pending" from status dropdown
- **Expected**: Only pending users displayed
- [ ] Select "Approved"
- **Expected**: Only approved users displayed

#### Test 3.4: View User Details
- [ ] Click eye icon on any user
- **Expected**: Modal opens with complete user information
- **Expected**: See all fields (name, email, phone, age, gender, course, etc.)

#### Test 3.5: Approve User
- [ ] Find a pending user
- [ ] Click green checkmark (Approve)
- **Expected**: Success message "User approved successfully"
- **Expected**: User status changes to "approved"
- **Expected**: Stats update immediately

#### Test 3.6: Reject User
- [ ] Find a pending user
- [ ] Click red X (Reject)
- **Expected**: Success message "User rejected successfully"
- **Expected**: User status changes to "rejected"

#### Test 3.7: Approve from Details Modal
- [ ] Open a pending user's details
- [ ] Click "Approve User" button
- **Expected**: User approved
- **Expected**: Modal closes
- **Expected**: Table updates

---

### 4. Contact Management Tests

#### Test 4.1: View All Messages
- [ ] Click "Messages" in sidebar
- **Expected**: See grid of contact cards
- **Expected**: Each card shows subject, sender, message, status

#### Test 4.2: Search Messages
- [ ] Type in search box
- **Expected**: Cards filter by name or subject

#### Test 4.3: Filter by Status
- [ ] Select "New" from dropdown
- **Expected**: Only new messages shown (blue highlight)
- [ ] Select "Replied"
- **Expected**: Only replied messages shown

#### Test 4.4: Mark as Read
- [ ] Find a "new" message
- [ ] Click "Mark Read" button
- **Expected**: Status changes to "read"
- **Expected**: Blue highlight removed
- **Expected**: Stats update

#### Test 4.5: Reply to Message
- [ ] Click "Reply" button on any message
- **Expected**: Reply modal opens
- **Expected**: See original message and sender info
- [ ] Type a reply in textarea
- [ ] Click "Send Reply"
- **Expected**: Success message "Reply sent successfully"
- **Expected**: Message status changes to "replied"
- **Expected**: Reply appears in message card

#### Test 4.6: Delete Message
- [ ] Click "Delete" button on any message
- **Expected**: Confirmation dialog appears
- [ ] Confirm deletion
- **Expected**: Success message "Message deleted successfully"
- **Expected**: Message removed from list
- **Expected**: Stats update

---

### 5. Attendance Management Tests

#### Test 5.1: View Attendance Page
- [ ] Click "Attendance" in sidebar
- **Expected**: See attendance management interface
- **Expected**: Date picker shows today's date
- **Expected**: Course dropdown available

#### Test 5.2: Select Date
- [ ] Click date picker
- [ ] Select a different date
- **Expected**: Date updates
- **Expected**: Table reflects selected date

#### Test 5.3: Filter by Course
- [ ] Select "Quran Recitation" from course dropdown
- **Expected**: Only students in that course shown

#### Test 5.4: Mark Present
- [ ] Click "Present" button for a student
- **Expected**: Success message "Attendance marked successfully"
- **Expected**: Button feedback
- **Expected**: Database updated

#### Test 5.5: Mark Absent
- [ ] Click "Absent" button for a student
- **Expected**: Attendance recorded as absent

#### Test 5.6: Mark Late
- [ ] Click "Late" button for a student
- **Expected**: Attendance recorded as late

#### Test 5.7: Mark Excused
- [ ] Click "Excused" button for a student
- **Expected**: Attendance recorded as excused

#### Test 5.8: Only Approved Students
- **Expected**: Only students with "approved" status appear in attendance table

---

### 6. Responsive Design Tests

#### Test 6.1: Mobile View (< 768px)
- [ ] Resize browser to mobile size
- **Expected**: Sidebar hidden by default
- **Expected**: Hamburger menu appears
- [ ] Click hamburger menu
- **Expected**: Sidebar slides in from left
- **Expected**: Stats cards stack vertically

#### Test 6.2: Tablet View (768px - 1024px)
- [ ] Resize to tablet width
- **Expected**: Layout adapts appropriately
- **Expected**: All features remain accessible

#### Test 6.3: Desktop View (> 1024px)
- [ ] View on large screen
- **Expected**: Optimal spacing and layout
- **Expected**: Sidebar always visible

---

### 7. Error Handling Tests

#### Test 7.1: Network Error Simulation
- [ ] Stop backend server
- [ ] Try to load users
- **Expected**: Error message displayed
- **Expected**: Graceful error handling

#### Test 7.2: Invalid Data
- [ ] Try operations with missing data
- **Expected**: Validation messages

#### Test 7.3: Concurrent Operations
- [ ] Approve multiple users quickly
- **Expected**: All operations complete successfully
- **Expected**: No race conditions

---

### 8. Data Persistence Tests

#### Test 8.1: Page Refresh
- [ ] Perform actions (approve user, mark attendance)
- [ ] Refresh page
- **Expected**: Changes persist
- **Expected**: Stats remain accurate

#### Test 8.2: Session Persistence
- [ ] Login as admin
- [ ] Close tab
- [ ] Open new tab and navigate to `/admin/dashboard`
- **Expected**: Still logged in
- **Expected**: Token valid

#### Test 8.3: Logout Cleanup
- [ ] Logout
- [ ] Check localStorage
- **Expected**: adminToken removed

---

### 9. UI/UX Tests

#### Test 9.1: Loading States
- [ ] Navigate between tabs
- **Expected**: "Loading..." messages appear while fetching

#### Test 9.2: Empty States
- [ ] Clear all filters with no results
- **Expected**: "No users found" or "No messages found" message
- **Expected**: Appropriate icon displayed

#### Test 9.3: Success Notifications
- [ ] Perform any action
- **Expected**: Success alert appears top-right
- **Expected**: Auto-dismisses after 3 seconds
- **Expected**: Green background for success

#### Test 9.4: Error Notifications
- [ ] Trigger an error
- **Expected**: Error alert appears
- **Expected**: Red background
- **Expected**: Clear error message

#### Test 9.5: Modal Interactions
- [ ] Open user details modal
- [ ] Click outside modal
- **Expected**: Modal closes
- [ ] Open modal again
- [ ] Click X button
- **Expected**: Modal closes

---

### 10. Integration Tests

#### Test 10.1: Full User Lifecycle
- [ ] New user registers via `/register`
- [ ] Check admin panel - user appears as "pending"
- [ ] Admin approves user
- [ ] User status changes to "approved"
- [ ] Mark attendance for user
- [ ] Verify attendance record created

#### Test 10.2: Full Contact Lifecycle
- [ ] User submits contact form
- [ ] Check admin panel - message appears as "new"
- [ ] Admin marks as read
- [ ] Admin replies to message
- [ ] Message status becomes "replied"
- [ ] Admin deletes message
- [ ] Message removed from system

---

## 🎯 Expected Results Summary

### All Tests Should Show:
✅ Real-time data updates
✅ Smooth animations and transitions
✅ No console errors
✅ Proper error handling
✅ Responsive design working
✅ All CRUD operations functional
✅ Database synchronization
✅ Session management
✅ User-friendly notifications

---

## 🐛 Bug Reporting Template

If you find any issues:

```
**Test**: [Test number and name]
**Steps**: [What you did]
**Expected**: [What should happen]
**Actual**: [What actually happened]
**Browser**: [Browser and version]
**Console Errors**: [Any errors in console]
```

---

## ✅ Testing Completion Checklist

- [ ] All authentication tests passed
- [ ] Dashboard displays correctly
- [ ] User management fully functional
- [ ] Contact management working
- [ ] Attendance marking operational
- [ ] Responsive design verified
- [ ] Error handling appropriate
- [ ] Data persists correctly
- [ ] UI/UX smooth and intuitive
- [ ] Integration tests successful

---

## 📊 Performance Benchmarks

Expected load times:
- Dashboard: < 1 second
- User table: < 2 seconds
- Contact messages: < 2 seconds
- Attendance page: < 1 second
- Modal open: < 0.3 seconds

---

## 🚀 Ready for Production!

Once all tests pass, the admin panel is ready for production deployment.
