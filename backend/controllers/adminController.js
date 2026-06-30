const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Attendance = require('../models/Attendance');


// Admin Login
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ msg: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid admin credentials' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ msg: 'Admin account is inactive' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const payload = { admin: { id: admin.id, role: admin.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        permissions: admin.permissions,
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get All Users (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
  msg: 'Server error',
  error: err.message
});
  }
};

// Get User Details (Admin)
exports.getUserDetails = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update User Status (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const User = require('../models/User');
    const { registrationStatus, isVerified } = req.body;
    
    let user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (registrationStatus) user.registrationStatus = registrationStatus;
    if (isVerified !== undefined) user.isVerified = isVerified;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const User = require('../models/User');
    const Contact = require('../models/Contact');
    const Attendance = require('../models/Attendance');

    const totalUsers = await User.countDocuments();
    const pendingRegistrations = await User.countDocuments({ registrationStatus: 'pending' });
    const approvedRegistrations = await User.countDocuments({ registrationStatus: 'approved' });
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    
    // Get attendance stats for this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    const monthlyAttendance = await Attendance.countDocuments({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    res.json({
      totalUsers,
      pendingRegistrations,
      approvedRegistrations,
      totalContacts,
      newContacts,
      monthlyAttendance,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get All Admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json(admins);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Create New Admin (Only for super admins)
exports.createAdmin = async (req, res) => {
  const { username, email, password, fullName, role, phone } = req.body;

  try {
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ msg: 'Admin already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    admin = new Admin({
      username,
      email,
      password: hashed,
      fullName,
      role,
      phone,
    });

    await admin.save();
    res.json({ msg: 'Admin created successfully', adminId: admin.id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
