const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    course: {
      type: String,
    },
    level: {
      type: String,
    },
    schedule: {
      type: String,
    },
    guardian: {
      type: String,
    },
    guardianPhone: {
      type: String,
    },
    learningMedia: {
      type: String,
      enum: ['telegram', 'google-meet', 'skype', 'zoom'],
    },
    message: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    registrationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // Teacher (sub-admin) assigned to this student
    assignedTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    // Main admin toggle to control if the teacher teaches this student
    isTeachingActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', UserSchema);
