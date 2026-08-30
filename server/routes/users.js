const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  verifyEmail,
  loginUser, 
  getAllUsers, 
  getUserById, 
  updateUser, 
  getStatistics,
  getMyProfile,
  updateMyProfile,
  getMyAttendance,
  getMyCourses,
  getMyTeacher
} = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', registerUser);
router.get('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.get('/stats', getStatistics);

// Student Authenticated Routes
router.get('/me', auth, getMyProfile);
router.put('/me', auth, updateMyProfile);
router.get('/me/attendance', auth, getMyAttendance);
router.get('/me/courses', auth, getMyCourses);
router.get('/me/teacher', auth, getMyTeacher);

router.get('/', auth, getAllUsers);
router.get('/:id', auth, getUserById);
router.put('/:id', auth, updateUser);

module.exports = router;

