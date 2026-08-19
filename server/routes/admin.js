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
  assignStudentToTeacher,
  getMyStudents,
  getAllAttendanceRecords,
  getProfile,
  updateProfile,
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
router.put('/users/:userId/status', adminAuth, updateUserStatus);
router.delete('/users/:userId', adminAuth, requireMainAdmin, deleteStudent);
router.post('/users/:userId/assign', adminAuth, requireMainAdmin, assignStudentToTeacher);

router.get('/sub-admins', adminAuth, requireMainAdmin, getAllSubAdmins);
router.post('/sub-admins/create', adminAuth, requireMainAdmin, createSubAdmin);
router.put('/sub-admins/:adminId', adminAuth, requireMainAdmin, updateSubAdmin);
router.delete('/sub-admins/:adminId', adminAuth, requireMainAdmin, deleteSubAdmin);

module.exports = router;
