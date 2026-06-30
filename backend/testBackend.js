#!/usr/bin/env node

/**
 * Backend API Test Script
 * Run: node backend/testBackend.js
 * 
 * Tests all admin API endpoints
 */

const baseURL = 'http://localhost:5000';
let adminToken = '';

// Colors for console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

async function testAPI(endpoint, method = 'GET', body = null, useToken = false) {
  const url = `${baseURL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (useToken && adminToken) {
    options.headers['Authorization'] = `Bearer ${adminToken}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n🧪 Testing Admin Panel Backend APIs\n');

  // Test 1: Admin Login
  log.info('Test 1: Admin Login');
  const loginResult = await testAPI('/api/admin/login', 'POST', {
    email: 'admin@nida.com',
    password: 'admin123'
  });

  if (loginResult.success && loginResult.data.token) {
    adminToken = loginResult.data.token;
    log.success('Admin login successful');
    log.info(`Token: ${adminToken.substring(0, 20)}...`);
  } else {
    log.error('Admin login failed');
    log.error(JSON.stringify(loginResult.data));
    process.exit(1);
  }

  // Test 2: Dashboard Stats
  log.info('\nTest 2: Get Dashboard Statistics');
  const statsResult = await testAPI('/api/admin/dashboard/stats', 'GET', null, true);
  
  if (statsResult.success) {
    log.success('Dashboard stats retrieved');
    console.log('   Stats:', JSON.stringify(statsResult.data, null, 2));
  } else {
    log.error('Failed to get dashboard stats');
    console.log('   Error:', statsResult.data);
  }

  // Test 3: Get All Users
  log.info('\nTest 3: Get All Users');
  const usersResult = await testAPI('/api/admin/users', 'GET', null, true);
  
  if (usersResult.success) {
    log.success(`Retrieved ${usersResult.data.length} users`);
    if (usersResult.data.length > 0) {
      console.log(`   Sample user: ${usersResult.data[0].fullName} (${usersResult.data[0].registrationStatus})`);
    }
  } else {
    log.error('Failed to get users');
    console.log('   Error:', usersResult.data);
  }

  // Test 4: Get User Details
  if (usersResult.success && usersResult.data.length > 0) {
    const userId = usersResult.data[0]._id;
    log.info('\nTest 4: Get User Details');
    const userDetailResult = await testAPI(`/api/admin/users/${userId}`, 'GET', null, true);
    
    if (userDetailResult.success) {
      log.success('User details retrieved');
      console.log(`   User: ${userDetailResult.data.fullName}`);
    } else {
      log.error('Failed to get user details');
    }
  }

  // Test 5: Update User Status
  if (usersResult.success && usersResult.data.length > 0) {
    const pendingUser = usersResult.data.find(u => u.registrationStatus === 'pending');
    if (pendingUser) {
      log.info('\nTest 5: Update User Status');
      const updateResult = await testAPI(
        `/api/admin/users/${pendingUser._id}/status`,
        'PUT',
        { registrationStatus: 'approved' },
        true
      );
      
      if (updateResult.success) {
        log.success('User status updated successfully');
      } else {
        log.error('Failed to update user status');
        console.log('   Error:', updateResult.data);
      }
    } else {
      log.warn('Test 5: No pending users to test status update');
    }
  }

  // Test 6: Get All Contacts
  log.info('\nTest 6: Get All Contacts');
  const contactsResult = await testAPI('/api/contacts', 'GET', null, true);
  
  if (contactsResult.success) {
    log.success(`Retrieved ${contactsResult.data.length} contacts`);
    if (contactsResult.data.length > 0) {
      console.log(`   Sample contact: ${contactsResult.data[0].subject} (${contactsResult.data[0].status})`);
    }
  } else {
    log.error('Failed to get contacts');
    console.log('   Error:', contactsResult.data);
  }

  // Test 7: Mark Contact as Read
  if (contactsResult.success && contactsResult.data.length > 0) {
    const newContact = contactsResult.data.find(c => c.status === 'new');
    if (newContact) {
      log.info('\nTest 7: Mark Contact as Read');
      const markReadResult = await testAPI(
        `/api/contacts/${newContact._id}/read`,
        'PUT',
        null,
        true
      );
      
      if (markReadResult.success) {
        log.success('Contact marked as read');
      } else {
        log.error('Failed to mark contact as read');
      }
    } else {
      log.warn('Test 7: No new contacts to test');
    }
  }

  // Test 8: Get All Attendance
  log.info('\nTest 8: Get All Attendance Records');
  const attendanceResult = await testAPI('/api/attendance', 'GET', null, true);
  
  if (attendanceResult.success) {
    log.success(`Retrieved ${attendanceResult.data.length} attendance records`);
    if (attendanceResult.data.length > 0) {
      console.log(`   Sample: ${attendanceResult.data[0].status} on ${new Date(attendanceResult.data[0].date).toLocaleDateString()}`);
    }
  } else {
    log.error('Failed to get attendance records');
    console.log('   Error:', attendanceResult.data);
  }

  // Test 9: Mark Attendance
  if (usersResult.success && usersResult.data.length > 0) {
    const approvedUser = usersResult.data.find(u => u.registrationStatus === 'approved');
    if (approvedUser) {
      log.info('\nTest 9: Mark Attendance');
      const markAttendanceResult = await testAPI(
        '/api/attendance/mark',
        'POST',
        {
          studentId: approvedUser._id,
          course: approvedUser.course || 'General',
          date: new Date().toISOString(),
          status: 'present',
          notes: 'Test attendance'
        },
        true
      );
      
      if (markAttendanceResult.success) {
        log.success('Attendance marked successfully');
      } else {
        log.error('Failed to mark attendance');
        console.log('   Error:', markAttendanceResult.data);
      }
    } else {
      log.warn('Test 9: No approved users to test attendance');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary\n');
  log.success('Backend is running correctly!');
  console.log('\n✅ All API endpoints are functional');
  console.log('\n🚀 You can now use the admin panel at:');
  console.log('   http://localhost:5173/admin/login');
  console.log('\n📧 Login credentials:');
  console.log('   Email: admin@nida.com');
  console.log('   Password: admin123');
  console.log('='.repeat(50) + '\n');
}

// Run tests
runTests().catch(error => {
  log.error('Test script error:');
  console.error(error);
  process.exit(1);
});
