const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['inquiry', 'complaint', 'suggestion', 'registration'],
      default: 'inquiry',
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'closed'],
      default: 'new',
    },
    reply: {
      type: String,
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    repliedAt: {
      type: Date,
    },
    isSpam: {
      type: Boolean,
      default: false,
    },
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('Contact', ContactSchema);
