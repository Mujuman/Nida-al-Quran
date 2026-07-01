const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware to check if user is authenticated as admin (any role)
const adminAuth = function (req, res, next) {
  let token = req.header('x-auth-token');

  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.admin) {
      return res.status(403).json({ msg: 'Not authorized as admin' });
    }

    req.admin = decoded.admin;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware that only allows main_admin role
const requireMainAdmin = function (req, res, next) {
  if (!req.admin) {
    return res.status(401).json({ msg: 'Not authenticated' });
  }
  if (req.admin.role !== 'main_admin') {
    return res.status(403).json({ msg: 'Access denied. Main admin only.' });
  }
  next();
};

module.exports = adminAuth;
module.exports.requireMainAdmin = requireMainAdmin;
