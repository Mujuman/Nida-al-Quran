const Course = require('../models/Course');

const normalizeCourse = (course) => ({
  id: course._id,
  slug: course.slug,
  title: course.title,
  description: course.description,
  features: course.features,
  isActive: course.isActive,
  sortOrder: course.sortOrder,
});

exports.getPublicCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
    res.json(courses.map(normalizeCourse));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAdminCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ sortOrder: 1, createdAt: 1 });
    res.json(courses.map(normalizeCourse));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(normalizeCourse(course));
  } catch (err) {
    console.error(err.message);
    const status = err.code === 11000 || err.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ msg: status === 400 ? 'Invalid or duplicate course data' : 'Server error' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    res.json(normalizeCourse(course));
  } catch (err) {
    console.error(err.message);
    const status = err.code === 11000 || err.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ msg: status === 400 ? 'Invalid or duplicate course data' : 'Server error' });
  }
};

exports.archiveCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { isActive: false },
      { new: true }
    );
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    res.json(normalizeCourse(course));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
