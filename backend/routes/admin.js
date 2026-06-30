const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  adminLogin,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  getDashboardStats,
  getAllAdmins,
  createAdmin,
} = require('../controllers/adminController');

// Admin login (no auth required)
router.post('/login', adminLogin);

// All routes below require admin authentication
router.get('/dashboard/stats', adminAuth, getDashboardStats);
router.get('/users', adminAuth, getAllUsers);
router.get('/users/:userId', adminAuth, getUserDetails);
router.put('/users/:userId/status', adminAuth, updateUserStatus);

// Admin management (super admin only)
router.get('/admins', adminAuth, getAllAdmins);
router.post('/admins/create', adminAuth, createAdmin);

module.exports = router;
