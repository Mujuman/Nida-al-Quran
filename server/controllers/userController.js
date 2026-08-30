const crypto = require('crypto');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendRegistrationNotification, sendVerificationEmail } = require('../utils/adminNotifications');

// Register user with full details (Do NOT save to DB until email is verified)
exports.registerUser = async (req, res) => {
  const {
    fullName, email, password, phone, age, gender, course, level, schedule,
    guardian, guardianPhone, guardianName, learningMedia, message,
  } = req.body;
  
  try {
    // Check if user already exists in database
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'A student account already exists with this email address' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ msg: 'Password is required and must be at least 6 characters' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create 24-hour verification token payload
    const payload = {
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
      type: 'email_verification',
    };

    const verificationToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'nida_email_verify_secret',
      { expiresIn: '24h' }
    );

    // Send verification link (DO NOT save user to DB until verified!)
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
    const verifyUrl = `${clientUrl}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail({ fullName, email }, verifyUrl);

    res.json({ 
      success: true,
      requiresVerification: true,
      msg: 'Registration submitted! A verification link has been sent to your email address. Please check your Gmail/inbox and click the link to verify your email and complete your registration.',
      user: {
        email,
        fullName,
        isVerified: false,
      }
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ msg: 'Server error during registration', error: err.message });
  }
};

// Verify user email via token and ONLY THEN add student to database
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ msg: 'Verification token is required.' });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'nida_email_verify_secret');
    } catch (jwtErr) {
      // Fallback: check if token matches legacy User in DB
      const legacyUser = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() },
      });
      if (legacyUser) {
        legacyUser.isVerified = true;
        legacyUser.verificationToken = undefined;
        legacyUser.verificationTokenExpires = undefined;
        await legacyUser.save();
        sendRegistrationNotification(legacyUser).catch((e) => console.error('Admin notify error:', e));
        return res.json({
          success: true,
          msg: 'Your email address has been verified successfully! Your application has been submitted to the main administration for approval.',
          email: legacyUser.email,
          fullName: legacyUser.fullName,
        });
      }
      return res.status(400).json({ msg: 'Invalid or expired verification link. Please register again.' });
    }

    if (!decoded || decoded.type !== 'email_verification') {
      return res.status(400).json({ msg: 'Invalid verification token payload.' });
    }

    // Check if user already exists in DB
    let user = await User.findOne({ email: decoded.email });
    if (!user) {
      // ONLY NOW insert student user into MongoDB database!
      user = new User({
        fullName: decoded.fullName,
        email: decoded.email,
        password: decoded.password, // already hashed
        phone: decoded.phone,
        age: decoded.age,
        gender: decoded.gender,
        course: decoded.course,
        level: decoded.level,
        schedule: decoded.schedule,
        guardian: decoded.guardian,
        guardianPhone: decoded.guardianPhone,
        learningMedia: decoded.learningMedia,
        message: decoded.message,
        isVerified: true,
        registrationStatus: 'pending', // Pending Main Admin Approval!
      });
      await user.save();
    } else {
      user.isVerified = true;
      await user.save();
    }

    // Send notification to main admin now that student is verified & added to DB
    sendRegistrationNotification(user).catch((err) => console.error('Admin notification error:', err));

    res.json({
      success: true,
      msg: 'Your email address has been verified successfully! Your profile is now saved and submitted to the main administration for approval.',
      email: user.email,
      fullName: user.fullName,
    });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ msg: 'Server error during email verification.', error: err.message });
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
      return res.status(400).json({ msg: 'Please register first or reset your password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if user is approved by main admin
    if (user.registrationStatus !== 'approved') {
      if (user.registrationStatus === 'rejected') {
        return res.status(403).json({ msg: 'Your registration request has been rejected by the administrator.' });
      }
      return res.status(403).json({ msg: 'Your account is pending approval by the main administrator. You cannot log in until approved.' });
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
        registrationStatus: user.registrationStatus,
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get current logged-in user profile
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('assignedTeacher', 'fullName email phone username assignedCourses role');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    if (user.registrationStatus !== 'approved') {
      return res.status(403).json({ msg: 'Your account is not approved by main admin yet.' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Update current logged-in user profile
exports.updateMyProfile = async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const {
      fullName, phone, age, gender, guardian, guardianPhone, learningMedia, schedule, message, newPassword
    } = req.body;

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (age !== undefined && age !== '') user.age = age;
    if (gender) user.gender = gender;
    if (guardian) user.guardian = guardian;
    if (guardianPhone) user.guardianPhone = guardianPhone;
    if (learningMedia) user.learningMedia = learningMedia;
    if (schedule) user.schedule = schedule;
    if (message) user.message = message;

    if (newPassword && newPassword.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    
    const updatedUser = await User.findById(req.user.id)
      .select('-password')
      .populate('assignedTeacher', 'fullName email phone username assignedCourses role');

    res.json({ msg: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get student's own attendance records
exports.getMyAttendance = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find({ student: req.user.id })
      .populate('recordedBy', 'fullName email')
      .sort({ date: -1 });

    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((a) => a.status === 'present').length;
    const absent = attendanceRecords.filter((a) => a.status === 'absent').length;
    const late = attendanceRecords.filter((a) => a.status === 'late').length;
    const excused = attendanceRecords.filter((a) => a.status === 'excused').length;
    const percentage = total > 0 ? (((present + late + excused) / total) * 100).toFixed(1) : 0;

    res.json({
      attendance: attendanceRecords,
      stats: { total, present, absent, late, excused, percentage: parseFloat(percentage) }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get student's enrolled courses
exports.getMyCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    let enrolledCourses = [];
    if (user.course) {
      const courseDoc = await Course.findOne({ 
        $or: [
          { slug: user.course },
          { title: { $regex: new RegExp(user.course, 'i') } }
        ]
      });

      enrolledCourses.push({
        id: courseDoc ? courseDoc._id : 'enrolled-1',
        title: courseDoc ? courseDoc.title : user.course,
        slug: user.course,
        level: user.level || 'beginner',
        schedule: user.schedule || 'flexible',
        learningMedia: user.learningMedia || 'google-meet',
        status: user.registrationStatus || 'approved',
        isTeachingActive: user.isTeachingActive,
        description: courseDoc ? courseDoc.description : 'Quranic and Islamic education course at Nida Al-Quran Center.',
        category: courseDoc ? courseDoc.category : 'quran',
        duration: courseDoc ? courseDoc.duration : '3 months'
      });
    }

    res.json(enrolledCourses);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get assigned teacher details for student
exports.getMyTeacher = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      'assignedTeacher',
      'fullName email phone username role assignedCourses permissions isActive'
    );

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.assignedTeacher) {
      return res.json({ teacher: null, msg: 'No teacher assigned yet' });
    }

    res.json({ teacher: user.assignedTeacher });
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

    // Count active courses available in the catalogue
    const courseCount = await Course.countDocuments({ isActive: true });

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
      courses: courseCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};






