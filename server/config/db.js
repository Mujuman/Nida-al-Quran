const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const createDefaultMainAdmin = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.warn('Database not connected; skipping default admin creation.');
    return;
  }

  const email = process.env.MAIN_ADMIN_EMAIL || 'teyba@nida.com';
  const username = process.env.MAIN_ADMIN_USERNAME || 'admin';
  const password = process.env.MAIN_ADMIN_PASSWORD || 'muju123@';
  const fullName = process.env.MAIN_ADMIN_FULLNAME || 'System Administrator';
  const phone = process.env.MAIN_ADMIN_PHONE || '+251974155756';

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      if (existingAdmin.role !== 'main_admin') {
        existingAdmin.role = 'main_admin';
        existingAdmin.permissions = {
          ...existingAdmin.permissions,
          manageAdmins: true,
        };
        await existingAdmin.save();
        console.log('Existing admin promoted to main_admin');
      } else {
        console.log('Main admin already exists');
      }
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await Admin.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      role: 'main_admin',
      phone,
      isActive: true,
      permissions: {
        manageUsers: true,
        manageAttendance: true,
        manageCourses: true,
        viewReports: true,
        manageAdmins: true,
      },
    });

    console.log(`Created default main admin (${email})`);
  } catch (err) {
    console.error('Failed to ensure default admin:', err.message);
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGODB_URL;

  if (!mongoUri) {
    console.error('MongoDB connection string not set. Check Vercel environment variables or server/.env.');
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB connected to ${mongoUri}`);

    const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
    if (collections.length === 0) {
      await mongoose.connection.createCollection('users');
      console.log('Users collection created');
    } else {
      console.log('Users collection already exists');
    }

    await createDefaultMainAdmin();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

module.exports = connectDB;
