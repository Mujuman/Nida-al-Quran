const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  createContact,
  getAllContacts,
  getContactById,
  replyContact,
  markAsRead,
  markAsSpam,
  deleteContact,
} = require('../controllers/contactController');

// Public route - anyone can send a contact message
router.post('/', createContact);

// Admin routes - require admin authentication
router.get('/', adminAuth, getAllContacts);
router.get('/:id', adminAuth, getContactById);
router.put('/:id/reply', adminAuth, replyContact);
router.put('/:id/read', adminAuth, markAsRead);
router.put('/:id/spam', adminAuth, markAsSpam);
router.delete('/:id', adminAuth, deleteContact);

module.exports = router;
