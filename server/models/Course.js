const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: {
      en: { type: String, required: true, trim: true },
      am: { type: String, required: true, trim: true },
    },
    description: {
      en: { type: String, required: true, trim: true },
      am: { type: String, required: true, trim: true },
    },
    features: {
      en: { type: [String], default: [] },
      am: { type: [String], default: [] },
    },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', CourseSchema);
