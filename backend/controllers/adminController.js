const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Attendance = require('../models/Attendance');

// ============================================================
// Admin Login (any role)
// ============================================================
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
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ============================================================
// Get All Users
// - Main admin: all users
// - Sub-admin: only their assigned students
// ============================================================
exports.getAllUsers = async (req, res) => {
  try {
    let users;
    if (req.admin.role === 'main_admin') {
      users = await User.find()
        .select('-password')
        .populate('assignedTeacher', 'fullName email username');
    } else {
      // Sub-admin: only assigned students who have active teaching status
      const adminDoc = await Admin.findById(req.admin.id).populate({
        path: 'assignedStudents',
        select: '-password',
        populate: { path: 'assignedTeacher', select: 'fullName email username' },
      });
      users = adminDoc 
        ? adminDoc.assignedStudents.filter(s => s.isTeachingActive !== false)
        : [];
    }
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ============================================================
// Get User Details
// ============================================================
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('assignedTeacher', 'fullName email username');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Sub-admin can only view their own students
    if (req.admin.role === 'sub_admin') {
      const adminDoc = await Admin.findById(req.admin.id);
      const isAssigned = adminDoc.assignedStudents
        .map((id) => id.toString())
        .includes(req.params.userId);
      if (!isAssigned) {
        return res.status(403).json({ msg: 'Access denied. Not your student.' });
      }
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ============================================================
// Update User Status (Main Admin only)
// ============================================================
exports.updateUserStatus = async (req, res) => {
  try {
    const { registrationStatus, isVerified, isTeachingActive } = req.body;

    let user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (registrationStatus) user.registrationStatus = registrationStatus;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isTeachingActive !== undefined) user.isTeachingActive = isTeachingActive;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ============================================================
// Dashboard Stats
// - Main admin: full stats
// - Sub-admin: only their student stats
// ============================================================
exports.getDashboardStats = async (req, res) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    if (req.admin.role === 'main_admin') {
      const totalUsers = await User.countDocuments();
      const pendingRegistrations = await User.countDocuments({ registrationStatus: 'pending' });
      const approvedRegistrations = await User.countDocuments({ registrationStatus: 'approved' });
      const totalContacts = await Contact.countDocuments();
      const newContacts = await Contact.countDocuments({ status: 'new' });
      const monthlyAttendance = await Attendance.countDocuments({
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });
      const totalSubAdmins = await Admin.countDocuments({ role: 'sub_admin' });

      res.json({
        totalUsers,
        pendingRegistrations,
        approvedRegistrations,
        totalContacts,
        newContacts,
        monthlyAttendance,
        totalSubAdmins,
      });
    } else {
      // Sub-admin stats: only their assigned students
      const adminDoc = await Admin.findById(req.admin.id);
      const assignedIds = adminDoc ? adminDoc.assignedStudents : [];

      const totalUsers = assignedIds.length;
      const approvedRegistrations = await User.countDocuments({
        _id: { $in: assignedIds },
        registrationStatus: 'approved',
      });
      const monthlyAttendance = await Attendance.countDocuments({
        student: { $in: assignedIds },
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });

      res.json({
        totalUsers,
        pendingRegistrations: 0,
        approvedRegistrations,
        totalContacts: 0,
        newContacts: 0,
        monthlyAttendance,
        totalSubAdmins: 0,
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ============================================================
// Get All Sub-Admins (Main Admin only)
// ============================================================
exports.getAllSubAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ role: 'sub_admin' })
      .select('-password')
      .populate('assignedStudents', 'fullName email course')
      .populate('createdBy', 'fullName email');
    res.json(admins);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ============================================================
// Create Sub-Admin (Main Admin only)
// ============================================================
exports.createSubAdmin = async (req, res) => {
  const { username, email, password, fullName, phone } = req.body;

  try {
    let existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: 'Admin with this email already exists' });
    }

    let existingUsername = await Admin.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ msg: 'Username already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const subAdmin = new Admin({
      username,
      email,
      password: hashed,
      fullName,
      phone,
      role: 'sub_admin',
      createdBy: req.admin.id,
      permissions: {
        manageUsers: false,
        manageAttendance: true,
        manageCourses: false,
        viewReports: true,
        manageAdmins: false,
      },
    });

    await subAdmin.save();
    res.json({ msg: 'Sub-admin created successfully', adminId: subAdmin.id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ============================================================
// Update Sub-Admin (Main Admin only)
// ============================================================
exports.updateSubAdmin = async (req, res) => {
  try {
    const { fullName, phone, isActive, password } = req.body;
    const admin = await Admin.findById(req.params.adminId);

    if (!admin) {
      return res.status(404).json({ msg: 'Sub-admin not found' });
    }
    if (admin.role === 'main_admin') {
      return res.status(403).json({ msg: 'Cannot modify a main admin' });
    }

    if (fullName) admin.fullName = fullName;
    if (phone !== undefined) admin.phone = phone;
    if (isActive !== undefined) admin.isActive = isActive;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();
    const updated = await Admin.findById(req.params.adminId)
      .select('-password')
      .populate('assignedStudents', 'fullName email course');
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ============================================================
// Delete Sub-Admin (Main Admin only)
// ============================================================
exports.deleteSubAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.adminId);
    if (!admin) {
      return res.status(404).json({ msg: 'Sub-admin not found' });
    }
    if (admin.role === 'main_admin') {
      return res.status(403).json({ msg: 'Cannot delete a main admin' });
    }

    // Unassign students
    await User.updateMany(
      { assignedTeacher: req.params.adminId },
      { $set: { assignedTeacher: null } }
    );

    await admin.deleteOne();
    res.json({ msg: 'Sub-admin deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ============================================================
// Assign Student to Teacher (Main Admin only)
// ============================================================
exports.assignStudentToTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Block assigning rejected students
    if (user.registrationStatus === 'rejected') {
      return res.status(400).json({
        msg: 'Cannot assign a rejected student to a teacher. Approve the student first.',
      });
    }

    // Remove from previous teacher's list if any
    if (user.assignedTeacher) {
      await Admin.findByIdAndUpdate(user.assignedTeacher, {
        $pull: { assignedStudents: userId },
      });
    }

    if (teacherId) {
      const teacher = await Admin.findById(teacherId);
      if (!teacher || teacher.role !== 'sub_admin') {
        return res.status(404).json({ msg: 'Teacher (sub-admin) not found' });
      }

      // Add to new teacher
      await Admin.findByIdAndUpdate(teacherId, {
        $addToSet: { assignedStudents: userId },
      });
      user.assignedTeacher = teacherId;
    } else {
      // Unassign
      user.assignedTeacher = null;
    }

    await user.save();
    const updated = await User.findById(userId)
      .select('-password')
      .populate('assignedTeacher', 'fullName email username');
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ============================================================
// Delete Student (Main Admin only)
// ============================================================
exports.deleteStudent = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Remove student from any teacher's assignedStudents list
    if (user.assignedTeacher) {
      await Admin.findByIdAndUpdate(user.assignedTeacher, {
        $pull: { assignedStudents: req.params.userId },
      });
    }

    // Delete all attendance records for this student
    const Attendance = require('../models/Attendance');
    await Attendance.deleteMany({ student: req.params.userId });

    // Delete the student
    await user.deleteOne();
    res.json({ msg: 'Student deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ============================================================
// Get My Students (Sub-Admin)
// ============================================================
exports.getMyStudents = async (req, res) => {
  try {
    const adminDoc = await Admin.findById(req.admin.id).populate({
      path: 'assignedStudents',
      select: '-password',
    });
    const students = adminDoc 
      ? adminDoc.assignedStudents.filter(s => s.isTeachingActive !== false)
      : [];
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ============================================================
// Get All Attendance (Main Admin sees all, Sub-Admin sees assigned)
// ============================================================
exports.getAllAttendanceRecords = async (req, res) => {
  try {
    let records;
    if (req.admin.role === 'main_admin') {
      records = await Attendance.find()
        .populate('studentId', 'fullName email course')
        .sort({ date: -1 });
    } else {
      const adminDoc = await Admin.findById(req.admin.id);
      const assignedIds = adminDoc ? adminDoc.assignedStudents : [];
      records = await Attendance.find({ student: { $in: assignedIds } })
        .populate('student', 'fullName email course')
        .sort({ date: -1 });
    }
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ============================================================
// Get My Profile (any authenticated admin)
// ============================================================
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) return res.status(404).json({ msg: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ============================================================
// Update My Profile (any authenticated admin)
// ============================================================
exports.updateProfile = async (req, res) => {
  const { fullName, email, currentPassword, newPassword } = req.body;
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ msg: 'Admin not found' });

    // If changing email, make sure no other admin uses it
    if (email && email !== admin.email) {
      const existing = await Admin.findOne({ email });
      if (existing) return res.status(400).json({ msg: 'Email already in use by another account' });
      admin.email = email;
    }

    if (fullName) admin.fullName = fullName;

    // Password change requires current password verification
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ msg: 'Current password is required to set a new password' });
      }
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Current password is incorrect' });
      }
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(newPassword, salt);
    }

    await admin.save();

    // Return a fresh token so stored info stays in sync
    const payload = { admin: { id: admin.id, role: admin.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      msg: 'Profile updated successfully',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
