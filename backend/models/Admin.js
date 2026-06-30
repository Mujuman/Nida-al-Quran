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
      enum: ['admin', 'teacher', 'moderator'],
      default: 'admin',
    },
    phone: {
      type: String,
    },
    permissions: {
      manageUsers: { type: Boolean, default: true },
      manageAttendance: { type: Boolean, default: true },
      manageCourses: { type: Boolean, default: true },
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
    timestamps: true 
  }
);

module.exports = mongoose.model('Admin', AdminSchema);
