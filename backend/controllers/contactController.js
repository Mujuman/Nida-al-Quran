const Contact = require('../models/Contact');

// Create Contact Message
exports.createContact = async (req, res) => {
  const { fullName, email, phone, subject, message, type } = req.body;

  try {
    const contact = new Contact({
      fullName,
      email,
      phone,
      subject,
      message,
      type,
      status: 'new',
    });

    await contact.save();
    res.json({ 
      msg: 'Message sent successfully',
      contactId: contact.id 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get All Contact Messages (Admin)
exports.getAllContacts = async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;

    const contacts = await Contact.find(filter).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get Contact by ID
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).populate('repliedBy', 'fullName email');
    if (!contact) {
      return res.status(404).json({ msg: 'Contact not found' });
    }
    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Reply to Contact (Admin)
exports.replyContact = async (req, res) => {
  const { reply } = req.body;

  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ msg: 'Contact not found' });
    }

    contact.reply = reply;
    contact.status = 'replied';
    contact.repliedBy = req.admin.id;
    contact.repliedAt = new Date();

    await contact.save();
    res.json({ msg: 'Reply sent successfully', contact });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Mark as Read (Admin)
exports.markAsRead = async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ msg: 'Contact not found' });
    }

    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }

    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Mark as Spam
exports.markAsSpam = async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ msg: 'Contact not found' });
    }

    contact.isSpam = !contact.isSpam;
    await contact.save();

    res.json({ msg: contact.isSpam ? 'Marked as spam' : 'Unmarked as spam', contact });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete Contact
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ msg: 'Contact not found' });
    }

    res.json({ msg: 'Contact deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
