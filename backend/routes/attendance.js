const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  markAttendance,
  getStudentAttendance,
  getAllAttendance,
  getAttendanceByCourse,
  bulkMarkAttendance,
  getAttendanceReport,
  deleteAttendance,
} = require('../controllers/attendanceController');

// All attendance routes require admin authentication
router.post('/mark', adminAuth, markAttendance);
router.post('/bulk', adminAuth, bulkMarkAttendance);
router.get('/student', adminAuth, getStudentAttendance);
router.get('/course', adminAuth, getAttendanceByCourse);
router.get('/report', adminAuth, getAttendanceReport);
router.get('/', adminAuth, getAllAttendance);
router.delete('/:id', adminAuth, deleteAttendance);

module.exports = router;
