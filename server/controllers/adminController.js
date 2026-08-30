const Admin = require('../models/Admin');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Attendance = require('../models/Attendance');
const { sendAssignmentNotification, sendApprovalNotification } = require('../utils/adminNotifications');

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
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
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
      // ONLY return email-verified students (isVerified: true)
      users = await User.find({ isVerified: true })
        .select('-password')
        .populate('assignedTeacher', 'fullName email username');
    } else {
      // Sub-admin: only assigned students who are email-verified and active
      const adminDoc = await Admin.findById(req.admin.id).populate({
        path: 'assignedStudents',
        select: '-password',
        populate: { path: 'assignedTeacher', select: 'fullName email username' },
      });
      users = adminDoc 
        ? adminDoc.assignedStudents.filter(s => s.isVerified && s.isTeachingActive !== false)
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
// Update User Status (main admin or assigned sub-admin)
// ============================================================
exports.updateUserStatus = async (req, res) => {
  try {
    const { registrationStatus, isVerified, isTeachingActive } = req.body;

    let user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (req.admin.role === 'sub_admin') {
      const adminDoc = await Admin.findById(req.admin.id).select('assignedStudents');
      const isAssigned = adminDoc?.assignedStudents
        .some((studentId) => studentId.toString() === req.params.userId);
      if (!isAssigned) {
        return res.status(403).json({ msg: 'Access denied. Not your student.' });
      }
    }

    const previousStatus = user.registrationStatus;
    if (registrationStatus) user.registrationStatus = registrationStatus;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isTeachingActive !== undefined) user.isTeachingActive = isTeachingActive;

    await user.save();

    // If main admin approved student, send approval email to student
    if (registrationStatus === 'approved' && previousStatus !== 'approved') {
      console.log(`📧 Sending approval email to ${user.email}...`);
      try {
        await sendApprovalNotification(user);
        console.log(`✅ Approval email sent successfully to ${user.email}`);
      } catch (err) {
        console.error(`❌ Error sending approval email to ${user.email}:`, err.message);
        // Don't fail the approval if email fails - still approve the user
      }
    }

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
      const totalUsers = await User.countDocuments({ isVerified: true });
      const pendingRegistrations = await User.countDocuments({ isVerified: true, registrationStatus: 'pending' });
      const approvedRegistrations = await User.countDocuments({ isVerified: true, registrationStatus: 'approved' });
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
      // Sub-admin stats: only their assigned students who are email verified
      const adminDoc = await Admin.findById(req.admin.id).populate('assignedStudents');
      const verifiedAssignedIds = adminDoc
        ? adminDoc.assignedStudents.filter(s => s && s.isVerified).map(s => s._id)
        : [];

      const totalUsers = verifiedAssignedIds.length;
      const pendingRegistrations = await User.countDocuments({
        _id: { $in: verifiedAssignedIds },
        registrationStatus: 'pending',
      });
      const approvedRegistrations = await User.countDocuments({
        _id: { $in: verifiedAssignedIds },
        registrationStatus: 'approved',
      });
      const monthlyAttendance = await Attendance.countDocuments({
        student: { $in: verifiedAssignedIds },
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });

      res.json({
        totalUsers,
        pendingRegistrations,
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
  const { username, email, password, fullName, phone, assignedCourses = [] } = req.body;

  if (!Array.isArray(assignedCourses) || assignedCourses.length === 0) {
    return res.status(400).json({ msg: 'Please assign at least one course.' });
  }

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
      assignedCourses,
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
    const { fullName, phone, isActive, password, assignedCourses } = req.body;
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
    if (Array.isArray(assignedCourses) && assignedCourses.length > 0) {
      admin.assignedCourses = assignedCourses;
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
      await sendAssignmentNotification(user, teacher);
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
        .populate('student', 'fullName email course')
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
// Delete Rejected Students (Main Admin only)
// ============================================================
exports.deleteRejectedStudents = async (req, res) => {
  try {
    // Get all rejected students
    const rejectedStudents = await User.find({ registrationStatus: 'rejected' });

    if (rejectedStudents.length === 0) {
      return res.json({ msg: 'No rejected students to delete', deletedCount: 0 });
    }

    // Delete all rejected students
    const studentIds = rejectedStudents.map(student => student._id);
    
    // Remove from teachers' assignedStudents lists
    await Admin.updateMany(
      { assignedStudents: { $in: studentIds } },
      { $pull: { assignedStudents: { $in: studentIds } } }
    );

    // Delete all attendance records for these students
    await Attendance.deleteMany({ student: { $in: studentIds } });

    // Delete the students
    const result = await User.deleteMany({ registrationStatus: 'rejected' });

    res.json({ 
      msg: 'Rejected students deleted successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ============================================================
// Delete Single Rejected Student (Main Admin only)
// ============================================================
exports.deleteRejectedStudent = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    if (user.registrationStatus !== 'rejected') {
      return res.status(400).json({ msg: 'Can only delete rejected students' });
    }

    // Remove from teachers' assignedStudents
    if (user.assignedTeacher) {
      await Admin.findByIdAndUpdate(user.assignedTeacher, {
        $pull: { assignedStudents: req.params.userId },
      });
    }

    // Delete attendance records
    await Attendance.deleteMany({ student: req.params.userId });

    // Delete the student
    await user.deleteOne();
    res.json({ msg: 'Rejected student deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ============================================================
// Activate/Deactivate Sub-Admin (Main Admin only)
// ============================================================
exports.toggleSubAdminStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const admin = await Admin.findById(req.params.adminId);

    if (!admin) {
      return res.status(404).json({ msg: 'Sub-admin not found' });
    }
    if (admin.role === 'main_admin') {
      return res.status(403).json({ msg: 'Cannot modify a main admin' });
    }

    admin.isActive = isActive;
    await admin.save();

    const updated = await Admin.findById(req.params.adminId)
      .select('-password')
      .populate('assignedStudents', 'fullName email course');
    
    res.json({ 
      msg: `Sub-admin ${isActive ? 'activated' : 'deactivated'} successfully`,
      admin: updated 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ============================================================
// Reset Sub-Admin Password (Main Admin only)
// ============================================================
exports.resetSubAdminPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ msg: 'New password is required' });
    }

    const admin = await Admin.findById(req.params.adminId);

    if (!admin) {
      return res.status(404).json({ msg: 'Sub-admin not found' });
    }
    if (admin.role === 'main_admin') {
      return res.status(403).json({ msg: 'Cannot modify a main admin' });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({ msg: 'Sub-admin password reset successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
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

// ============================================================
// Get All Teachers (Main Admin only)
// ============================================================
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Admin.find({ role: 'sub_admin' })
      .select('-password')
      .populate('assignedStudents', 'fullName email course')
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(teachers);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ============================================================
// Get Teacher Details (Main Admin only)
// ============================================================
exports.getTeacherDetails = async (req, res) => {
  try {
    const teacher = await Admin.findById(req.params.teacherId)
      .select('-password')
      .populate('assignedStudents', 'fullName email course registrationStatus')
      .populate('createdBy', 'fullName email');

    if (!teacher) {
      return res.status(404).json({ msg: 'Teacher not found' });
    }

    if (teacher.role !== 'sub_admin') {
      return res.status(400).json({ msg: 'This admin is not a teacher' });
    }

    res.json(teacher);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ============================================================
// Update Teacher Account (Main Admin only)
// ============================================================
exports.updateTeacher = async (req, res) => {
  try {
    const { fullName, email, phone, password, assignedCourses } = req.body;
    const teacher = await Admin.findById(req.params.teacherId);

    if (!teacher) {
      return res.status(404).json({ msg: 'Teacher not found' });
    }

    if (teacher.role !== 'sub_admin') {
      return res.status(400).json({ msg: 'This admin is not a teacher' });
    }

    // Update basic fields
    if (fullName) teacher.fullName = fullName;
    if (phone !== undefined) teacher.phone = phone;

    // Email must be unique
    if (email && email !== teacher.email) {
      const existing = await Admin.findOne({ email });
      if (existing) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
      teacher.email = email;
    }

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      teacher.password = await bcrypt.hash(password, salt);
    }

    // Update assigned courses if provided
    if (Array.isArray(assignedCourses) && assignedCourses.length > 0) {
      teacher.assignedCourses = assignedCourses;
    }

    await teacher.save();

    const updated = await Admin.findById(req.params.teacherId)
      .select('-password')
      .populate('assignedStudents', 'fullName email course');

    res.json({
      msg: 'Teacher updated successfully',
      teacher: updated,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ============================================================
// Activate Teacher Account (Main Admin only)
// ============================================================
exports.activateTeacher = async (req, res) => {
  try {
    const teacher = await Admin.findById(req.params.teacherId);

    if (!teacher) {
      return res.status(404).json({ msg: 'Teacher not found' });
    }

    if (teacher.role !== 'sub_admin') {
      return res.status(400).json({ msg: 'This admin is not a teacher' });
    }

    teacher.isActive = true;
    await teacher.save();

    const updated = await Admin.findById(req.params.teacherId)
      .select('-password')
      .populate('assignedStudents', 'fullName email course');

    res.json({
      msg: 'Teacher account activated successfully',
      teacher: updated,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ============================================================
// Deactivate Teacher Account (Main Admin only)
// ============================================================
exports.deactivateTeacher = async (req, res) => {
  try {
    const teacher = await Admin.findById(req.params.teacherId);

    if (!teacher) {
      return res.status(404).json({ msg: 'Teacher not found' });
    }

    if (teacher.role !== 'sub_admin') {
      return res.status(400).json({ msg: 'This admin is not a teacher' });
    }

    teacher.isActive = false;
    await teacher.save();

    const updated = await Admin.findById(req.params.teacherId)
      .select('-password')
      .populate('assignedStudents', 'fullName email course');

    res.json({
      msg: 'Teacher account deactivated successfully',
      teacher: updated,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ============================================================
// Delete Teacher Account (Main Admin only)
// ============================================================
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Admin.findById(req.params.teacherId);

    if (!teacher) {
      return res.status(404).json({ msg: 'Teacher not found' });
    }

    if (teacher.role !== 'sub_admin') {
      return res.status(400).json({ msg: 'This admin is not a teacher' });
    }

    // Unassign all students from this teacher
    await User.updateMany(
      { assignedTeacher: req.params.teacherId },
      { $set: { assignedTeacher: null } }
    );

    // Remove students from teacher's assignedStudents array
    await Admin.findByIdAndUpdate(
      req.params.teacherId,
      { $set: { assignedStudents: [] } }
    );

    // Delete the teacher account
    await teacher.deleteOne();

    res.json({ msg: 'Teacher account deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ============================================================
// Seed Courses (Main Admin only - development/setup helper)
// ============================================================
exports.seedCourses = async (req, res) => {
  try {
    const Course = require('../models/Course');

    // Clear existing courses
    await Course.deleteMany({});

    const courses = [
      {
        slug: 'qaidah-tajweed',
        title: {
          en: 'Qaidah with Tajweed',
          am: 'ቃኢዳ በተጅዊድ',
        },
        description: {
          en: 'Learn the basics of Quranic reading with proper pronunciation and rules',
          am: 'የቁርአን ንባብ መሰረታዊ ነገሮችን በትክክለኛ አነጋገር እና ህጎች ይማሩ',
        },
        features: {
          en: [
            'Introduction to Arabic letters',
            'Basic pronunciation rules',
            'Tajweed fundamentals',
            'Practice with short surahs',
          ],
          am: [
            'የአረብ ፊደሎች መግቢያ',
            'መሰረታዊ አነጋገር ህጎች',
            'የታጅዊድ መሰረት',
            'በአጭር ሱራዎች ልምምድ',
          ],
        },
        sortOrder: 1,
        isActive: true,
      },
      {
        slug: 'quran-nazr',
        title: {
          en: 'Quran Reading (Nazr)',
          am: 'ቁርአን ነዘር',
        },
        description: {
          en: 'Develop fluency in reading the entire Quran with proper tajweed rules',
          am: 'ሙሉ ቁርአንን በትክክለኛ ታጅዊድ ህጎች ንባብ ቅልጥፍና ዓቅደ',
        },
        features: {
          en: [
            'Complete Quran reading',
            'Advanced tajweed rules',
            'Pronunciation perfection',
            'Regular assessments',
          ],
          am: [
            'ሙሉ ቁርአን ንባብ',
            'የተራቀቀ ታጅዊድ ህጎች',
            'አነጋገር ፍጹምነት',
            'መደበኛ ግምገማ',
          ],
        },
        sortOrder: 2,
        isActive: true,
      },
      {
        slug: 'hifz-murajaah',
        title: {
          en: 'Memorization with Review',
          am: 'ሂፍዝ ከሙራጀአ ጋር',
        },
        description: {
          en: 'Complete memorization of the Quran with continuous review to maintain progress',
          am: 'ቁርአንን ሙሉ በሙሉ ማስታወስ ከምናሲበት ገፅ ሰብሳቢ ጋር',
        },
        features: {
          en: [
            'Systematic memorization',
            'Daily revision schedule',
            'Progress tracking',
            'Certification upon completion',
          ],
          am: [
            'ሥርዓተ ቅደም ታዛዥ ማስታወስ',
            'ዕለታዊ ድገም ሰዓት ሠሪ',
            'ዓቅደ ዳሰሳ',
            'ሥራ ሞቅሮ ማስረጃ',
          ],
        },
        sortOrder: 3,
        isActive: true,
      },
      {
        slug: 'islamic-studies',
        title: {
          en: 'Basic Islamic Studies',
          am: 'መሰረታዊ የዲን ትምህርቶች',
        },
        description: {
          en: 'Comprehensive Islamic education covering Aqeedah, Fiqh, and Islamic history',
          am: 'ሙሉ ለሙሉ የ ዲን ትምህርት ዓንደበቲ፤ ፍቅር፤ እና ታሪክ ሊሞልክ',
        },
        features: {
          en: [
            'Islamic beliefs and principles',
            'Islamic jurisprudence basics',
            'Prophet biography',
            'Islamic history overview',
          ],
          am: [
            'የኢስላም እምነት እና መርሆ',
            'የኢስላም ሕግ መሰረት',
            'ተወዳደርወ ታሪክ',
            'የኢስላም ታሪክ ሁኔታ',
          ],
        },
        sortOrder: 4,
        isActive: true,
      },
    ];

    await Course.insertMany(courses);
    res.json({ 
      msg: 'Courses seeded successfully',
      count: courses.length,
      courses: courses.map(c => ({ slug: c.slug, title: c.title.en }))
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error seeding courses', error: err.message });
  }
};
