const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const createDefaultMainAdmin = async () => {
  const email = process.env.MAIN_ADMIN_EMAIL || 'admin@nida.com';
  const username = process.env.MAIN_ADMIN_USERNAME || 'admin';
  const password = process.env.MAIN_ADMIN_PASSWORD || 'admin123';
  const fullName = process.env.MAIN_ADMIN_FULLNAME || 'System Administrator';
  const phone = process.env.MAIN_ADMIN_PHONE || '+251911000000';

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
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
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
    process.exit(1);
  }
};

module.exports = connectDB;
