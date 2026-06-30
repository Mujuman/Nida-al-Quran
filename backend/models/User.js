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
    message: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    registrationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { 
    timestamps: true 
  }
);
module.exports = mongoose.model('User', UserSchema);
