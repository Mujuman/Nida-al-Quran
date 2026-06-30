# Nida Al-Quran - Complete Admin & Database Setup Guide

## 📋 What's New

### New Database Collections
1. **Admin** - Admin users with role-based permissions
2. **Contact** - Contact form submissions with admin replies
3. **Attendance** - Student attendance tracking

### New Admin Features
- Admin Dashboard with stats overview
- User management (approve/reject registrations)
- Contact message management
- Attendance tracking and reporting
- Admin authentication with JWT tokens

### Frontend Updates
- Admin login page
- Admin dashboard with responsive design
- Contact form that saves to database
- Updated navigation with admin button

## 🔐 Admin Authentication

### Default Admin Credentials

To create default admin users, run the seeding script:

```bash
node seed.js
```

This creates:
- **Admin User**
  - Email: `admin@nida.com`
  - Password: `admin123`
  - Role: Full admin access

- **Teacher User**
  - Email: `teacher@nida.com`
  - Password: `teacher123`
  - Role: Can manage attendance and view reports

### Login

1. Click the "Admin" button in the navigation
2. Enter credentials
3. Access the admin dashboard

## 📊 Admin Dashboard Overview

### Dashboard Tab
Shows real-time statistics:
- Total registered users
- Pending registrations
- Approved registrations
- Total contact messages
- New unread messages
- Monthly attendance records

### Manage Users Tab
- View all registered students
- See student details (name, email, course, status)
- Approve or reject pending registrations
- View individual student details
- Update student registration status

### Messages Tab
- View all contact submissions
- Filter by status (new, read, replied, closed)
- Filter by type (inquiry, complaint, suggestion, registration)
- Reply to messages
- Mark as spam
- Delete messages

### Attendance Tab
- Mark student attendance
- Bulk mark attendance by course
- Generate attendance reports
- View student attendance history
- Calculate attendance percentages

## 📝 Database Schema

### Admin Model
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed),
  fullName: String,
  role: String (admin, teacher, moderator),
  phone: String,
  permissions: {
    manageUsers: Boolean,
    manageAttendance: Boolean,
    manageCourses: Boolean,
    viewReports: Boolean,
    manageAdmins: Boolean,
  },
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date,
}
```

### Contact Model
```javascript
{
  fullName: String (required),
  email: String (required),
  phone: String,
  subject: String (required),
  message: String (required),
  type: String (inquiry, complaint, suggestion, registration),
  status: String (new, read, replied, closed),
  reply: String,
  repliedBy: ObjectId (ref: Admin),
  repliedAt: Date,
  isSpam: Boolean,
  createdAt: Date,
  updatedAt: Date,
}
```

### Attendance Model
```javascript
{
  student: ObjectId (ref: User, required),
  course: String (required),
  date: Date (required),
  status: String (present, absent, late, excused),
  notes: String,
  recordedBy: ObjectId (ref: Admin),
  markedAt: Date,
  createdAt: Date,
  updatedAt: Date,
}
```

## 🔌 API Endpoints

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:userId` - Get user details
- `PUT /api/admin/users/:userId/status` - Update user registration status

### Contact Endpoints
- `POST /api/contacts` - Submit contact form (public)
- `GET /api/contacts` - Get all messages (admin only)
- `GET /api/contacts/:id` - Get message details (admin only)
- `PUT /api/contacts/:id/reply` - Reply to message (admin only)
- `PUT /api/contacts/:id/read` - Mark as read (admin only)
- `PUT /api/contacts/:id/spam` - Toggle spam status (admin only)
- `DELETE /api/contacts/:id` - Delete message (admin only)

### Attendance Endpoints
- `POST /api/attendance/mark` - Mark single attendance (admin only)
- `POST /api/attendance/bulk` - Mark bulk attendance (admin only)
- `GET /api/attendance/student` - Get student attendance record (admin only)
- `GET /api/attendance/course` - Get attendance by course (admin only)
- `GET /api/attendance/report` - Get attendance report (admin only)
- `GET /api/attendance` - Get all attendance records (admin only)
- `DELETE /api/attendance/:id` - Delete attendance record (admin only)

## 🚀 Usage Examples

### Frontend - Submit Contact Form

```javascript
import { apiService } from './services/apiService';

const contactData = {
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '+251911234567',
  subject: 'Course Inquiry',
  message: 'I want to learn Quran',
  type: 'inquiry'
};

const response = await apiService.submitContact(contactData);
```

### Frontend - Get Dashboard Stats

```javascript
const stats = await apiService.getDashboardStats();
// Returns: {
//   totalUsers: 45,
//   pendingRegistrations: 12,
//   approvedRegistrations: 33,
//   totalContacts: 28,
//   newContacts: 5,
//   monthlyAttendance: 150
// }
```

### Frontend - Mark Attendance

```javascript
const attendanceData = {
  studentId: '507f1f77bcf86cd799439011',
  course: 'quran-recitation',
  date: '2024-06-30',
  status: 'present',
  notes: 'Good performance'
};

const response = await apiService.markAttendance(attendanceData);
```

## 🔒 Security Notes

### Authentication
- All admin routes are protected by `adminAuth` middleware
- Tokens are JWT-based with 7-day expiration
- Tokens can be sent via:
  - `x-auth-token` header (legacy)
  - `Authorization: Bearer <token>` header (recommended)

### Token Management
```javascript
// Save admin token
apiService.saveToken(response.token, true);

// Get admin token
const token = apiService.getToken(true);

// Check if admin authenticated
if (apiService.isAuthenticated(true)) {
  // Redirect to dashboard
}

// Logout
apiService.clearToken(true);
```

### CORS Configuration
Frontend can make requests to backend at `http://localhost:5000`
In production, update CORS settings in `backend/server.js`

## 📱 Responsive Design

### Mobile Breakpoints
- Sidebar collapses on screens < 768px
- Hamburger menu appears
- Tables become scrollable
- Dashboard grid adjusts to single column

## 🛠️ Troubleshooting

### Admin Cannot Login
1. Check MongoDB is running
2. Run `node seed.js` to create admin user
3. Verify `.env` file has correct `JWT_SECRET`
4. Check browser console for error messages

### Token Expired
- User is automatically logged out
- Redirect to login page
- Login again to get new token

### Contact Form Not Saving
1. Check network tab in developer tools
2. Verify backend is running on port 5000
3. Check MongoDB connection
4. Check for CORS errors

### Attendance Not Marking
1. Verify student ID is correct
2. Check admin is authenticated
3. Verify attendance record doesn't already exist
4. Check MongoDB is accepting writes

## 📈 Next Steps

### Recommended Enhancements
1. **Email Notifications**
   - Send email when registration approved
   - Send email when contact replied

2. **Advanced Reporting**
   - Generate attendance PDF reports
   - Export student data to Excel
   - Custom date range filtering

3. **Student Portal**
   - Students can view their own attendance
   - Students can update their information
   - Students can check registration status

4. **Attendance QR Codes**
   - Generate QR codes for classes
   - Students scan to mark attendance
   - Automatic attendance marking

5. **Payment Integration**
   - Collect course fees
   - Payment status tracking
   - Invoice generation

6. **SMS/Email Templates**
   - Customizable notification templates
   - Bulk messaging to students
   - Automated reminders

## 📞 Support

For issues or questions:
1. Check server logs: Check terminal where backend is running
2. Check browser console: Press F12 to open developer tools
3. Check MongoDB logs: Monitor MongoDB connection
4. Review API response: Check network tab in developer tools

## 🎓 Demo Workflow

### 1. Register a Student
1. Go to home page
2. Click "ይመዝገቡ" (Register)
3. Fill in student information
4. Submit form
5. Data saved to MongoDB User collection

### 2. Admin Approves Registration
1. Click "Admin" button
2. Login with admin@nida.com / admin123
3. Go to "Manage Users" tab
4. Find pending student
5. Click "Approve" button
6. Student status updated to "approved"

### 3. Admin Marks Attendance
1. In Admin Dashboard
2. Go to "Attendance" tab
3. Select course and date
4. Mark students present/absent/late/excused
5. Submit attendance
6. Data saved to Attendance collection

### 4. Contact Form Usage
1. Go to Contact page
2. Fill in message details
3. Submit form
4. Message saved to Contact collection
5. Admin sees new message in dashboard
6. Admin replies to message
7. Contact status updated to "replied"

## 📚 Database Collections Summary

| Collection | Purpose | Records |
|-----------|---------|---------|
| users | Student registrations | Grows with registrations |
| admins | Admin accounts | Static (1-10 typically) |
| contacts | Contact form submissions | Grows over time |
| attendance | Attendance records | Grows daily during classes |

## ✅ Verification Checklist

- [ ] MongoDB running and connected
- [ ] Backend server started on port 5000
- [ ] Frontend dev server running on port 5173
- [ ] Admin user created (run seed.js)
- [ ] Can login to admin panel
- [ ] Can see dashboard stats
- [ ] Can submit contact form
- [ ] Can mark attendance
- [ ] All data persists in MongoDB

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Maintainer:** Nida Al-Quran Team
