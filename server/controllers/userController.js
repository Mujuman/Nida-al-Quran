const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendRegistrationNotification } = require('../utils/adminNotifications');

// Register user with full details
exports.registerUser = async (req, res) => {
  const {
    fullName, email, password, phone, age, gender, course, level, schedule,
    guardian, guardianPhone, guardianName, learningMedia, message,
  } = req.body;
  
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Create new user
    user = new User({
      fullName,
      email,
      password: hashedPassword,
      phone,
      age,
      gender,
      course,
      level,
      schedule,
      guardian: guardian || guardianName,
      guardianPhone: guardianPhone || req.body.guardian_phone,
      learningMedia,
      message,
      isVerified: false,
      registrationStatus: 'pending',
    });

    await user.save();
    await sendRegistrationNotification(user);

    // Generate token
    const payload = { user: { id: user.id } };
    const jwtSecret = process.env.JWT_SECRET || 'change-this-secret-in-production';
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        registrationStatus: user.registrationStatus,
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(400).json({ msg: 'Please register first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id } };
    const jwtSecret = process.env.JWT_SECRET || 'change-this-secret-in-production';
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields
    const { fullName, phone, age, gender, course, level, schedule, guardian, guardianPhone, learningMedia, message } = req.body;
    
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (course) user.course = course;
    if (level) user.level = level;
    if (schedule) user.schedule = schedule;
    if (guardian) user.guardian = guardian;
    if (guardianPhone) user.guardianPhone = guardianPhone;
    if (learningMedia) user.learningMedia = learningMedia;
    if (message) user.message = message;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get statistics for dashboard
exports.getStatistics = async (req, res) => {
  try {
    // Count all registered students
    const totalStudents = await User.countDocuments();

    // Count active teachers (sub_admin)
    const professionalTeachers = await Admin.countDocuments({ 
      role: 'sub_admin',
      isActive: true 
    });

    // Count unique courses from users
    const uniqueCourses = await User.distinct('course');
    const courseCount = uniqueCourses.filter(course => course).length;

    // Calculate years of experience (from creation of first admin/center start)
    const firstAdmin = await Admin.findOne().sort({ createdAt: 1 });
    let yearsOfExperience = 10; // Default fallback
    if (firstAdmin) {
      const startDate = new Date(firstAdmin.createdAt);
      const currentDate = new Date();
      yearsOfExperience = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24 * 365));
      // Ensure minimum 10 years as per the organization's actual history
      yearsOfExperience = Math.max(yearsOfExperience, 10);
    }

    res.json({
      students: totalStudents,
      teachers: professionalTeachers,
      experience: yearsOfExperience,
      courses: courseCount || 15 // Fallback to 15 if no distinct courses found
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};





