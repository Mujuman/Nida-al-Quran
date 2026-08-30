const crypto = require('crypto');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendRegistrationNotification, sendVerificationEmail, sendVerificationOtpEmail } = require('../utils/adminNotifications');

const generate6DigitOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register user with full details (Generates 6-Digit Verification OTP)
exports.registerUser = async (req, res) => {
  const {
    fullName, email, password, phone, age, gender, course, level, schedule,
    guardian, guardianPhone, guardianName, learningMedia, message,
  } = req.body;
  
  try {
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    console.log(`📝 New registration attempt for email: ${normalizedEmail}`);

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      if (user.isVerified) {
        console.log(`⚠️ Email already verified: ${normalizedEmail}`);
        return res.status(400).json({ msg: 'A student account already exists with this email address' });
      } else {
        // Overwrite unverified registration attempt with updated details & new OTP
        console.log(`🔄 Re-registering unverified user: ${normalizedEmail}`);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.fullName = fullName;
        user.phone = phone;
        user.age = age;
        user.gender = gender;
        user.course = course;
        user.level = level;
        user.schedule = schedule;
        user.guardian = guardian || guardianName;
        user.guardianPhone = guardianPhone || req.body.guardian_phone;
        user.learningMedia = learningMedia;
        user.message = message;
        
        const otp = generate6DigitOtp();
        user.verificationOtp = otp;
        user.verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await user.save();

        console.log(`📧 Sending OTP verification email to ${normalizedEmail}...`);
        await sendVerificationOtpEmail(user, otp);
        console.log(`✅ OTP email sent to ${normalizedEmail}`);

        return res.json({
          success: true,
          requiresOtp: true,
          msg: 'Registration details updated! A 6-digit verification code (OTP) has been sent to your email address.',
          email: user.email,
        });
      }
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ msg: 'Password is required and must be at least 6 characters' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP (15 minutes expiry)
    const otp = generate6DigitOtp();
    const verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
    console.log(`🔐 Generated OTP: ${otp} (expires in 15 mins)`);

    // Create new user in DB
    user = new User({
      fullName,
      email: normalizedEmail,
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
      verificationOtp: otp,
      verificationOtpExpires,
      registrationStatus: 'pending',
    });

    await user.save();
    console.log(`✅ User created in database: ${normalizedEmail}`);

    // Send 6-digit OTP email to student
    console.log(`📧 Sending OTP verification email to ${normalizedEmail}...`);
    try {
      await sendVerificationOtpEmail(user, otp);
      console.log(`✅ OTP email sent successfully to ${normalizedEmail}`);
    } catch (emailErr) {
      console.error(`❌ Error sending OTP email: ${emailErr.message}`);
      // Don't fail registration if email fails
    }

    res.json({ 
      success: true,
      requiresOtp: true,
      msg: 'Registration submitted successfully! A 6-digit verification code (OTP) has been sent to your email address. Please enter the code below to verify your email.',
      email: user.email,
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ msg: 'Server error during registration', error: err.message });
  }
};

// Verify user email via 6-digit OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ msg: 'Email address and 6-digit verification code (OTP) are required.' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`🔍 Verifying OTP for email: ${normalizedEmail}`);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`⚠️ No registration record found for ${normalizedEmail}`);
      return res.status(404).json({ msg: 'No registration record found for this email address. Please register.' });
    }

    if (user.isVerified) {
      console.log(`✅ Email already verified: ${normalizedEmail}`);
      return res.json({
        success: true,
        alreadyVerified: true,
        msg: 'Email is already verified! Your registration is submitted for main admin approval.',
        email: user.email,
      });
    }

    if (!user.verificationOtp || user.verificationOtp !== otp.trim()) {
      console.log(`❌ Invalid OTP for ${normalizedEmail}. Expected: ${user.verificationOtp}, Got: ${otp}`);
      return res.status(400).json({ msg: 'Invalid 6-digit verification code. Please check your email and try again.' });
    }

    if (user.verificationOtpExpires && user.verificationOtpExpires < new Date()) {
      console.log(`⏰ OTP expired for ${normalizedEmail}`);
      return res.status(400).json({ msg: 'Verification code has expired. Please click "Resend Code" to get a new OTP.' });
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();
    console.log(`✅ Email verified successfully for ${normalizedEmail}`);

    // Send notification to main admins
    console.log(`📧 Sending registration notification to main admins...`);
    sendRegistrationNotification(user).catch((err) => console.error('Admin notification error:', err));

    res.json({
      success: true,
      msg: 'Your email address has been verified successfully! Your application has now been submitted to the main administration for approval.',
      email: user.email,
      fullName: user.fullName,
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ msg: 'Server error during OTP verification.', error: err.message });
  }
};

// Resend 6-digit OTP code to student email
exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ msg: 'Email address is required.' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`🔄 Resend OTP request for email: ${normalizedEmail}`);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`⚠️ No registration record found for ${normalizedEmail}`);
      return res.status(404).json({ msg: 'No registration record found for this email address.' });
    }

    if (user.isVerified) {
      console.log(`✅ Email already verified: ${normalizedEmail}`);
      return res.json({ success: true, msg: 'Email is already verified.' });
    }

    const otp = generate6DigitOtp();
    user.verificationOtp = otp;
    user.verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    console.log(`🔐 New OTP generated: ${otp} (expires in 15 mins)`);

    console.log(`📧 Resending OTP to ${normalizedEmail}...`);
    try {
      await sendVerificationOtpEmail(user, otp);
      console.log(`✅ OTP resent successfully to ${normalizedEmail}`);
    } catch (emailErr) {
      console.error(`❌ Error resending OTP: ${emailErr.message}`);
      // Don't fail if email fails
    }

    res.json({
      success: true,
      msg: 'A new 6-digit verification code (OTP) has been sent to your email address.',
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ msg: 'Server error resending OTP.', error: err.message });
  }
};

// Legacy verify email route (optional backward compatibility)
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ msg: 'Verification token is required.' });
  }

  try {
    const user = await User.findOne({
      $or: [
        { verificationToken: token },
        { verificationOtp: token }
      ]
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired verification link/code.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();

    sendRegistrationNotification(user).catch((err) => console.error('Admin notification error:', err));

    res.json({
      success: true,
      msg: 'Your email address has been verified successfully!',
      email: user.email,
      fullName: user.fullName,
    });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ msg: 'Server error during verification.', error: err.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid email address or password' });
    }

    if (!user.password) {
      return res.status(400).json({ msg: 'Please register first or reset your password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid email address or password' });
    }

    // MANDATORY CHECK 1: Must verify email via 6-digit OTP first!
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        requiresOtp: true,
        msg: 'Please verify your email address first using the 6-digit OTP code sent to your email before logging in.',
        email: user.email,
      });
    }

    // MANDATORY CHECK 2: Must be approved by main admin!
    if (user.registrationStatus !== 'approved') {
      if (user.registrationStatus === 'rejected') {
        return res.status(400).json({ success: false, msg: 'Your registration request has been rejected by the administrator.' });
      }
      return res.status(400).json({
        success: false,
        requiresApproval: true,
        msg: 'Your email address is verified, but your account is pending approval by the main administrator. You cannot log in until approved.',
      });
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
        isVerified: user.isVerified,
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






