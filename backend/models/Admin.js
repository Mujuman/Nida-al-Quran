const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['main_admin', 'sub_admin'],
      default: 'sub_admin',
    },
    phone: {
      type: String,
    },
    // Students assigned to this sub-admin/teacher
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Which main admin created this sub-admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    permissions: {
      manageUsers: { type: Boolean, default: false },
      manageAttendance: { type: Boolean, default: true },
      manageCourses: { type: Boolean, default: false },
      viewReports: { type: Boolean, default: true },
      manageAdmins: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Admin', AdminSchema);
