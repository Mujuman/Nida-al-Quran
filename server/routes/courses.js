const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { requireMainAdmin } = require('../middleware/adminAuth');
const {
  getPublicCourses,
  getAdminCourses,
  createCourse,
  updateCourse,
  archiveCourse,
} = require('../controllers/courseController');

router.get('/', getPublicCourses);
router.get('/admin', adminAuth, requireMainAdmin, getAdminCourses);
router.post('/admin', adminAuth, requireMainAdmin, createCourse);
router.put('/admin/:courseId', adminAuth, requireMainAdmin, updateCourse);
router.delete('/admin/:courseId', adminAuth, requireMainAdmin, archiveCourse);

module.exports = router;
