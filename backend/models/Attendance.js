const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'absent',
    },
    notes: {
      type: String,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { 
    timestamps: true 
  }
);

// Index for efficient querying
AttendanceSchema.index({ student: 1, date: 1, course: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
