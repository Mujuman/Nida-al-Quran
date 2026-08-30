const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { requireMainAdmin } = require('../middleware/adminAuth');

const {
  adminLogin,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  deleteStudent,
  getDashboardStats,
  getAllSubAdmins,
  createSubAdmin,
  updateSubAdmin,
  deleteSubAdmin,
  deleteRejectedStudent,
  deleteRejectedStudents,
  toggleSubAdminStatus,
  resetSubAdminPassword,
  assignStudentToTeacher,
  getMyStudents,
  getAllAttendanceRecords,
  getProfile,
  updateProfile,
  getAllTeachers,
  getTeacherDetails,
  updateTeacher,
  activateTeacher,
  deactivateTeacher,
  deleteTeacher,
} = require('../controllers/adminController');

// ── Public ───────────────────────────────────────────────────
router.post('/login', adminLogin);

// ── All authenticated admins ─────────────────────────────────
router.get('/profile', adminAuth, getProfile);
router.put('/profile', adminAuth, updateProfile);
router.get('/dashboard/stats', adminAuth, getDashboardStats);
router.get('/users', adminAuth, getAllUsers);
router.get('/users/:userId', adminAuth, getUserDetails);
router.get('/my-students', adminAuth, getMyStudents);
router.get('/attendance/all', adminAuth, getAllAttendanceRecords);

// ── Main Admin only ───────────────────────────────────────────
router.put('/users/:userId/status', adminAuth, requireMainAdmin, updateUserStatus);
router.delete('/users/:userId', adminAuth, requireMainAdmin, deleteStudent);
router.post('/users/:userId/assign', adminAuth, requireMainAdmin, assignStudentToTeacher);

// Rejected Students Management (Main Admin)
router.delete('/users/:userId/rejected', adminAuth, requireMainAdmin, deleteRejectedStudent);
router.delete('/rejected-students/all', adminAuth, requireMainAdmin, deleteRejectedStudents);

// Sub-Admins Management (Main Admin)
router.get('/sub-admins', adminAuth, requireMainAdmin, getAllSubAdmins);
router.post('/sub-admins/create', adminAuth, requireMainAdmin, createSubAdmin);
router.put('/sub-admins/:adminId', adminAuth, requireMainAdmin, updateSubAdmin);
router.delete('/sub-admins/:adminId', adminAuth, requireMainAdmin, deleteSubAdmin);
router.patch('/sub-admins/:adminId/toggle-status', adminAuth, requireMainAdmin, toggleSubAdminStatus);
router.put('/sub-admins/:adminId/reset-password', adminAuth, requireMainAdmin, resetSubAdminPassword);

// Teacher Account Management (Main Admin only)
router.get('/teachers', adminAuth, requireMainAdmin, getAllTeachers);
router.get('/teachers/:teacherId', adminAuth, requireMainAdmin, getTeacherDetails);
router.put('/teachers/:teacherId', adminAuth, requireMainAdmin, updateTeacher);
router.patch('/teachers/:teacherId/activate', adminAuth, requireMainAdmin, activateTeacher);
router.patch('/teachers/:teacherId/deactivate', adminAuth, requireMainAdmin, deactivateTeacher);
router.delete('/teachers/:teacherId', adminAuth, requireMainAdmin, deleteTeacher);

module.exports = router;
