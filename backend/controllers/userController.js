const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register user with full details
exports.registerUser = async (req, res) => {
  const { fullName, email, password, phone, age, gender, course, level, schedule, guardian, guardianPhone, message } = req.body;
  
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Create new user
    user = new User({
      fullName,
      email,
      password: hashedPassword,
      phone,
      age,
      gender,
      course,
      level,
      schedule,
      guardian,
      guardianPhone,
      message,
      isVerified: false,
      registrationStatus: 'pending',
    });

    await user.save();

    // Generate token
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        registrationStatus: user.registrationStatus,
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(400).json({ msg: 'Please register first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields
    const { fullName, phone, age, gender, course, level, schedule, guardian, guardianPhone, message } = req.body;
    
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (course) user.course = course;
    if (level) user.level = level;
    if (schedule) user.schedule = schedule;
    if (guardian) user.guardian = guardian;
    if (guardianPhone) user.guardianPhone = guardianPhone;
    if (message) user.message = message;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
